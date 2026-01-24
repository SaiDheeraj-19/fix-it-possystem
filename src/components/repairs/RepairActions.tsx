"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, CheckCircle, Truck, XCircle, Clock, Trash2, Wallet, Pencil } from 'lucide-react';
import { openInvoiceForPrint } from '@/lib/invoice';

interface RepairActionsProps {
    repairId: string;
    currentStatus: string;
    repair: any;
}

export function RepairActions({ repairId, currentStatus, repair }: RepairActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    // Parse images if they exist
    const repairImages = Array.isArray(repair.images) ? repair.images : [];
    // Some old records might have strings or JSON stringified?
    // Current new form sends base64 strings in array. Old data might be different. 
    // Let's assume array of strings (base64 or filenames).

    const balance = (repair.estimated_cost || 0) - (repair.advance || 0);
    const isBalanceCollected = !!repair.balance_collected_at;

    const updateStatus = async (newStatus: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/repairs/${repairId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            alert('Error updating status');
        } finally {
            setLoading(false);
        }
    };

    const collectBalance = async () => {
        if (!confirm(`Mark Rs. ${balance} as COLLECTED?`)) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/repairs/${repairId}/collect-balance`, {
                method: 'POST'
            });
            if (res.ok) {
                router.refresh();
            } else {
                alert('Failed to collect balance');
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteRepair = async () => {
        if (!confirm('Are you sure you want to PERMANENTLY DELETE this repair record? This cannot be undone.')) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/repairs/${repairId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                router.push('/repairs');
            } else {
                alert('Failed to delete repair');
            }
        } catch (err) {
            alert('Error deleting repair');
        } finally {
            setLoading(false);
        }
    };

    const prepareInvoice = () => {
        // If no images, just print
        if (repairImages.length === 0) {
            handlePrint([]);
        } else {
            setShowInvoiceModal(true);
        }
    };

    const handlePrint = (imagesToPrint: string[]) => {
        openInvoiceForPrint({
            customerName: repair.customer_name,
            customerMobile: repair.customer_phone,
            deviceBrand: repair.device_brand,
            deviceModel: repair.device_model,
            problem: repair.problem,
            estimatedCost: repair.estimated_cost,
            advance: repair.advance,
            invoiceNumber: repairId.slice(0, 8),
            warrantyDays: repair.warranty_days || 0, // Using warranty text directly if string
            // Pass images
            images: imagesToPrint
        });
        setShowInvoiceModal(false);
    };

    const statusButtons = [
        { status: 'PENDING', label: 'Mark In Progress', icon: Clock, color: 'bg-yellow-600 hover:bg-yellow-700' },
        { status: 'REPAIRED', label: 'Mark Repaired', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
        { status: 'DELIVERED', label: 'Mark Delivered', icon: Truck, color: 'bg-blue-600 hover:bg-blue-700' },
        { status: 'CANCELLED', label: 'Cancel Order', icon: XCircle, color: 'bg-red-600 hover:bg-red-700' },
    ];

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-300">Actions</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3">
                {/* Print Invoice */}
                <button
                    onClick={prepareInvoice}
                    className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-bold transition-all active:scale-95"
                >
                    <Printer className="w-5 h-5" />
                    Print Invoice
                </button>

                {/* Collect Balance Button Removed as per request (Auto-collects on Delivery) */}
                {/* 
                {balance > 0 && !isBalanceCollected && currentStatus !== 'CANCELLED' && (
                    <button ... > ... </button>
                )} 
                */}

                {balance > 0 && isBalanceCollected && (
                    <div className="flex items-center justify-center gap-2 bg-purple-900/30 text-purple-400 px-4 py-3 rounded-xl font-bold border border-purple-500/30">
                        <CheckCircle className="w-5 h-5" />
                        Balance Collected
                    </div>
                )}

                {/* Status Update Buttons */}
                {statusButtons.map(({ status, label, icon: Icon, color }) => (
                    currentStatus !== status && status !== 'CANCELLED' && (
                        <button
                            key={status}
                            onClick={() => updateStatus(status)}
                            disabled={loading}
                            className={`flex items-center justify-center gap-2 ${color} text-white px-4 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50`}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </button>
                    )
                ))}

                {/* Edit Button */}
                <button
                    onClick={() => router.push(`/repairs/${repairId}/edit`)}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-blue-900/20 hover:bg-blue-900/40 text-blue-500 px-4 py-3 rounded-xl font-bold transition-all border border-blue-900/50"
                >
                    <Pencil className="w-5 h-5" />
                    Edit Order
                </button>

                {/* Delete Button */}
                <button
                    onClick={deleteRepair}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 px-4 py-3 rounded-xl font-bold transition-all border border-red-900/50"
                >
                    <Trash2 className="w-5 h-5" />
                    Delete Order
                </button>
            </div>

            {currentStatus === 'DELIVERED' && (
                <p className="mt-4 text-green-400 text-sm">✓ This repair has been completed and delivered.</p>
            )}
            {currentStatus === 'CANCELLED' && (
                <p className="mt-4 text-red-400 text-sm">✗ This repair order was cancelled.</p>
            )}

            {/* Invoice Image Selection Modal */}
            {showInvoiceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                    <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl max-w-lg w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Select Images for Invoice</h3>
                        <p className="text-gray-400 text-sm mb-4">Select which images you want to print on the invoice details.</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {repairImages.map((img: string, idx: number) => {
                                // Check if it's base64 or url
                                const isSelected = selectedImages.includes(img);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            if (isSelected) setSelectedImages(prev => prev.filter(i => i !== img));
                                            else setSelectedImages(prev => [...prev, img]);
                                        }}
                                        className={`relative cursor-pointer border-2 rounded-lg overflow-hidden h-32 ${isSelected ? 'border-blue-500' : 'border-gray-700'}`}
                                    >
                                        <img src={img} alt={`Device ${idx}`} className="w-full h-full object-cover" />
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowInvoiceModal(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handlePrint(selectedImages)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                            >
                                Print Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
