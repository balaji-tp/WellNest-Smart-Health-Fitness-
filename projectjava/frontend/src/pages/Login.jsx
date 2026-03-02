import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../services/AuthContext';
import { Dumbbell, Activity, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const { login, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
            navigate('/dashboard');
        } catch (err) {
            setError(err);
        }
    };

    const handleGoogleError = () => {
        setError('Google Login Failed');
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Panel - Image & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
                {/* Background Image (Placeholder for fitness vibe) */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')" }}
                />

                {/* Gradient Overlay for better text readability */}
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                {/* Content */}
                <div className="relative z-10 w-full p-12 flex flex-col justify-between">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
                            <div className="p-2 bg-primary rounded-xl">
                                <Activity size={24} className="text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tight">Wellnest</span>
                        </Link>
                    </div>

                    <div className="max-w-md pb-12">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
                        >
                            Push harder than yesterday if you want a different tomorrow.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="text-lg text-gray-300 font-light"
                        >
                            Track your progress, join the community, and transform your body with our premium training tools.
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-y-auto">
                {/* Mobile Background Decoration */}
                <div className="lg:hidden absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
                    <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary blur-[120px]" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-2xl text-primary">
                            <Activity size={32} />
                        </div>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h1>
                        <p className="text-gray-500 mt-2">Sign in to continue your fitness journey</p>
                    </div>

                    {error && (
                        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Username or Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    placeholder="Enter your username or email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <Link to="/forgot-password" className="text-sm text-primary font-medium hover:text-primary-hover transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-11 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-gray-900/20 mt-6"
                        >
                            <span>Sign In</span>
                            <Dumbbell size={18} />
                        </button>
                    </form>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Or continue with</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <div className="mt-8 flex items-center justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            theme="outline"
                            size="large"
                            width="100%"
                        />
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-gray-600 font-medium">
                            New to Wellnest?{' '}
                            <Link to="/signup" className="text-primary font-bold hover:text-primary-hover transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
