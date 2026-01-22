"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus, Shield, User, Mail, ArrowLeft, Loader2, Trash2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showResetForm, setShowResetForm] = useState<{ id: string, name: string } | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STAFF' });
    const [resetPassword, setResetPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowAddForm(false);
                setFormData({ name: '', email: '', password: '', role: 'STAFF' });
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to add user');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showResetForm) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: showResetForm.id, password: resetPassword })
            });
            if (res.ok) {
                setShowResetForm(null);
                setResetPassword('');
                alert('Password updated successfully!');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to reset password');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;
        try {
            const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchUsers();
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to delete user');
            }
        } catch (e) {
            alert('Error deleting user');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
                            <p className="text-gray-400">Manage access and multiple logins for your store.</p>
                        </div>
                    </div>

                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-xl font-semibold"
                    >
                        <UserPlus className="w-5 h-5 mr-2" /> Add New Staff
                    </Button>
                </div>

                {/* Reset Password Modal */}
                {showResetForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <form onSubmit={handleResetPassword} className="bg-gray-900 border border-gray-700 p-8 rounded-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-bold mb-2">Change Password</h2>
                            <p className="text-gray-400 text-sm mb-6">Setting new password for <b>{showResetForm.name}</b></p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-400 mb-1 block">New Password</label>
                                    <input
                                        required type="password"
                                        className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-blue-500 outline-none"
                                        placeholder="Enter new password"
                                        value={resetPassword}
                                        onChange={e => setResetPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <Button
                                    type="button"
                                    onClick={() => setShowResetForm(null)}
                                    variant="ghost"
                                    className="flex-1 h-12 text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : 'Update Password'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {showAddForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <form onSubmit={handleAddUser} className="bg-gray-900 border border-gray-700 p-8 rounded-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-bold mb-6">Register New User</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-400 mb-1 block">Full Name</label>
                                    <input
                                        required
                                        className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-blue-500 outline-none"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-400 mb-1 block">Email Address</label>
                                    <input
                                        required type="email"
                                        className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-blue-500 outline-none"
                                        placeholder="email@fixit.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-400 mb-1 block">Password</label>
                                    <input
                                        required type="password"
                                        className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-blue-500 outline-none"
                                        placeholder="Minimum 6 characters"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-400 mb-1 block">Role</label>
                                    <select
                                        className="w-full bg-black border border-gray-700 rounded-xl p-3 focus:border-blue-500 outline-none"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="STAFF">Staff (Cashier/Technician)</option>
                                        <option value="ADMIN">Admin (Full Access)</option>
                                    </select>
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
                                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : 'Create Account'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center p-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map(user => (
                            <div key={user.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 group hover:border-blue-500/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${user.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                        {user.role === 'ADMIN' ? <Shield className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => setShowResetForm({ id: user.id, name: user.name })}
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-blue-500/50 hover:text-blue-500 hover:bg-blue-500/10"
                                        >
                                            <Key className="w-4 h-4" />
                                        </Button>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-1">{user.name}</h3>
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                    <Mail className="w-4 h-4" />
                                    {user.email}
                                </div>
                                <div className="pt-4 border-t border-gray-800 text-[10px] text-gray-500 flex justify-between items-center">
                                    <span>Registered Member</span>
                                    <Button
                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-red-500/50 hover:text-red-500 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
