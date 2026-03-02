import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/reset-password', { email, otp, newPassword });
            setMessage(res.data.message);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-primary/10 text-primary rounded-full mb-4">
                        <KeyRound size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        {step === 1 ? 'Enter your email to receive an OTP code.' :
                            step === 2 ? 'Enter the 6-digit OTP sent to your email.' :
                                'Password reset successful!'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center">
                        {error}
                    </div>
                )}
                {message && step !== 3 && (
                    <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100 text-center flex justify-center items-center gap-2">
                        <CheckCircle2 size={16} /> {message}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold flex justify-center items-center gap-2 hover:bg-primary-hover transition-colors">
                            {loading ? 'Sending...' : 'Send OTP'} <ArrowRight size={18} />
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">OTP Code</label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold flex justify-center items-center gap-2 hover:bg-primary-hover transition-colors">
                            {loading ? 'Resetting...' : 'Reset Password'} <CheckCircle2 size={18} />
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <CheckCircle2 size={64} className="text-green-500" />
                        </div>
                        <p className="text-gray-600">Your password was changed successfully.</p>
                        <button onClick={() => navigate('/login')} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors">
                            Back to Login
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
                        Return to sign in
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
