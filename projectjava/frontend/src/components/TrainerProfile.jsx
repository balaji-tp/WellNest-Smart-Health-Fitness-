import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Edit2, Check, AlertCircle, Award, Star, Briefcase } from 'lucide-react';

export default function TrainerProfile() {
    const [profile, setProfile] = useState(null);
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
        experienceYears: '',
        specialization: '',
        certifications: ''
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
                experienceYears: res.data.experienceYears || '',
                specialization: res.data.specialization || '',
                certifications: res.data.certifications || ''
            });
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

        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                age: formData.age ? parseInt(formData.age, 10) : null,
                gender: formData.gender,
                phoneNumber: formData.phoneNumber,
                experienceYears: formData.experienceYears ? parseInt(formData.experienceYears, 10) : null,
                specialization: formData.specialization,
                certifications: formData.certifications
            };

            await api.put('/user/profile', payload);

            setEditing(false);
            setSuccessMessage('Professional profile updated successfully!');
            await fetchProfile();

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

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
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
                            <div className="flex gap-8 w-full justify-around">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-2">
                                        <Briefcase size={16} />
                                        <span className="text-sm font-medium">Experience</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">{profile?.experienceYears || '--'} <span className="text-sm font-normal text-gray-500">yrs</span></p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-2">
                                        <Star size={16} />
                                        <span className="text-sm font-medium">Specialty</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900 capitalize">{profile?.specialization || '--'}</p>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-gray-500 mb-2">
                                        <Award size={16} />
                                        <span className="text-sm font-medium">Certifications</span>
                                    </div>
                                    <p className="text-xl font-bold text-gray-900">{profile?.certifications ? 'Yes' : '--'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <User size={20} className="text-primary" />
                        Professional Details
                    </h3>
                    <button
                        onClick={() => setEditing(!editing)}
                        className="text-primary font-semibold hover:text-primary-hover flex items-center gap-1.5 transition-colors"
                    >
                        {editing ? null : <><Edit2 size={16} /> Edit Profile</>}
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
                                <label className="text-sm font-medium text-gray-700 block mb-1">Experience (Years)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        className="input-field pr-12"
                                        value={formData.experienceYears}
                                        onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                                    />
                                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 font-medium">yrs</span>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 block mb-1">Specialization</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="e.g. Strength Training, Yoga, HIIT"
                                    value={formData.specialization}
                                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 block mb-1">Certifications</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="e.g. NASM, ACE, ISSA"
                                    value={formData.certifications}
                                    onChange={e => setFormData({ ...formData, certifications: e.target.value })}
                                />
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
                    <div className="space-y-4">
                        <p className="text-gray-500">
                            Update your professional details to ensure users can find you based on your specialties.
                        </p>
                        {profile?.certifications && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">My Certifications</p>
                                <p className="text-gray-900 font-medium">{profile.certifications}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
