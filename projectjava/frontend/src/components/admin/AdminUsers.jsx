import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Loader2, Shield, UserX, UserCheck, Eye, Trash2 } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Fetch users error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/admin/user/${id}/status?isEnabled=${!currentStatus}`);
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
        try {
            await api.delete(`/admin/user/${id}`);
            fetchUsers();
            if (selectedUser?.id === id) setSelectedUser(null);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUserDetails = async (user) => {
        setSelectedUser(user);
        setDetailsLoading(true);
        try {
            const res = await api.get(`/admin/user/${user.id}/details`);
            setUserDetails(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setDetailsLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
                    <p className="text-gray-500 mt-1">View, suspend, or oversee user accounts and trainers</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">User</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">
                                            <Loader2 className="animate-spin mx-auto mb-2" />
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">No users found.</td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{u.username}</div>
                                                <div className="text-sm text-gray-500">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                    u.role === 'TRAINER' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-lg flex items-center gap-1 w-max ${typeof u.isEnabled === 'undefined' || u.isEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {typeof u.isEnabled === 'undefined' || u.isEnabled ? <UserCheck size={14} /> : <UserX size={14} />}
                                                    {typeof u.isEnabled === 'undefined' || u.isEnabled ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => fetchUserDetails(u)}
                                                        className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    {u.role !== 'ADMIN' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleToggleStatus(u.id, typeof u.isEnabled === 'undefined' ? true : u.isEnabled)}
                                                                className="p-2 text-gray-400 hover:text-orange-500 transition-colors hover:bg-orange-50 rounded-lg"
                                                                title={typeof u.isEnabled === 'undefined' || u.isEnabled ? "Suspend User" : "Activate User"}
                                                            >
                                                                {typeof u.isEnabled === 'undefined' || u.isEnabled ? <UserX size={18} /> : <UserCheck size={18} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(u.id)}
                                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
                                                                title="Delete User"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Details Panel */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-max sticky top-24">
                    {selectedUser ? (
                        detailsLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Loader2 className="animate-spin mb-3" size={32} />
                                <p>Loading deep profile data...</p>
                            </div>
                        ) : userDetails ? (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center justify-between">
                                    User Profile
                                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 rounded">ID: {selectedUser.id}</span>
                                </h3>

                                <div className="space-y-4">
                                    {selectedUser.role === 'TRAINER' ? (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Professional Details</p>
                                            <div className="grid grid-cols-3 gap-2 text-center border border-gray-100 rounded-xl p-3 bg-gray-50">
                                                <div>
                                                    <p className="text-xl font-bold text-gray-900">{userDetails.profile?.experienceYears || '0'}</p>
                                                    <p className="text-xs text-gray-500">Years Exp.</p>
                                                </div>
                                                <div className="col-span-2 flex flex-col items-center justify-center">
                                                    <p className="text-sm font-bold text-gray-900 line-clamp-1 truncate w-full" title={userDetails.profile?.specialization}>
                                                        {userDetails.profile?.specialization || '--'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5">Specialization</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-center border border-gray-100 rounded-xl p-3 bg-gray-50">
                                                <p className="text-sm font-bold text-gray-900" title={userDetails.profile?.certifications}>{userDetails.profile?.certifications || '--'}</p>
                                                <p className="text-xs text-gray-500">Certifications</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Metrics</p>
                                            <div className="grid grid-cols-3 gap-2 text-center border border-gray-100 rounded-xl p-3 bg-gray-50">
                                                <div>
                                                    <p className="text-xl font-bold">{userDetails.profile?.bmi || '--'}</p>
                                                    <p className="text-xs text-gray-500">BMI</p>
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold">{userDetails.profile?.heightCm || '--'}</p>
                                                    <p className="text-xs text-gray-500">Height</p>
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold">{userDetails.profile?.weightKg || '--'}</p>
                                                    <p className="text-xs text-gray-500">Weight</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Account History</p>
                                        <ul className="text-sm space-y-2">
                                            <li className="flex justify-between border-b border-gray-50 pb-1">
                                                <span className="text-gray-500">BMI Logs</span>
                                                <span className="font-semibold text-gray-900">{userDetails.bmiHistory?.length || 0} records</span>
                                            </li>
                                            <li className="flex justify-between border-b border-gray-50 pb-1">
                                                <span className="text-gray-500">Activities Logged</span>
                                                <span className="font-semibold text-gray-900">{userDetails.activities?.length || 0} workouts</span>
                                            </li>
                                            <li className="flex justify-between border-b border-gray-50 pb-1">
                                                <span className="text-gray-500">Active Plan</span>
                                                <span className="font-semibold text-gray-900">
                                                    {userDetails.subscriptions?.find(s => s.isActive)?.planType || "None"}
                                                </span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                        >
                                            Close Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-red-500 text-center py-8">Failed to load profile data.</p>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-center">
                            <Shield size={48} className="mb-4 opacity-50 text-gray-300" />
                            <p className="font-medium text-gray-600">No User Selected</p>
                            <p className="text-sm mt-1">Select a user from the list to view their deep profile metrics and history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
