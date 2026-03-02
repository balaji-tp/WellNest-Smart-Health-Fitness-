import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../services/AuthContext';
import { Dumbbell, Activity, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Default role
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password, role);
            // Registration complete, navigate to login
            navigate('/login');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                <div className="absolute top-[10%] left-[10%] w-[60%] h-[60%] rounded-full bg-secondary blur-[120px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[50%] h-[50%] rounded-full bg-primary blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md p-8 sm:p-10 glass-effect rounded-3xl"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 mb-4 bg-white/20 rounded-full text-gray-800 shadow-sm border border-white/40">
                        <Dumbbell size={28} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Join Wellnest</h1>
                    <p className="text-gray-500 mt-2">Start your premium fitness experience</p>
                </div>

                {error && (
                    <div className="p-3 mb-6 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center animate-pulse">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 ml-1">Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field pl-11"
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 ml-1">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field pl-11"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field pl-11 pr-11"
                                placeholder="Create a strong password"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 ml-1">Account Type</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="input-field w-full pl-4"
                        >
                            <option value="user">User</option>
                            <option value="trainer">Trainer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary mt-8 flex items-center justify-center gap-2 py-3.5">
                        <span>Create Account</span>
                        <Activity size={18} />
                    </button>
                </form>

                <div className="mt-8 text-center pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:text-primary-hover transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
