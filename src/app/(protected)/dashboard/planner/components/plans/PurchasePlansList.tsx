// src/app/(protected)/dashboard/planner/components/PurchasePlansList.tsx

'use client';

import { useState } from 'react';

interface PurchasePlan {
    id: string;
    name: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    budget: number;
}

export default function PurchasePlansList() {
    const [plans, setPlans] = useState<PurchasePlan[]>([]);

    return (
        <div className="h-full border-r p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Purchase Plans</h2>
                <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-md"
                    onClick={() => {/* Add plan logic */ }}
                >
                    Add Plan
                </button>
            </div>

            <div className="space-y-2">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <span className="font-medium">{plan.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${plan.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                    plan.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                }`}>
                                {plan.priority}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            Budget: ${plan.budget}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}