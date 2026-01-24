"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShoppingCart, Tag, User, Phone, Package, Plus, Search, Trash2, Pencil } from 'lucide-react';
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
        paymentMode: 'CASH'
    });

    const [customCategory, setCustomCategory] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const categories = ['Accessories', 'Tempered Glass', 'Back Cover', 'Charger/Cable', 'Components', , 'Add'];

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

        const finalCategory = formData.category === 'Add' ? customCategory : formData.category;

        if (formData.category === 'Add' && !customCategory.trim()) {
            alert("Please enter a custom category name");
            setSubmitting(false);
            return;
        }

        try {
            const url = editingId ? '/api/sales' : '/api/sales';
            const method = editingId ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                category: finalCategory,
                price: parseFloat(formData.price)
            };

            if (editingId) {
                (payload as any).id = editingId;
            }

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setShowAddForm(false);
                setFormData({
                    itemName: '',
                    category: 'Accessories',
                    quantity: 1,
                    price: '',
                    paymentMode: 'CASH'
                });
                setFormData({
                    itemName: '',
                    category: 'Accessories',
                    quantity: 1,
                    price: '',
                    paymentMode: 'CASH'
                });
                setCustomCategory('');
                setEditingId(null);
                fetchSales();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to record sale');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this sale record?')) return;

        try {
            const res = await fetch(`/api/sales?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchSales();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
            }
        } catch (err) {
            alert('Error deleting');
        }
    };

    const handleEdit = (sale: any) => {
        setFormData({
            itemName: sale.item_name,
            category: sale.category,
            quantity: sale.quantity,
            price: sale.price_per_unit,
            paymentMode: sale.payment_mode || 'CASH'
        });
        setEditingId(sale.id);
        setShowAddForm(true);
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
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                itemName: '',
                                category: 'Accessories',
                                quantity: 1,
                                price: '',
                                paymentMode: 'CASH'
                            });
                            setShowAddForm(true);
                        }}
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
                                <h2 className="text-2xl font-bold">{editingId ? 'Edit Sale' : 'Record Sale'}</h2>
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
                                    <div className={formData.category === 'Add' ? "col-span-2" : ""}>
                                        <label className="text-sm font-medium text-gray-400 mb-1 block">Category</label>
                                        <div className="flex gap-2">
                                            <select
                                                className={`bg-black border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none appearance-none ${formData.category === 'Add' ? 'w-1/3' : 'w-full'}`}
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            {formData.category === 'Add' && (
                                                <input
                                                    autoFocus
                                                    placeholder="Enter Category"
                                                    className="w-2/3 bg-black border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none animate-in fade-in slide-in-from-left-2"
                                                    value={customCategory}
                                                    onChange={(e) => setCustomCategory(e.target.value)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    {formData.category !== 'Add' && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-400 mb-1 block">Quantity</label>
                                            <input
                                                required type="number" min="1"
                                                className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none"
                                                value={formData.quantity}
                                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Quantity Field for 'Add' mode (moved out of grid to keep layout clean) */}
                                {formData.category === 'Add' && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-400 mb-1 block">Quantity</label>
                                        <input
                                            required type="number" min="1"
                                            className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-green-500 outline-none"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                )}

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

                                <div>
                                    <label className="text-sm font-medium text-gray-400 mb-1 block">Payment Mode</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['CASH', 'UPI', 'CARD'].map(mode => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, paymentMode: mode })}
                                                className={`p-3 rounded-xl text-sm font-bold transition-all border ${formData.paymentMode === mode ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/40 scale-105' : 'bg-black border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                                            >
                                                {mode}
                                            </button>
                                        ))}
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
                                    {submitting ? <Loader2 className="animate-spin" /> : (editingId ? 'Update Sale' : 'Confirm Sale')}
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
                                    <div key={sale.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group hover:border-green-500/30 transition-all">
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className="p-2.5 bg-gray-800 rounded-xl shrink-0">
                                                <Tag className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-base md:text-lg font-bold text-white truncate">{sale.item_name}</h3>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className="text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 rounded bg-green-900/30 text-green-400 uppercase tracking-wider">{sale.category}</span>
                                                    <span className="text-[10px] md:text-xs text-gray-500">{sale.quantity} x Rs. {parseFloat(sale.price_per_unit).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                                            <div className="flex flex-col items-start md:items-end">
                                                <div className="text-xl md:text-2xl font-black text-white">Rs. {parseFloat(sale.total_price).toLocaleString('en-IN')}</div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-600 font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${sale.payment_mode === 'UPI' ? 'bg-purple-500/20 text-purple-400' : sale.payment_mode === 'CARD' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                                                            {sale.payment_mode || 'CASH'}
                                                        </span>
                                                    </div>
                                                    <span>•</span>
                                                    <div>{new Date(sale.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short' })}</div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleEdit(sale)}
                                                className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
                                            >
                                                <Pencil className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sale.id)}
                                                className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                            </button>
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
