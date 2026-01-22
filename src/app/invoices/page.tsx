"use client";

import { useEffect, useState } from 'react';
import { FileText, Printer, Calendar, User } from 'lucide-react';
import { openInvoiceForPrint } from '@/lib/invoice';

interface Invoice {
    id: string;
    invoice_number: string;
    customer_name: string;
    customer_mobile: string;
    device_brand: string;
    device_model: string;
    problem: string;
    estimated_cost: number;
    advance: number;
    balance: number;
    warranty_days: number;
    created_at: string;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/invoices')
            .then(res => res.json())
            .then(data => {
                setInvoices(data.invoices || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handlePrint = (invoice: Invoice) => {
        openInvoiceForPrint({
            customerName: invoice.customer_name,
            customerMobile: invoice.customer_mobile,
            deviceBrand: invoice.device_brand,
            deviceModel: invoice.device_model,
            problem: invoice.problem,
            estimatedCost: invoice.estimated_cost,
            advance: invoice.advance,
            invoiceNumber: invoice.invoice_number,
            warrantyDays: invoice.warranty_days
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading invoices...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Invoices</h1>
                        <p className="text-gray-400">All generated invoices - Click to print</p>
                    </div>
                    <a href="/dashboard" className="text-gray-400 hover:text-white">
                        ← Back to Dashboard
                    </a>
                </div>

                {invoices.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Invoices Yet</h3>
                        <p className="text-gray-500">Invoices will appear here after creating repairs.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {invoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex justify-between items-center hover:border-gray-600 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-600/20 rounded-lg">
                                        <FileText className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">#{invoice.invoice_number}</h3>
                                        <p className="text-gray-400 text-sm flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            {invoice.customer_name} • {invoice.customer_mobile}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1 flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(invoice.created_at).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Total</p>
                                        <p className="font-bold text-green-400">Rs. {invoice.estimated_cost.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-400">Balance</p>
                                        <p className="font-bold text-red-400">Rs. {invoice.balance.toLocaleString('en-IN')}</p>
                                    </div>
                                    <button
                                        onClick={() => handlePrint(invoice)}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
