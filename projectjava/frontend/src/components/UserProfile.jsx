import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Activity, Edit2, Check, Scale, Ruler, Sparkles, AlertCircle, Utensils } from 'lucide-react';

export default function UserProfile({ onProfileUpdate }) {
    const [profile, setProfile] = useState(null);
    const [diet, setDiet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        age: '',
        gender: '',
        phoneNumber: '',
        heightCm: '',
        weightKg: ''
    });

    const fetchProfile = async () => {
        try {
            const res = await api.get('/user/profile');
            setProfile(res.data);
            setFormData({
                firstName: res.data.firstName || '',
                lastName: res.data.lastName || '',
                age: res.data.age || '',
                gender: res.data.gender || '',
                phoneNumber: res.data.phoneNumber || '',
                heightCm: res.data.heightCm || '',
                weightKg: res.data.weightKg || ''
            });

            if (res.data.bmi && res.data.age) {
                const dietRes = await api.get('/user/diet');
                setDiet(dietRes.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const h = parseFloat(formData.heightCm);
        const w = parseFloat(formData.weightKg);

        if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
            setErrorMessage('Please enter valid positive numbers for height and weight.');
            return;
        }

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                age: parseInt(formData.age, 10),
                gender: formData.gender,
                phoneNumber: formData.phoneNumber,
                heightCm: h,
                weightKg: w
            };

            await api.put('/user/profile', payload);

            try {
                await api.post('/bmi/record', {
                    heightCm: h,
                    weightKg: w
                });
            } catch (e) {
                console.warn("BMI record non-critical failure.", e);
            }

            setEditing(false);
            setSuccessMessage('Profile and Metrics updated successfully!');
            await fetchProfile();

            // Notify parent dashboard to hide the banner if complete
            if (onProfileUpdate) {
                onProfileUpdate();
            }

            // clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Failed to update profile', err);
            setErrorMessage(err.response?.data?.message || 'Failed to update profile details. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Calculate BMI Category visually
    const getBmiCategory = (bmi) => {
        if (!bmi) return { label: 'Not calculated', color: 'gray' };
        if (bmi < 18.5) return { label: 'Underweight', color: 'blue' };
        if (bmi >= 18.5 && bmi < 24.9) return { label: 'Normal weight', color: 'green' };
        if (bmi >= 25 && bmi < 29.9) return { label: 'Overweight', color: 'orange' };
        return { label: 'Obese', color: 'red' };
    };

    const bmiData = getBmiCategory(profile?.bmi);

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Background Accents */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-4xl shadow-xl shadow-primary/20">
                            {profile?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center mt-3">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold tracking-wider uppercase">
                                {profile?.role}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <h2 className="text-2xl font-bold text-gray-900">{profile?.username}</h2>
                        <p className="text-gray-500 mb-6">{profile?.email}</p>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Current BMI</p>
                                <div className="flex items-end gap-3">
                                    <h3 className="text-4xl font-black text-gray-900 leading-none">
                                        {profile?.bmi || '--'}
                                    </h3>
                                    {profile?.bmi && (
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${bmiData.color === 'green' ? 'bg-green-100 text-green-700' :
                                            bmiData.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                bmiData.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {bmiData.label}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="hidden md:block w-px h-16 bg-gray-200"></div>

                            <div className="flex gap-8">
                                <div>
                                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                        <User size={16} />
                                        <span className="text-sm font-medium">Age</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 text-right">{profile?.age || '--'} <span className="text-sm font-normal text-gray-500">yrs</span></p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                        <User size={16} />
                                        <span className="text-sm font-medium">Gender</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 text-right capitalize">{profile?.gender || '--'}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                        <Scale size={16} />
                                        <span className="text-sm font-medium">Weight</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 text-right">{profile?.weightKg || '--'} <span className="text-sm font-normal text-gray-500">kg</span></p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                        <Ruler size={16} />
                                        <span className="text-sm font-medium">Height</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 text-right">{profile?.heightCm || '--'} <span className="text-sm font-normal text-gray-500">cm</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles size={20} className="text-primary" />
                        Body Metrics
                    </h3>
                    <button
                        onClick={() => setEditing(!editing)}
                        className="text-primary font-semibold hover:text-primary-hover flex items-center gap-1.5 transition-colors"
                    >
                        {editing ? null : <><Edit2 size={16} /> Edit Metrics</>}
                    </button>
                </div>

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 border border-green-100">
                        <Check size={20} className="text-green-600" />
                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100">
                        <AlertCircle size={20} className="text-red-600" />
                        <span className="font-medium">{errorMessage}</span>
                    </div>
                )}

                {editing ? (
                    <form onSubmit={handleUpdate} className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">First Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Last Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Age (Years)</label>
                                <input
                                    type="number"
                                    required
                                    className="input-field"
                                    value={formData.age}
                                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Gender</label>
                                <select
                                    className="input-field appearance-none bg-white font-medium"
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="input-field"
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Height (cm)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        className="input-field pr-12"
                                        value={formData.heightCm}
                                        onChange={e => setFormData({ ...formData, heightCm: e.target.value })}
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 font-medium">cm</span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Weight (kg)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        className="input-field pr-12"
                                        value={formData.weightKg}
                                        onChange={e => setFormData({ ...formData, weightKg: e.target.value })}
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 font-medium">kg</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => setEditing(false)}
                                className="px-6 py-3 rounded-xl font-semibold text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary w-auto flex items-center gap-2"
                            >
                                <Check size={18} />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-500">
                        Keep your general details, weight, and height up to date to ensure your calculations are accurate. This helps in providing better fitness tracking and dietary recommendations.
                    </p>
                )}
            </div>

            {diet && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100 shadow-sm mt-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/40 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="p-3 bg-green-100 text-green-700 rounded-xl">
                            <Utensils size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                Personalized Diet Plan
                                <span className="text-xs px-2.5 py-1 bg-green-200 text-green-800 rounded-lg uppercase tracking-wider font-bold shadow-sm">Goal: {diet.fitnessGoal || 'Maintenance'}</span>
                            </h3>
                            <p className="text-sm text-green-800 mt-1">{diet.message}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 relative z-10">
                        {diet.schedule?.map((item, idx) => (
                            <div key={idx} className="bg-white/70 backdrop-blur-sm border border-green-200/50 p-4 rounded-2xl">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-green-800 mb-2">{item.meal}</h4>
                                <p className="text-gray-700 font-medium">{item.food}</p>
                            </div>
                        ))}
                    </div>

                    {diet.dailyTasks?.length > 0 && (
                        <div className="mt-8 relative z-10">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-green-900 mb-4 opacity-80">Recommended Daily Routine</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {diet.dailyTasks.map((task, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white/50 border border-green-200/50 p-3 rounded-xl shadow-sm backdrop-blur-sm transition hover:bg-white/80">
                                        <div className="p-1.5 bg-green-200 rounded text-green-700"><Check size={14} /></div>
                                        <span className="text-sm font-medium text-gray-800">{task}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
