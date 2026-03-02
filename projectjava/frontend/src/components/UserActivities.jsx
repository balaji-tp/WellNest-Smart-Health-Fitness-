import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Flame, Clock, Plus, Dumbbell, History, Droplets, Moon, Save } from 'lucide-react';

export default function UserActivities() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Health Metrics state
    const [metrics, setMetrics] = useState({ waterLiters: 0, sleepHours: 0 });
    const [metricsLoading, setMetricsLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        activityName: 'Morning Run',
        durationMinutes: '',
        caloriesBurned: '',
        category: 'Cardio'
    });

    const fetchActivities = async () => {
        try {
            const res = await api.get('/activities');
            setActivities(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMetrics = async () => {
        try {
            const res = await api.get('/metrics/today');
            setMetrics({
                waterLiters: res.data.waterLiters || 0,
                sleepHours: res.data.sleepHours || 0
            });
        } catch (err) {
            console.error(err);
        } finally {
            setMetricsLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
        fetchMetrics();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            activityName: formData.activityName,
            category: formData.category,
            durationMinutes: parseInt(formData.durationMinutes, 10),
            caloriesBurned: parseInt(formData.caloriesBurned, 10)
        };

        if (isNaN(payload.durationMinutes) || isNaN(payload.caloriesBurned)) {
            alert('Please enter valid numbers for duration and calories.');
            return;
        }

        try {
            await api.post('/activities', payload);
            setShowForm(false);
            setFormData({ activityName: 'Morning Run', durationMinutes: '', caloriesBurned: '', category: 'Cardio' });
            fetchActivities(); // Refresh list
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to add activity. Check console logs.');
        }
    };

    const handleMetricUpdate = async (type) => {
        try {
            await api.post('/metrics/today', {
                waterLiters: Number(metrics.waterLiters),
                sleepHours: Number(metrics.sleepHours)
            });
            // highlight success briefly? Not strictly necessary if it just saves.
        } catch (err) {
            console.error("Failed to save metrics", err);
            alert("Failed to save metrics");
        }
    };

    return (
        <div className="space-y-8">
            {/* Daily Health Log (Sleep / Water) */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <Activity size={20} className="text-primary" />
                    Daily Health Log
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Water Tracking */}
                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                <Droplets size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Water Logged</p>
                                <div className="flex items-end gap-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        className="w-20 bg-transparent text-3xl font-black text-gray-900 border-b-2 border-blue-200 focus:border-blue-500 focus:outline-none transition-colors px-1"
                                        value={metrics.waterLiters}
                                        onChange={(e) => setMetrics({ ...metrics, waterLiters: e.target.value })}
                                    />
                                    <span className="text-lg font-medium text-gray-500 mb-1">Liters</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleMetricUpdate('water')}
                            className="p-3 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors shrink-0"
                            title="Save Water Log"
                        >
                            <Save size={20} />
                        </button>
                    </div>

                    {/* Sleep Tracking */}
                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                                <Moon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Sleep Logged</p>
                                <div className="flex items-end gap-2">
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        className="w-20 bg-transparent text-3xl font-black text-gray-900 border-b-2 border-indigo-200 focus:border-indigo-500 focus:outline-none transition-colors px-1"
                                        value={metrics.sleepHours}
                                        onChange={(e) => setMetrics({ ...metrics, sleepHours: e.target.value })}
                                    />
                                    <span className="text-lg font-medium text-gray-500 mb-1">Hours</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleMetricUpdate('sleep')}
                            className="p-3 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-colors shrink-0"
                            title="Save Sleep Log"
                        >
                            <Save size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-orange-100 text-sm font-medium mb-1">Total Calories</p>
                            <h3 className="text-3xl font-bold">
                                {activities.reduce((sum, act) => sum + (act.caloriesBurned || 0), 0)} <span className="text-xl font-normal opacity-80">kcal</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Flame size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Duration</p>
                            <h3 className="text-3xl font-bold">
                                {activities.reduce((sum, act) => sum + (act.durationMinutes || 0), 0)} <span className="text-xl font-normal opacity-80">min</span>
                            </h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-green-100 text-sm font-medium mb-1">Total Workouts</p>
                            <h3 className="text-3xl font-bold">{activities.length}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Activity size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <History size={20} className="text-primary" />
                    Recent Activity History
                </h3>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary-hover px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                >
                    {showForm ? 'Cancel' : <><Plus size={16} /> Log Activity</>}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Dumbbell size={18} className="text-primary" />
                        New Workout Session
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Activity Name (Exercise)</label>
                            <select
                                className="input-field"
                                value={formData.activityName}
                                onChange={e => setFormData({ ...formData, activityName: e.target.value })}
                            >
                                <option value="Morning Run">Morning Run</option>
                                <option value="Cycling">Cycling</option>
                                <option value="Swimming">Swimming</option>
                                <option value="Yoga Session">Yoga Session</option>
                                <option value="Weightlifting">Weightlifting</option>
                                <option value="HIIT Workout">HIIT Workout</option>
                                <option value="Walking">Walking</option>
                                <option value="Pilates">Pilates</option>
                                <option value="Rowing">Rowing</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                            <select
                                className="input-field"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>Cardio</option>
                                <option>Strength</option>
                                <option>Flexibility</option>
                                <option>Sports</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Duration (minutes)</label>
                            <input
                                type="number"
                                required
                                placeholder="30"
                                min="1"
                                className="input-field"
                                value={formData.durationMinutes}
                                onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">Calories Burned</label>
                            <input
                                type="number"
                                required
                                placeholder="250"
                                min="1"
                                className="input-field"
                                value={formData.caloriesBurned}
                                onChange={e => setFormData({ ...formData, caloriesBurned: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className="btn-primary w-auto px-8">Save Activity</button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center p-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Dumbbell size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No activities yet</h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">Start logging your workouts to track your fitness journey and see your progress here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map(act => (
                        <div key={act.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${act.category === 'Cardio' ? 'bg-orange-100 text-orange-600' :
                                    act.category === 'Strength' ? 'bg-blue-100 text-blue-600' :
                                        act.category === 'Flexibility' ? 'bg-purple-100 text-purple-600' :
                                            'bg-green-100 text-green-600'
                                    }`}>
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{act.activityName}</h4>
                                    <p className="text-sm text-gray-500">{new Date(act.activityDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-6 sm:justify-end">
                                <div className="text-center sm:text-right">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Duration</p>
                                    <p className="font-bold text-gray-900">{act.durationMinutes} min</p>
                                </div>
                                <div className="text-center sm:text-right">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Calories</p>
                                    <p className="font-bold text-orange-500">{act.caloriesBurned} kcal</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
