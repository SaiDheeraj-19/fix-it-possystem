"use client";
import { useState } from 'react';
import { Package } from 'lucide-react';
import { ExpenditureList } from './ExpenditureList';

export function StockUpdateWidget({ onUpdate }: { onUpdate?: () => void }) {
    const [item, setItem] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!item || !amount) return;

        setLoading(true);
        try {
            const res = await fetch('/api/expenditure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: 'STOCK',
                    description: item,
                    amount: parseFloat(amount),
                    date: new Date().toISOString()
                })
            });

            if (res.ok) {
                setItem('');
                setAmount('');
                setLastUpdate(Date.now());
                if (onUpdate) onUpdate();
            } else {
                console.error('Failed to update stock');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col h-full overflow-hidden">
            <div className="flex-shrink-0">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Package className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Stock Update</h3>
                        <p className="text-gray-400 text-sm">Add generic expenditure</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        placeholder="Item Description"
                        className="w-full bg-black/40 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                        value={item}
                        onChange={(e) => setItem(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Amount (₹)"
                        className="w-full bg-black/40 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-600"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-colors"
                    >
                        {loading ? 'Adding...' : 'Add Expenditure'}
                    </button>
                </form>
            </div>

            <div className="flex-1 mt-2 overflow-y-auto">
                <ExpenditureList lastUpdate={lastUpdate} />
            </div>
        </div>
    );
}
