"use client";
import { useState, useEffect } from 'react';
import { Trash2, TrendingDown } from 'lucide-react';

interface Expenditure {
    id: number;
    category: string;
    amount: string;
    description: string;
    date: string;
}

export function ExpenditureList({ lastUpdate }: { lastUpdate?: number }) {
    const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExpenditures = async () => {
        try {
            const res = await fetch('/api/expenditure');
            if (res.ok) {
                const data = await res.json();
                setExpenditures(data);
            }
        } catch (error) {
            console.error('Failed to fetch expenditures', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenditures();
    }, [lastUpdate]);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this expenditure?')) return;

        try {
            const res = await fetch(`/api/expenditure?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setExpenditures(prev => prev.filter(e => e.id !== id));
            } else {
                alert('Failed to delete expenditure');
            }
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    if (loading) return <div className="text-gray-400 text-sm">Loading recent...</div>;

    if (expenditures.length === 0) {
        return <div className="text-gray-500 text-sm text-center py-4">No recent expenditures</div>;
    }

    return (
        <div className="space-y-3 mt-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Expenses</h4>
            {expenditures.slice(0, 10).map((exp) => (
                <div key={exp.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">{exp.description || exp.category}</p>
                            <p className="text-gray-500 text-xs">
                                {new Date(exp.date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-white font-semibold text-sm">₹{parseFloat(exp.amount).toLocaleString('en-IN')}</span>
                        <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1.5 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg opacity-70 hover:opacity-100 transition-all"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
