import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Activity, ChevronRight, User } from 'lucide-react';

export default function TrainerClients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);
    const [clientActivities, setClientActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(false);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await api.get('/user/my-clients');
                setClients(res.data);
            } catch (err) {
                console.error("Failed to fetch clients", err);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    const handleSelectClient = async (client) => {
        if (selectedClient?.id === client.id) {
            setSelectedClient(null);
            return;
        }

        setSelectedClient(client);
        setLoadingActivities(true);
        try {
            const res = await api.get(`/activities/client/${client.id}`);
            setClientActivities(res.data);
        } catch (err) {
            console.error("Failed to fetch client activities", err);
        } finally {
            setLoadingActivities(false);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Users size={24} className="text-primary" />
                    My Clients & Activities
                </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client List */}
                <div className="lg:col-span-1 border border-gray-100 bg-white rounded-3xl p-6 shadow-sm h-max">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User size={18} className="text-gray-400" />
                        Client Roster ({clients.length})
                    </h4>

                    {clients.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-xl">No clients assigned to you yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {clients.map(client => (
                                <button
                                    key={client.id}
                                    onClick={() => handleSelectClient(client)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${selectedClient?.id === client.id
                                        ? 'bg-primary/10 border-primary/20 text-primary'
                                        : 'bg-white border-gray-100 hover:bg-gray-50 text-gray-700 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="text-left">
                                        <div className="font-semibold">{client.username}</div>
                                        <div className="text-xs opacity-80">{client.email}</div>
                                    </div>
                                    <ChevronRight size={16} className={selectedClient?.id === client.id ? 'text-primary' : 'text-gray-400'} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Client Details / Activities */}
                <div className="lg:col-span-2 border border-gray-100 bg-white rounded-3xl p-6 shadow-sm min-h-[400px]">
                    {!selectedClient ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                            <Activity size={48} className="mb-4 opacity-20" />
                            <p className="font-medium text-gray-600">Select a Client</p>
                            <p className="text-sm mt-1">Choose a client from the roster to view their logged activities</p>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{selectedClient.username}'s Activities</h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Goal Details: {selectedClient.heightCm ? `${selectedClient.heightCm}cm, ${selectedClient.weightKg}kg` : 'No metrics loaded'}
                                    </p>
                                </div>
                                <span className="text-xs px-2.5 py-1 bg-green-100 text-green-800 rounded-lg font-bold">
                                    BMI: {selectedClient.bmi || '--'}
                                </span>
                            </div>

                            {loadingActivities ? (
                                <div className="flex justify-center p-8">
                                    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : clientActivities.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    No activities logged by this client yet.
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                    {clientActivities.map(act => (
                                        <div key={act.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-white hover:shadow-sm transition-all">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${act.category === 'Cardio' ? 'bg-orange-100 text-orange-600' :
                                                    act.category === 'Strength' ? 'bg-blue-100 text-blue-600' :
                                                        act.category === 'Flexibility' ? 'bg-purple-100 text-purple-600' :
                                                            'bg-green-100 text-green-600'
                                                    }`}>
                                                    <Activity size={18} />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-gray-900 text-sm">{act.activityName}</h5>
                                                    <p className="text-xs text-gray-500">{new Date(act.activityDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 sm:justify-end">
                                                <div className="text-center sm:text-right">
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Duration</p>
                                                    <p className="font-semibold text-gray-800 text-sm">{act.durationMinutes} min</p>
                                                </div>
                                                <div className="text-center sm:text-right">
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Calories</p>
                                                    <p className="font-semibold text-orange-500 text-sm">{act.caloriesBurned} kcal</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
