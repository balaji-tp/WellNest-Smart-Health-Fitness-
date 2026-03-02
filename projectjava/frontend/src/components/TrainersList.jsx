import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Award, Star } from 'lucide-react';

export default function TrainersList() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selecting, setSelecting] = useState(false);
    const [selectedTrainerProfile, setSelectedTrainerProfile] = useState(null);

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                const res = await api.get('/user/trainers');
                setTrainers(res.data);
            } catch (err) {
                console.error('Failed to fetch trainers', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrainers();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleSelectTrainer = async (trainerId) => {
        setSelecting(true);
        try {
            await api.post(`/user/select-trainer/${trainerId}`, {});
            alert('Trainer selected successfully!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to select trainer');
        } finally {
            setSelecting(false);
        }
    };

    if (selectedTrainerProfile) {
        return (
            <div className="space-y-6 max-w-3xl">
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => setSelectedTrainerProfile(null)}
                        className="text-primary font-semibold hover:text-primary-hover flex items-center gap-1.5 transition-colors"
                    >
                        ← Back to Trainers
                    </button>
                    <button
                        onClick={() => handleSelectTrainer(selectedTrainerProfile.id)}
                        disabled={selecting}
                        className="btn-primary w-auto flex items-center gap-2 text-sm px-4 py-2"
                    >
                        <User size={16} />
                        {selecting ? 'Selecting...' : 'Select this Trainer'}
                    </button>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                    <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-4xl shadow-xl shadow-primary/20">
                                {selectedTrainerProfile.username.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <h2 className="text-2xl font-bold text-gray-900">{selectedTrainerProfile.username}</h2>
                            <p className="text-gray-500 mb-6">{selectedTrainerProfile.email}</p>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                <div className="flex gap-8 w-full justify-around">
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Experience</p>
                                        <p className="text-xl font-bold text-gray-900">{selectedTrainerProfile.experienceYears || '--'} <span className="text-sm font-normal text-gray-500">yrs</span></p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Specialty</p>
                                        <p className="text-xl font-bold text-gray-900 capitalize">{selectedTrainerProfile.specialization || '--'}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedTrainerProfile.certifications && (
                                <div className="mt-6">
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Certifications</p>
                                    <p className="text-gray-900 font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">{selectedTrainerProfile.certifications}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Award size={24} className="text-primary" />
                    Available Fitness Trainers
                </h3>
            </div>

            {trainers.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <User size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No trainers found</h3>
                    <p className="text-gray-500 mt-1">There are currently no trainers registered in the system.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trainers.map((trainer) => (
                        <div key={trainer.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:from-primary/10 group-hover:to-secondary/10 transition-colors"></div>

                            <div className="flex items-start gap-4 mb-4 relative z-10">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-primary/20">
                                    {trainer.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 mt-1">
                                    <h4 className="font-bold text-lg text-gray-900 leading-tight">{trainer.username}</h4>
                                    <p className="text-sm text-gray-500 mb-2">{trainer.email}</p>
                                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">
                                        <Star size={12} className="fill-current" /> Premium Coach
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 relative z-10 flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Member since {new Date(trainer.createdAt || Date.now()).getFullYear()}</span>
                                <button
                                    onClick={() => setSelectedTrainerProfile(trainer)}
                                    className="text-primary font-semibold text-sm hover:text-primary-hover transition-colors"
                                >
                                    View Profile →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
