import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Activity, Award, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to load admin dashboard dashboard", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const StatCard = ({ title, value, icon, color }) => (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10`}>
                <div className={color.replace('bg-', 'text-').replace('-500', '-600')}>{icon}</div>
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{value || 0}</h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
                    <p className="text-gray-500 mt-1">Key metrics and statistics for the Wellnest platform</p>
                </div>
                <button
                    onClick={() => {
                        setIsRefreshing(true);
                        fetchDashboard();
                    }}
                    disabled={isRefreshing}
                    className="bg-primary/10 text-primary px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-50"
                >
                    <TrendingUp size={20} className={isRefreshing ? "animate-pulse" : ""} />
                    {isRefreshing ? "Updating..." : "Live Analytics"}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Connects"
                    value={stats?.totalUsers}
                    icon={<Users size={28} />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Activities Logged"
                    value={stats?.totalActivities}
                    icon={<Activity size={28} />}
                    color="bg-green-500"
                />
                <StatCard
                    title="Active Plans"
                    value={stats?.totalSubscriptions}
                    icon={<Award size={28} />}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : '0.00'}`}
                    icon={<DollarSign size={28} />}
                    color="bg-emerald-500"
                />
            </div>
        </div>
    );
}
