"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/invoice';

interface InvoiceItem {
    description: string;
    quantity: number;
    price: number;
}

export default function QuickInvoicePage() {
    const router = useRouter();
    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, price: 0 }
    ]);
    const [loading, setLoading] = useState(false);

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const handleGenerateInvoice = () => {
        if (!customerName || items.length === 0) {
            alert('Please fill customer name and add at least one item');
            return;
        }

        const invoiceData = {
            customerName,
            customerMobile,
            deviceBrand: 'Accessories',
            deviceModel: 'Quick Sale',
            problem: items.map(i => i.description).join(', '),
            estimatedCost: subtotal,
            advance: 0,
            invoiceNumber: `QI-${Date.now().toString().slice(-6)}`
        };

        generateInvoicePDF(invoiceData);
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <FileText className="w-10 h-10 text-green-500" />
                        <div>
                            <h1 className="text-3xl font-bold">Quick Invoice</h1>
                            <p className="text-gray-400">Accessories & Quick Sales Billing</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-gray-400 hover:text-white"
                    >
                        ← Back
                    </button>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Customer Name</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white"
                                placeholder="Walk-in Customer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Mobile Number</label>
                            <input
                                type="tel"
                                value={customerMobile}
                                onChange={(e) => setCustomerMobile(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white"
                                placeholder="Optional"
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Items</h2>
                        <button
                            onClick={addItem}
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-3 items-center">
                                <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                                    className="col-span-6 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white"
                                    placeholder="Item description (e.g., Screen Protector)"
                                />
                                <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                    className="col-span-2 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white text-center"
                                    min="1"
                                />
                                <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                                    className="col-span-3 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white"
                                    placeholder="Price"
                                />
                                <button
                                    onClick={() => removeItem(index)}
                                    className="col-span-1 text-red-400 hover:text-red-300"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals & Actions */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center text-xl mb-6">
                        <span className="text-gray-400">Total:</span>
                        <span className="font-bold text-green-400">₹{subtotal.toLocaleString()}</span>
                    </div>

                    <button
                        onClick={handleGenerateInvoice}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
                    >
                        Generate Invoice (PDF)
                    </button>
                </div>
            </div>
        </div>
    );
}
