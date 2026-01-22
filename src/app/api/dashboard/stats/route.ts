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

                chartData = statsResult.rows.map((r: any) => ({
                    name: r.label,
                    revenue: parseFloat(r.amount) || 0
                }));
            }

        } catch (err: any) {
            console.error('Stats query logic error:', err);
        }

        return NextResponse.json({
            revenue,
            todayRevenue,
            pendingBalance,
            activeRepairs,
            repairsThisMonth,
            chartData
        });

    } catch (err: any) {
        console.error('API outer error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
