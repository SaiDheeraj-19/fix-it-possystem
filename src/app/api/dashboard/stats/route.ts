import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const generateId = () => globalThis.crypto.randomUUID();
export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'WEEK';

        // Get current date in IST as string YYYY-MM-DD
        const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD format

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
            // Total realized revenue (Repairs realized cash + All Accessory Sales)
            const realizedAdvances = await query("SELECT COALESCE(SUM(advance), 0) as total FROM repairs");
            const realizedBalances = await query("SELECT COALESCE(SUM(estimated_cost - advance), 0) as total FROM repairs WHERE balance_collected_at IS NOT NULL");
            const realizedSales = await query("SELECT COALESCE(SUM(total_price), 0) as total FROM sales").catch(() => ({ rows: [{ total: 0 }] }));

            revenue = (parseFloat(realizedAdvances.rows[0].total) || 0) +
                (parseFloat(realizedBalances.rows[0].total) || 0) +
                (parseFloat(realizedSales.rows[0].total) || 0);

            // Today's Realized Revenue:
            // 1. Advance payments made today
            // 2. Balance payments collected today
            // 3. Store sales today
            const todayAdvanceResult = await query(
                "SELECT COALESCE(SUM(advance), 0) as total FROM repairs WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE = $1::DATE",
                [todayIST]
            );
            const todayBalanceResult = await query(
                "SELECT COALESCE(SUM(estimated_cost - advance), 0) as total FROM repairs WHERE (balance_collected_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE = $1::DATE",
                [todayIST]
            );
            const todaySalesResult = await query(
                "SELECT COALESCE(SUM(total_price), 0) as total FROM sales WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE = $1::DATE",
                [todayIST]
            ).catch(() => ({ rows: [{ total: 0 }] }));

            todayRevenue = (parseFloat(todayAdvanceResult.rows[0].total) || 0) +
                (parseFloat(todayBalanceResult.rows[0].total) || 0) +
                (parseFloat(todaySalesResult.rows[0].total) || 0);

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
                "SELECT COUNT(*) as count FROM repairs WHERE created_at >= date_trunc('month', CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')"
            );
            repairsThisMonth = parseInt(monthResult.rows[0].count) || 0;

            // Chart Data: Should show realized cash (Advances + Balanced Collected + Sales) for each day
            const chartInterval = period === 'MONTH' ? '30 days' : '7 days';
            const chartResult = await query(`
                WITH DailyStats AS (
                    -- Daily Advances
                    SELECT 
                        (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE as date,
                        SUM(advance) as amount
                    FROM repairs 
                    WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata' - INTERVAL '${chartInterval}')
                    GROUP BY 1
                    
                    UNION ALL
                    
                    -- Daily Collected Balances
                    SELECT 
                        (balance_collected_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE as date,
                        SUM(estimated_cost - advance) as amount
                    FROM repairs 
                    WHERE (balance_collected_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata' - INTERVAL '${chartInterval}')
                    GROUP BY 1

                    UNION ALL
                    
                    -- Daily Accessory/Store Sales
                    SELECT 
                        (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata')::DATE as date,
                        SUM(total_price) as amount
                    FROM sales 
                    WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata' - INTERVAL '${chartInterval}')
                    GROUP BY 1
                )
                SELECT 
                    to_char(date, '${period === 'MONTH' ? 'DD Mon' : 'Dy'}') as name,
                    COALESCE(SUM(amount), 0) as revenue
                FROM DailyStats
                GROUP BY date, name
                ORDER BY date
            `).catch(() => ({ rows: [] }));
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
