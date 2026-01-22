import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { StaffDashboard } from '@/components/dashboard/StaffDashboard';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/');
    }

    // Strictly enforce hard rules: Admin gets analytics, Staff gets ops.
    return (
        <div className="min-h-screen bg-black text-white p-6">
            <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-blue-500">FIX IT <span className="text-white text-lg font-normal">| Kalluru (091829 19360)</span></h1>
                    <p className="text-gray-400 text-sm">Logged in as {session.username} ({session.role})</p>
                </div>
                <a href="/api/auth/logout" className="text-red-400 hover:text-red-300 text-sm font-semibold">
                    LOGOUT
                </a>
            </header>

            <main>
                {session.role === 'ADMIN' ? (
                    <AdminDashboard />
                ) : (
                    <StaffDashboard />
                )}
            </main>
        </div>
    );
}
