"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShoppingCart, Tag, User, Phone, Package, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SalesPage() {
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        itemName: '',
        category: 'Accessories',
        quantity: 1,
        price: '',
        customerName: '',
        customerPhone: ''
    });

    const categories = ['Accessories', 'Tempered Glass', 'Back Cover', 'Charger/Cable', 'Components', 'Used Phone', 'Other'];

    const fetchSales = async () => {
        try {
            const res = await fetch('/api/sales');
            if (res.ok) {
                const data = await res.json();
                setSales(data.sales);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleAddSale = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price)
                })
            });
            if (res.ok) {
                setShowAddForm(false);
                setFormData({
                    itemName: '',
                    category: 'Accessories',
                    quantity: 1,
                    price: '',
                    customerName: '',
                    customerPhone: ''
                });
                fetchSales();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to record sale');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">In-Store Sales</h1>
                            <p className="text-gray-400">Record and track sales of accessories and parts.</p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="bg-green-600 hover:bg-green-700 h-11 px-6 rounded-xl font-semibold shadow-lg shadow-green-900/20"
                    >
                        <Plus className="w-5 h-5 mr-2" /> New Quick Sale
                    </Button>
                </div>

                {showAddForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <form onSubmit={handleAddSale} className="bg-gray-900 border border-gray-700 p-8 rounded-2xl max-w-md w-full animate-in zoom-in-95 duration-200 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-green-500/10 rounded-xl">
                                    <ShoppingCart className="w-6 h-6 text-green-400" />
                                </div>
                                <h2 className="text-2xl font-bold">Record Sale</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-400 mb-1 block">Item Name / Service</label>
                                    <input
                                        required
                                        className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none transition-colors"
                                        placeholder="e.g. iPhone 13 Back Cover"
                                        value={formData.itemName}
                                        onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-400 mb-1 block">Category</label>
                                        <select
                                            className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none appearance-none"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-400 mb-1 block">Quantity</label>
                                        <input
                                            required type="number" min="1"
                                            className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-400 mb-1 block">Selling Price (Per Unit)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-500">Rs.</span>
                                        <input
                                            required type="number"
                                            className="w-full bg-black border border-gray-700 rounded-xl p-3 pl-12 focus:border-green-500 outline-none"
                                            placeholder="0"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="text-sm font-medium text-gray-400 mb-1 block italic whitespace-nowrap overflow-hidden text-ellipsis">Customer Details (Optional)</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-green-500 outline-none"
                                            placeholder="Name"
                                            value={formData.customerName}
                                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                                        />
                                        <input
                                            className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm focus:border-green-500 outline-none"
                                            placeholder="Mobile"
                                            value={formData.customerPhone}
                                            onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <Button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    variant="ghost"
                                    className="flex-1 h-12 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : 'Confirm Sale'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center p-20">
                        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sales.length === 0 ? (
                            <div className="text-center py-20 bg-gray-900/30 border border-dashed border-gray-800 rounded-3xl">
                                <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-500">No sales recorded yet.</p>
                                <Button variant="link" className="text-green-500" onClick={() => setShowAddForm(true)}>Record your first sale</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {sales.map(sale => (
                                    <div key={sale.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-green-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gray-800 rounded-xl">
                                                <Tag className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{sale.item_name}</h3>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-900/30 text-green-400 uppercase tracking-wider">{sale.category}</span>
                                                    <span className="text-xs text-gray-500">{sale.quantity} x Rs. {parseFloat(sale.price_per_unit).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                                            <div className="text-2xl font-black text-white">Rs. {parseFloat(sale.total_price).toLocaleString('en-IN')}</div>
                                            <div className="flex items-center gap-3 text-[10px] text-gray-600 font-medium">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" /> {sale.customer_name || 'Walk-in'}
                                                </div>
                                                <span>•</span>
                                                <div>{new Date(sale.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
