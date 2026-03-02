import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../services/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Activity, User as UserIcon, LogOut, Dumbbell, CalendarDays, Award, ChevronRight } from 'lucide-react';
import UserActivities from '../components/UserActivities';
import UserProfile from '../components/UserProfile';
import SubscriptionPlan from '../components/SubscriptionPlan';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminUsers from '../components/admin/AdminUsers';
import TrainersList from '../components/TrainersList';
import TrainerProfile from '../components/TrainerProfile';
import TrainerClients from '../components/TrainerClients';

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('activities');
    const [needsBmiSetup, setNeedsBmiSetup] = useState(false);

    const checkBmiStatus = async () => {
        if (user?.role === 'USER' || user?.role === 'ROLE_USER') {
            try {
                const res = await api.get('/user/profile');
                if (!res.data.bmi || !res.data.heightCm || !res.data.weightKg || !res.data.firstName || !res.data.age) {
                    setNeedsBmiSetup(true);
                    if (activeTab !== 'profile') setActiveTab('profile'); // Force to profile tab if not already there
                } else {
                    setNeedsBmiSetup(false);
                }
            } catch (err) {
                console.error("Failed to check BMI status");
            }
        }
    };

    useEffect(() => {
        checkBmiStatus();
    }, [user]); // Re-run if activeTab changes to ensure they stay on profile, but let's just do it on load.

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isTrainer = user?.role === 'TRAINER' || user?.role === 'ROLE_TRAINER';
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN';

    const navItems = isAdmin ? [
        { id: 'admin-dashboard', label: 'Admin Dashboard', icon: <Activity size={20} /> },
        { id: 'admin-users', label: 'Manage Users', icon: <UserIcon size={20} /> }
    ] : isTrainer ? [
        { id: 'profile', label: 'Professional Profile', icon: <UserIcon size={20} /> },
        { id: 'activities', label: 'My Clients/Activities', icon: <Activity size={20} /> }
    ] : [
        { id: 'activities', label: 'Daily Activity', icon: <Activity size={20} /> },
        { id: 'profile', label: 'My Profile & BMI', icon: <UserIcon size={20} /> },
        { id: 'subscription', label: 'Subscription Plan', icon: <Award size={20} /> },
        { id: 'trainers', label: 'View Trainers', icon: <UserIcon size={20} /> },
    ];

    useEffect(() => {
        if (isAdmin && (activeTab === 'activities' || activeTab === 'profile' || activeTab === 'subscription')) {
            setActiveTab('admin-dashboard');
        } else if (isTrainer && (activeTab === 'subscription' || activeTab === 'trainers')) {
            setActiveTab('profile');
        }
    }, [user, isAdmin, isTrainer]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-white border-r border-gray-100 flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Dumbbell size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900">Wellnest</h1>
                        <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">{user?.role?.replace('ROLE_', '')} PORTAL</p>
                    </div>
                </div>

                <div className="px-4 py-6 flex-1">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Menu</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (needsBmiSetup && item.id !== 'profile' && !isTrainer && !isAdmin) {
                                        alert("Please complete your profile by entering your Details, Height, and Weight first!");
                                        return;
                                    }
                                    setActiveTab(item.id)
                                }}
                                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                {activeTab === item.id && <ChevronRight size={16} />}
                            </button>
                        ))}

                        {/* Admin/Trainer specific tabs could go here based on user?.role */}
                    </nav>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="p-4 rounded-xl bg-gray-50 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-lg">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 sticky top-0 z-10 px-8 py-5">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <CalendarDays size={14} />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </header>

                {needsBmiSetup && activeTab === 'profile' && !isTrainer && !isAdmin && (
                    <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 m-8 mb-0 rounded hover:bg-orange-200 cursor-pointer transition-colors" role="alert" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                        <p className="font-bold">Profile Not Completed</p>
                        <p><strong>Click here to complete profile.</strong> Please enter your General Details, Height, and Weight so we can personalize your experience and recommend diet plans based on your age.</p>
                    </div>
                )}

                <div className="p-8 max-w-5xl mx-auto">
                    {activeTab === 'activities' && !isTrainer && <UserActivities />}
                    {activeTab === 'activities' && isTrainer && <TrainerClients />}
                    {activeTab === 'profile' && !isTrainer && !isAdmin && <UserProfile onProfileUpdate={checkBmiStatus} />}
                    {activeTab === 'profile' && isTrainer && <TrainerProfile />}
                    {activeTab === 'subscription' && <SubscriptionPlan />}
                    {activeTab === 'trainers' && <TrainersList />}
                    {activeTab === 'admin-dashboard' && <AdminDashboard />}
                    {activeTab === 'admin-users' && <AdminUsers />}
                </div>
            </main>
        </div>
    );
}
