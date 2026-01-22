import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'WEEK';

        let revenue = 0;
        let todayRevenue = 0;
        let pendingBalance = 0;
        let activeRepairs = 0;
        let repairsThisMonth = 0;
        let chartData: { name: string; revenue: number }[] = [];

        try {
            // Total confirmed revenue (Delivered items) - NOTE: User said revenue is not updating.
            // Usually revenue is recognized when status is DELIVERED. 
            // If user wants ALL repairs revenue even if not delivered, we remove the WHERE clause, 
            // but usually 'revenue' implies realized money. "Pending Balance" covers the rest.
            // Total realized revenue (All advances + All collected balances)
            const realizedAdvances = await query("SELECT COALESCE(SUM(advance), 0) as total FROM repairs");
            const realizedBalances = await query("SELECT COALESCE(SUM(estimated_cost - advance), 0) as total FROM repairs WHERE balance_collected_at IS NOT NULL");
            revenue = (parseFloat(realizedAdvances.rows[0].total) || 0) + (parseFloat(realizedBalances.rows[0].total) || 0);

            // Today's Realized Revenue:
            // 1. Advance payments made today (based on created_at)
            // 2. Balance payments collected today (based on balance_collected_at)
            const todayAdvanceResult = await query(
                "SELECT COALESCE(SUM(advance), 0) as total FROM repairs WHERE DATE(created_at) = CURRENT_DATE"
            );
            const todayBalanceResult = await query(
                "SELECT COALESCE(SUM(estimated_cost - advance), 0) as total FROM repairs WHERE DATE(balance_collected_at) = CURRENT_DATE"
            );

            todayRevenue = (parseFloat(todayAdvanceResult.rows[0].total) || 0) + (parseFloat(todayBalanceResult.rows[0].total) || 0);

            // Pending balances: Sum of (cost - advance) for all active repairs where balance hasn't been collected yet
            const pendingResult = await query(
                "SELECT COALESCE(SUM(estimated_cost - advance), 0) as total FROM repairs WHERE status NOT IN ('DELIVERED', 'CANCELLED') AND balance_collected_at IS NULL"
            );
            pendingBalance = parseFloat(pendingResult.rows[0].total) || 0;

            // Active repairs count
            const activeResult = await query(
                "SELECT COUNT(*) as count FROM repairs WHERE status NOT IN ('DELIVERED', 'CANCELLED')"
            );
            activeRepairs = parseInt(activeResult.rows[0].count) || 0;

            // Repairs this month
            const monthResult = await query(
                "SELECT COUNT(*) as count FROM repairs WHERE created_at >= date_trunc('month', CURRENT_DATE)"
            );
            repairsThisMonth = parseInt(monthResult.rows[0].count) || 0;

            // Chart Data: Should show realized cash (Advances + Balanced Collected) for each day
            const chartInterval = period === 'MONTH' ? '30 days' : '7 days';
            const chartResult = await query(`
                WITH DailyStats AS (
                    -- Daily Advances
                    SELECT 
                        DATE(created_at) as date,
                        SUM(advance) as amount
                    FROM repairs 
                    WHERE created_at >= CURRENT_DATE - INTERVAL '${chartInterval}'
                    GROUP BY DATE(created_at)
                    
                    UNION ALL
                    
                    -- Daily Collected Balances
                    SELECT 
                        DATE(balance_collected_at) as date,
                        SUM(estimated_cost - advance) as amount
                    FROM repairs 
                    WHERE balance_collected_at >= CURRENT_DATE - INTERVAL '${chartInterval}'
                    GROUP BY DATE(balance_collected_at)
                )
                SELECT 
                    to_char(date, '${period === 'MONTH' ? 'DD Mon' : 'Dy'}') as name,
                    COALESCE(SUM(amount), 0) as revenue
                FROM DailyStats
                GROUP BY date, name
                ORDER BY date
            `);
            chartData = chartResult.rows.map((r: any) => ({
                name: r.name,
                revenue: parseFloat(r.revenue) || 0
            }));

        } catch (err: any) {
            console.log('Stats query error:', err.message);
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
