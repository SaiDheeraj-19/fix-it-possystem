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
            const revenueResult = await query(
                "SELECT COALESCE(SUM(estimated_cost), 0) as total FROM repairs WHERE status = 'DELIVERED'"
            );
            revenue = parseFloat(revenueResult.rows[0].total) || 0;

            // Ensure column exists for queries
            try {
                await query('ALTER TABLE repairs ADD COLUMN IF NOT EXISTS balance_collected_at TIMESTAMP');
            } catch (e) {
                // Ignore
            }

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

            // Pending balances
            const pendingResult = await query(
                "SELECT COALESCE(SUM(estimated_cost - advance), 0) as total FROM repairs WHERE status NOT IN ('DELIVERED', 'CANCELLED')"
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

            // Chart Data based on period
            if (period === 'MONTH') {
                const chartResult = await query(`
          SELECT 
            to_char(created_at, 'DD Mon') as name,
            COALESCE(SUM(estimated_cost), 0) as revenue
          FROM repairs 
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY to_char(created_at, 'DD Mon'), date_trunc('day', created_at)
          ORDER BY date_trunc('day', created_at)
        `);
                chartData = chartResult.rows.map((r: any) => ({
                    name: r.name,
                    revenue: parseFloat(r.revenue) || 0
                }));
            } else {
                // Default WEEK
                const chartResult = await query(`
          SELECT 
            to_char(created_at, 'Dy') as name,
            COALESCE(SUM(estimated_cost), 0) as revenue
          FROM repairs 
          WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
          GROUP BY to_char(created_at, 'Dy'), date_trunc('day', created_at)
          ORDER BY date_trunc('day', created_at)
        `);
                chartData = chartResult.rows.map((r: any) => ({
                    name: r.name,
                    revenue: parseFloat(r.revenue) || 0
                }));
            }

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
