import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Award, Zap, Star, ShieldCheck, Check } from 'lucide-react';

export default function SubscriptionPlan() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    const plans = [
        {
            name: 'BASIC',
            price: '$9.99',
            period: '/month',
            icon: <Zap size={24} />,
            color: 'blue',
            features: ['Basic activity tracking', 'BMI Calculator', 'Community Access']
        },
        {
            name: 'PREMIUM',
            price: '$19.99',
            period: '/month',
            icon: <Star size={24} />,
            color: 'orange',
            features: ['Everything in Basic', 'Personalized workout plans', 'Advanced analytics', 'Priority support']
        },
        {
            name: 'PRO',
            price: '$29.99',
            period: '/month',
            icon: <Award size={24} />,
            color: 'purple',
            features: ['Everything in Premium', '1-on-1 Trainer Access', 'Dietary planning', 'Exclusive content']
        }
    ];

    const fetchSubscription = async () => {
        try {
            const res = await api.get('/subscription');
            if (res.data && res.data.planType) {
                setSubscription(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, []);

    const handlePurchase = async (planType) => {
        try {
            await api.post(`/subscription/purchase?planType=${planType}`);
            fetchSubscription();
        } catch (err) {
            console.error(err);
            alert('Failed to upgrade subscription');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const currentPlan = subscription?.planType || 'FREE';

    return (
        <div className="space-y-8">
            {/* Current Plan Badge */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <ShieldCheck size={32} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-gray-400 font-medium mb-1">Current Active Plan</p>
                        <h2 className="text-3xl font-black tracking-tight flex items-baseline gap-3">
                            {currentPlan}
                            {currentPlan !== 'FREE' && (
                                <span className="text-sm font-normal px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                                    Active
                                </span>
                            )}
                        </h2>
                    </div>
                </div>

                {currentPlan !== 'FREE' && subscription?.endDate && (
                    <div className="relative z-10 text-right bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <p className="text-sm text-gray-400 font-medium mb-1">Renews on</p>
                        <p className="text-xl font-bold">{new Date(subscription.endDate).toLocaleDateString()}</p>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Upgrade your journey</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isActive = currentPlan === plan.name;
                        const isDowngrade = currentPlan === 'PRO' || (currentPlan === 'PREMIUM' && plan.name === 'BASIC');

                        return (
                            <div
                                key={plan.name}
                                className={`relative flex flex-col bg-white rounded-3xl overflow-hidden transition-all duration-300 ${isActive
                                        ? 'ring-2 ring-primary border-transparent shadow-xl shadow-primary/10 -translate-y-2'
                                        : 'border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1'
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute top-0 inset-x-0 h-1.5 bg-primary"></div>
                                )}

                                <div className="p-8 pb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                            plan.color === 'orange' ? 'bg-orange-100 text-orange-500' :
                                                'bg-purple-100 text-purple-600'
                                        }`}>
                                        {plan.icon}
                                    </div>

                                    <h4 className="text-lg font-bold text-gray-900 tracking-tight">{plan.name}</h4>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                                        <span className="text-gray-500 font-medium">{plan.period}</span>
                                    </div>
                                </div>

                                <div className="px-8 flex-1 bg-gray-50/50 pt-6 border-t border-gray-50">
                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <Check size={18} className="text-primary shrink-0 mt-0.5" />
                                                <span className="text-gray-600 text-sm leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 bg-gray-50/50 mt-auto">
                                    <button
                                        disabled={isActive}
                                        onClick={() => handlePurchase(plan.name)}
                                        className={`w-full py-3.5 px-4 rounded-xl font-bold transition-all duration-300 ${isActive
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {isActive ? 'Current Plan' : isDowngrade ? 'Downgrade' : 'Upgrade to ' + plan.name}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
