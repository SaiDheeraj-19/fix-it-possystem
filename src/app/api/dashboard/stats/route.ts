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
            const statsResult = await query(`
                WITH RECURSIVE Dates AS (
                    SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE - INTERVAL '${chartDays - 1} days' as d
                    UNION ALL
                    SELECT d + INTERVAL '1 day' FROM Dates WHERE d < (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE
                ),
                DailyRevenue AS (
                    SELECT date, SUM(amount) as amount FROM (
                        SELECT (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE as date, advance as amount FROM repairs
                        UNION ALL
                        SELECT (balance_collected_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE as date, (estimated_cost - advance) as amount FROM repairs WHERE balance_collected_at IS NOT NULL
                        UNION ALL
                        SELECT (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE as date, total_price as amount FROM sales
                    ) s GROUP BY 1
                ),
                GlobalStats AS (
                    SELECT
                        -- Total Realized Revenue (All time)
                        (SELECT COALESCE(SUM(advance), 0) FROM repairs) +
                        (SELECT COALESCE(SUM(estimated_cost - advance), 0) FROM repairs WHERE balance_collected_at IS NOT NULL) +
                        (SELECT COALESCE(SUM(total_price), 0) FROM sales) as total_revenue,
                        
                        -- Today's Revenue (IST)
                        (SELECT COALESCE(SUM(amount), 0) FROM DailyRevenue WHERE date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE) as today_revenue,
                        
                        -- Pending Collections
                        (SELECT COALESCE(SUM(estimated_cost - advance), 0) FROM repairs WHERE status NOT IN ('DELIVERED', 'CANCELLED') AND balance_collected_at IS NULL) as pending_balance,
                        
                        -- Active Repairs
                        (SELECT COUNT(*) FROM repairs WHERE status NOT IN ('DELIVERED', 'CANCELLED')) as active_repairs,
                        
                        -- Repairs this month
                        (SELECT COUNT(*) FROM repairs WHERE created_at >= date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')) as repairs_this_month
                )
                SELECT 
                    to_char(D.d, '${period === 'MONTH' ? 'DD Mon' : 'Dy'}') as name,
                    COALESCE(R.amount, 0) as amount,
                    D.d as raw_date,
                    (SELECT total_revenue FROM GlobalStats) as total_revenue,
                    (SELECT today_revenue FROM GlobalStats) as today_revenue,
                    (SELECT pending_balance FROM GlobalStats) as pending_balance,
                    (SELECT active_repairs FROM GlobalStats) as active_repairs,
                    (SELECT repairs_this_month FROM GlobalStats) as repairs_this_month
                FROM Dates D
                LEFT JOIN DailyRevenue R ON D.d = R.date
                ORDER BY D.d ASC
            `);

            if (statsResult.rows.length > 0) {
                const global = statsResult.rows[0];
                revenue = parseFloat(global.total_revenue) || 0;
                todayRevenue = parseFloat(global.today_revenue) || 0;
                pendingBalance = parseFloat(global.pending_balance) || 0;
                activeRepairs = parseInt(global.active_repairs) || 0;
                repairsThisMonth = parseInt(global.repairs_this_month) || 0;

                chartData = statsResult.rows.map((r: any) => ({
                    name: r.name,
                    revenue: parseFloat(r.revenue) || 0
                }));
            }

        } catch (err: any) {
            console.error('Stats query error:', err);
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
        console.error('Dashboard stats error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
