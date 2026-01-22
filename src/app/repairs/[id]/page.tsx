import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, Smartphone, Calendar, Shield, Lock, History } from 'lucide-react';
import { RepairActions } from '@/components/repairs/RepairActions';
import { decrypt } from '@/lib/crypto';
import { SecurityLockInputs } from '@/components/SecurityLockInputs';

async function getRepair(id: string) {
    try {
        const result = await query('SELECT * FROM repairs WHERE id = $1', [id]);
        if (result.rowCount === 0) return null;
        return result.rows[0];
    } catch (err) {
        return null;
    }
}

async function getCustomerHistory(phone: string, currentRepairId: string) {
    try {
        const result = await query(
            'SELECT id, device_brand, device_model, problem, status, created_at FROM repairs WHERE customer_phone = $1 AND id != $2 ORDER BY created_at DESC LIMIT 5',
            [phone, currentRepairId]
        );
        return result.rows;
    } catch (err) {
        return [];
    }
}

export default async function RepairDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) redirect('/');

    const repair = await getRepair(params.id);

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

    // Get customer repair history
    const customerHistory = await getCustomerHistory(repair.customer_phone, repair.id);

    // Decrypt security info if exists
    let securityData = { type: 'NONE' as any, value: '' };

    if (repair.pin_encrypted && repair.pin_iv) {
        try {
            const decrypted = decrypt({ content: repair.pin_encrypted, iv: repair.pin_iv });
            securityData = { type: 'PIN', value: decrypted };
        } catch (e) {
            securityData = { type: 'PIN', value: '' };
        }
    } else if (repair.pattern_encrypted && repair.pattern_iv) {
        try {
            const decrypted = decrypt({ content: repair.pattern_encrypted, iv: repair.pattern_iv });
            securityData = { type: 'PATTERN', value: decrypted };
        } catch (e) {
            securityData = { type: 'PATTERN', value: '' };
        }
    } else if (repair.password_encrypted && repair.password_iv) {
        try {
            const decrypted = decrypt({ content: repair.password_encrypted, iv: repair.password_iv });
            securityData = { type: 'PASSWORD', value: decrypted };
        } catch (e) {
            securityData = { type: 'PASSWORD', value: '' };
        }
    }

    const balance = !!repair.balance_collected_at ? 0 : (repair.estimated_cost || 0) - (repair.advance || 0);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'PENDING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'REPAIRED': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'DELIVERED': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link href="/repairs" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Repairs
                    </Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">{repair.device_brand} {repair.device_model}</h1>
                            <p className="text-gray-400">Order #{repair.id.slice(0, 8)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(repair.status)}`}>
                                {repair.status}
                            </span>
                            {repair.created_at && (
                                <span className="text-xs text-gray-500">
                                    {new Date(repair.created_at).toLocaleString('en-IN', {
                                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Customer Info & Billing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">Customer Details</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-900/20 rounded-lg shrink-0">
                                    <Smartphone className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Customer Name</p>
                                    <p className="text-white font-medium text-lg">{repair.customer_name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-green-900/20 rounded-lg shrink-0">
                                    <Phone className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Mobile Number</p>
                                    <p className="text-white font-medium text-lg tracking-wide">{repair.customer_phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">Billing</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Estimated Cost</span>
                                <span className="text-white font-medium">Rs. {(repair.estimated_cost || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Advance Paid</span>
                                <span className="text-green-400 font-medium">- Rs. {(repair.advance || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                                <span className="text-white font-semibold">{!!repair.balance_collected_at ? 'Balance Paid' : 'Balance Due'}</span>
                                <span className={`${!!repair.balance_collected_at ? 'text-green-400' : 'text-red-400'} font-bold text-2xl`}>Rs. {balance.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Problem & Security */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4">Device Info</h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Problem Description</p>
                                <p className="text-white bg-gray-800 p-3 rounded-lg min-h-[60px]">{repair.problem || 'No description provided'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {repair.imei && (
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">IMEI (Last 4)</p>
                                        <p className="text-white font-mono bg-gray-800 px-3 py-2 rounded-lg">{repair.imei}</p>
                                    </div>
                                )}

                                {repair.warranty && (
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">Warranty</p>
                                        <p className="text-green-400 font-bold bg-green-900/20 border border-green-800 px-3 py-2 rounded-lg">
                                            {repair.warranty}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Images Display */}
                        {repair.images && repair.images.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <p className="text-gray-400 text-sm mb-2">Attached Images</p>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {repair.images.map((img: string, idx: number) => (
                                        <div key={idx} className="h-20 w-20 shrink-0 rounded-lg overflow-hidden border border-gray-700">
                                            <img src={img} alt={`Device Image ${idx + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Security Lock Info */}
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2 self-start w-full">
                            <Lock className="w-5 h-5 text-yellow-400" />
                            Security Lock
                        </h3>
                        {securityData.type !== 'NONE' && securityData.value ? (
                            <div className="w-full max-w-xs">
                                <SecurityLockInputs
                                    initialMode={(securityData.type as any)}
                                    initialValue={securityData.value}
                                    readOnly={true}
                                />
                            </div>
                        ) : (
                            <div className="text-gray-500 text-center py-12 flex flex-col items-center">
                                <div className="p-4 bg-gray-800 rounded-full mb-3">
                                    <Lock className="w-8 h-8 text-gray-600" />
                                </div>
                                <p>No security lock recorded</p>
                                <p className="text-xs mt-1">or Customer Refused</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Customer History */}
                {customerHistory.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-purple-400" />
                            Previous Repairs ({customerHistory.length})
                        </h3>
                        <div className="space-y-3">
                            {customerHistory.map((prev: any) => (
                                <Link
                                    key={prev.id}
                                    href={`/repairs/${prev.id}`}
                                    className="block bg-gray-800 hover:bg-gray-700 rounded-lg p-4 transition-colors group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-white font-medium group-hover:text-blue-400 transition-colors">{prev.device_brand} {prev.device_model}</p>
                                            <p className="text-gray-400 text-sm mt-1">{prev.problem}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(prev.status)}`}>
                                                {prev.status}
                                            </span>
                                            <p className="text-gray-500 text-xs mt-2">
                                                {new Date(prev.created_at).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <RepairActions repairId={repair.id} currentStatus={repair.status} repair={repair} />
            </div>
        </div >
    );
}
