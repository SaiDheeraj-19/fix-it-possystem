import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { StaffDashboard } from '@/components/dashboard/StaffDashboard';
import { AnniversaryPopup, AnniversaryBanner } from '@/components/AnniversaryCelebration';
import { RepublicDayPopup, RepublicDayBanner } from '@/components/RepublicDayCelebration';

export default async function DashboardPage() {
    const session = await getSession();
    // const session = { role: 'ADMIN', username: 'PreviewUser' }; // Mock session

    if (!session) {
        redirect('/');
    }

    // Strictly enforce hard rules: Admin gets analytics, Staff gets ops.
    return (
        <div className="min-h-screen bg-black text-white p-6">
            <RepublicDayPopup />
            <AnniversaryPopup />
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-800 pb-4">
                <div className="w-full md:w-auto">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-blue-500 flex flex-wrap items-baseline gap-2">
                        FIX IT
                        <span className="text-gray-500 text-sm md:text-lg font-normal">| Kalluru (091829 19360)</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <p className="text-gray-400 text-xs md:text-sm capitalize font-medium">Logged in as {(session as any).username} {((session as any).role as string)?.toLowerCase()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {session.role === 'ADMIN' && (
                        <a
                            href="https://www.fixitkurnool.in/admin"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 px-4 py-2 rounded-lg text-xs font-bold transition-colors border border-blue-500/20"
                        >
                            FIXIT STORE
                        </a>
                    )}
                    <a href="/api/auth/logout" className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-xs font-bold transition-colors">
                        LOGOUT
                    </a>
                </div>
            </header>

            <RepublicDayBanner />
            <AnniversaryBanner />

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
