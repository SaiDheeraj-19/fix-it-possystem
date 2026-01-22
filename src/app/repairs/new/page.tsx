import { NewRepairForm } from "@/components/repairs/NewRepairForm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewRepairPage() {
    const session = await getSession();
    if (!session) {
        redirect('/');
    }

    // Allow both ADMIN and STAFF to create repairs
    if (session.role !== 'ADMIN' && session.role !== 'STAFF') {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-20">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-blue-400 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white">
                        New Repair Order
                    </h1>
                    <p className="text-gray-500">Capture customer details, device info, and security pattern.</p>
                </div>

                <NewRepairForm userId={session.id as string} />
            </div>
        </div>
    );
}
