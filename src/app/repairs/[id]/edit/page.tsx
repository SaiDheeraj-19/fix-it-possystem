import { NewRepairForm } from "@/components/repairs/NewRepairForm";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { decrypt } from "@/lib/crypto";

async function getRepair(id: string) {
    try {
        const result = await query('SELECT * FROM repairs WHERE id = $1', [id]);
        if (result.rowCount === 0) return null;
        return result.rows[0];
    } catch (err) {
        return null;
    }
}

export default async function EditRepairPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) redirect('/');

    // Check permissions
    if (session.role !== 'ADMIN' && session.role !== 'STAFF') {
        redirect('/');
    }

    const repair = await getRepair(params.id);

    if (repair) {
        // Decrypt Security Fields
        try {
            if (repair.pin_encrypted && repair.pin_iv) {
                repair.pin = decrypt({ content: repair.pin_encrypted, iv: repair.pin_iv });
            }
            if (repair.pattern_encrypted && repair.pattern_iv) {
                repair.pattern = decrypt({ content: repair.pattern_encrypted, iv: repair.pattern_iv });
            }
            if (repair.password_encrypted && repair.password_iv) {
                repair.password = decrypt({ content: repair.password_encrypted, iv: repair.password_iv });
            }
        } catch (e) {
            console.error("Failed to decrypt security fields", e);
        }

        // Normalize for Form
        if (repair.pin) {
            repair.securityMode = 'PIN';
            repair.securityValue = repair.pin;
        } else if (repair.pattern) {
            repair.securityMode = 'PATTERN';
            repair.securityValue = repair.pattern;
        } else if (repair.password) {
            repair.securityMode = 'PASSWORD';
            repair.securityValue = repair.password;
        } else {
            repair.securityMode = 'NONE';
            repair.securityValue = '';
        }
    }

    if (!repair) {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Repair Not Found</h1>
                    <Link href="/repairs" className="text-blue-400 hover:underline">
                        ← Back to Repairs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-20">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href={`/repairs/${repair.id}`} className="inline-flex items-center text-gray-400 hover:text-blue-400 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Order
                    </Link>
                    <h1 className="text-3xl font-bold text-white">
                        Edit Repair Order
                    </h1>
                    <p className="text-gray-500">Update customer details, device info, and pricing.</p>
                </div>

                <NewRepairForm userId={session.id as string} initialData={repair} repairId={repair.id} />
            </div>
        </div>
    );
}
