import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'WEEK';
        const chartDays = period === 'MONTH' ? 30 : 7;

        let revenue = 0;
        let todayRevenue = 0;
        let pendingBalance = 0;
        let activeRepairs = 0;
        let repairsThisMonth = 0;
        let chartData: any[] = [];

        try {
            // Get all stats in one powerful query to avoid calculation mismatches
            const statsResult = await query(`
                WITH RECURSIVE Dates AS (
                    -- Generate the last 7 (or 30) days in IST
                    SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE - INTERVAL '${chartDays - 1} days' as d
                    UNION ALL
                    SELECT d + INTERVAL '1 day' FROM Dates WHERE d < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE
                ),
                -- Helper to convert any timestamp to IST Date
                RawData AS (
                    SELECT 
                        -- For repairs, we treat 'created_at' as the source for Advances
                        (CASE 
                            WHEN created_at IS NULL THEN NULL 
                            ELSE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE 
                        END) as advance_date,
                        advance,
                        -- For balance collections, we use the specific collection timestamp
                        (CASE 
                            WHEN balance_collected_at IS NULL THEN NULL 
                            ELSE (balance_collected_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE 
                        END) as collection_date,
                        (estimated_cost - advance) as balance_amount
                    FROM repairs
                ),
                SalesData AS (
                    SELECT 
                        (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE as sale_date,
                        total_price
                    FROM sales
                ),
                DailyRevenue AS (
                    -- Combine all income streams into a single daily summary
                    SELECT ist_date, SUM(amount) as amount FROM (
                        SELECT advance_date as ist_date, advance as amount FROM RawData WHERE advance_date IS NOT NULL
                        UNION ALL
                        SELECT collection_date as ist_date, balance_amount as amount FROM RawData WHERE collection_date IS NOT NULL
                        UNION ALL
                        SELECT sale_date as ist_date, total_price as amount FROM SalesData WHERE sale_date IS NOT NULL
                    ) t
                    GROUP BY 1
                ),
                Summary AS (
                    SELECT
                        -- Global Totals
                        (SELECT COALESCE(SUM(amount), 0) FROM DailyRevenue) as total_revenue,
                        
                        -- Today's Revenue (IST)
                        (SELECT COALESCE(SUM(amount), 0) FROM DailyRevenue WHERE ist_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE) as today_revenue,
                        
                        -- Real-time Operational Stats
                        (SELECT COALESCE(SUM(estimated_cost - advance), 0) FROM repairs WHERE status NOT IN ('DELIVERED', 'CANCELLED') AND balance_collected_at IS NULL) as pending_balance,
                        (SELECT COUNT(*) FROM repairs WHERE status NOT IN ('DELIVERED', 'CANCELLED')) as active_repairs,
                        (SELECT COUNT(*) FROM repairs WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE >= date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE) as monthly_count
                )
                -- Final output: Continuous chart data + summary stats attached to the first row
                SELECT 
                    to_char(D.d, '${period === 'MONTH' ? 'DD' : 'Dy'}') as label,
                    COALESCE(R.amount, 0) as amount,
                    D.d::DATE as ist_date,
                    (SELECT total_revenue FROM Summary) as total_rev,
                    (SELECT today_revenue FROM Summary) as today_rev,
                    (SELECT pending_balance FROM Summary) as pending_bal,
                    (SELECT active_repairs FROM Summary) as active_count,
                    (SELECT monthly_count FROM Summary) as month_count
                FROM Dates D
                LEFT JOIN DailyRevenue R ON D.d::DATE = R.ist_date
                ORDER BY D.d ASC
            `);

            if (statsResult.rows.length > 0) {
                const global = statsResult.rows[0];
                revenue = parseFloat(global.total_rev) || 0;
                todayRevenue = parseFloat(global.today_rev) || 0;
                pendingBalance = parseFloat(global.pending_bal) || 0;
                activeRepairs = parseInt(global.active_count) || 0;
                repairsThisMonth = parseInt(global.month_count) || 0;

                // --- TREND DATA (Time Series) ---
                const trendData = statsResult.rows.map((r: any) => ({
                    name: r.label,
                    revenue: parseFloat(r.amount) || 0
                }));

                // --- CATEGORY DATA (Pie Chart) ---
                const startDateInterval = chartDays + ' days';

                const chartQuery = `
                    WITH RelevantSales AS (
                        SELECT category, total_price as amount 
                        FROM sales 
                        WHERE created_at >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') - INTERVAL '${startDateInterval}'
                    ),
                    RelevantRepairs AS (
                        -- Advances collected in period
                        SELECT 'Repairs' as category, advance as amount
                        FROM repairs
                        WHERE created_at >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') - INTERVAL '${startDateInterval}'
                        
                        UNION ALL
                        
                        -- Balances collected in period
                        SELECT 'Repairs' as category, (estimated_cost - advance) as amount
                        FROM repairs
                        WHERE balance_collected_at >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') - INTERVAL '${startDateInterval}'
                    ),
                    Combined AS (
                        SELECT category, amount FROM RelevantSales
                        UNION ALL
                        SELECT category, amount FROM RelevantRepairs
                    )
                    SELECT category as name, SUM(amount) as revenue
                    FROM Combined
                    GROUP BY category
                    ORDER BY revenue DESC
                `;

                const chartResult = await query(chartQuery);
                const categoryData = chartResult.rows.map((r: any) => ({
                    name: r.name || 'Uncategorized',
                    revenue: parseFloat(r.revenue) || 0
                }));

                // Fallback for empty pie chart
                if (categoryData.length === 0) {
                    // Empty array is fine, UI handles it or shows placeholder
                }

                // --- TODAY SPLIT (CASH vs UPI) ---
                const todayRes = await query(`
                    WITH TodaySales AS (
                        SELECT payment_mode, total_price as amount
                        FROM sales
                        WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE
                    ),
                    TodayRepairs AS (
                        -- Advances
                        SELECT payment_mode_advance as payment_mode, advance as amount
                        FROM repairs
                        WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE
                        
                        UNION ALL
                        
                        -- Balances
                        SELECT payment_mode_balance as payment_mode, (estimated_cost - advance) as amount
                        FROM repairs
                        WHERE balance_collected_at IS NOT NULL 
                        AND (balance_collected_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE
                    ),
                    CombinedToday AS (
                        SELECT payment_mode, amount FROM TodaySales
                        UNION ALL
                        SELECT payment_mode, amount FROM TodayRepairs
                    )
                    SELECT 
                        SUM(CASE WHEN payment_mode = 'CASH' THEN amount ELSE 0 END) as cash,
                        SUM(CASE WHEN payment_mode = 'UPI' THEN amount ELSE 0 END) as upi,
                        SUM(CASE WHEN payment_mode = 'CARD' THEN amount ELSE 0 END) as card
                    FROM CombinedToday
                `);

                const todayCash = parseFloat(todayRes.rows[0]?.cash || 0);
                const todayUPI = parseFloat(todayRes.rows[0]?.upi || 0);
                const todayCard = parseFloat(todayRes.rows[0]?.card || 0);


                // --- PERIOD BREAKDOWN (CASH vs UPI vs CARD for the chart period) ---
                const periodBreakdownRes = await query(`
                    WITH PeriodSales AS (
                        SELECT payment_mode, total_price as amount
                        FROM sales
                        WHERE created_at >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') - INTERVAL '${startDateInterval}'
                    ),
                    PeriodRepairs AS (
                        -- Advances
                        SELECT payment_mode_advance as payment_mode, advance as amount
                        FROM repairs
                        WHERE created_at >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') - INTERVAL '${startDateInterval}'
                        
                        UNION ALL
                        
                        -- Balances
                        SELECT payment_mode_balance as payment_mode, (estimated_cost - advance) as amount
                        FROM repairs
                        WHERE balance_collected_at >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') - INTERVAL '${startDateInterval}'
                    ),
                    CombinedPeriod AS (
                        SELECT payment_mode, amount FROM PeriodSales
                        UNION ALL
                        SELECT payment_mode, amount FROM PeriodRepairs
                    )
                    SELECT 
                        SUM(CASE WHEN payment_mode = 'CASH' THEN amount ELSE 0 END) as cash,
                        SUM(CASE WHEN payment_mode = 'UPI' THEN amount ELSE 0 END) as upi,
                        SUM(CASE WHEN payment_mode = 'CARD' THEN amount ELSE 0 END) as card
                    FROM CombinedPeriod
                `);

                const periodCash = parseFloat(periodBreakdownRes.rows[0]?.cash || 0);
                const periodUPI = parseFloat(periodBreakdownRes.rows[0]?.upi || 0);
                const periodCard = parseFloat(periodBreakdownRes.rows[0]?.card || 0);

                // --- EXPENDITURE STATS ---
                // Calculate expenditures for the same period
                const expenditureRes = await query(`
                    SELECT 
                        COALESCE(SUM(amount), 0) as period_total,
                        COALESCE(SUM(CASE WHEN (date AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE THEN amount ELSE 0 END), 0) as today_total
                    FROM expenditures
                    WHERE date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') - INTERVAL '${startDateInterval}'
                `);

                const periodExpenditure = parseFloat(expenditureRes.rows[0]?.period_total || 0);
                const todayExpenditure = parseFloat(expenditureRes.rows[0]?.today_total || 0);
                const periodProfit = revenue - periodExpenditure;
                const todayProfit = todayRevenue - todayExpenditure;

                return NextResponse.json({
                    revenue,
                    todayRevenue,
                    todayCash,
                    todayUPI,
                    todayCard,
                    periodCash,
                    periodUPI,
                    periodCard,
                    pendingBalance,

                    // New Expenditure Stats
                    periodExpenditure,
                    todayExpenditure,
                    periodProfit,
                    todayProfit,

                    activeRepairs,
                    repairsThisMonth,
                    trendData,
                    categoryData
                });
            }

        } catch (err: any) {
            console.error('Stats query logic error - FULL DETAILS:', err);
            if (err.message) console.error('Message:', err.message);
            if (err.stack) console.error('Stack:', err.stack);
            if (err.detail) console.error('Postgres Detail:', err.detail);
        }

        // Fallback response inside catch or if raw query failed
        console.log('Returning fallback zero-stats due to error.');
        return NextResponse.json({
            revenue: 0,
            todayRevenue: 0,
            todayCash: 0,
            todayUPI: 0,
            todayCard: 0,
            periodCash: 0,
            periodUPI: 0,
            periodCard: 0,
            pendingBalance: 0,

            periodExpenditure: 0,
            todayExpenditure: 0,
            periodProfit: 0,
            todayProfit: 0,

            activeRepairs: 0,
            repairsThisMonth: 0,
            trendData: [],
            categoryData: []
        });

    } catch (err: any) {
        console.error('API outer error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
