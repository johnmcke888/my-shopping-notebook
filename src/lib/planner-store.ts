import { create } from 'zustand';
import { PurchasePlan, ProductOption, Stack } from '@/app/(protected)/dashboard/planner/types';
import { samplePlans, sampleProducts, sampleStack } from '@/app/(protected)/dashboard/planner/data/sampleData';

interface PlannerState {
    plans: PurchasePlan[];
    productsByPlan: Record<string, ProductOption[]>;
    stacksByPlan: Record<string, Stack[]>;
    addPlan: (newPlanData: Omit<PurchasePlan, 'id'>) => void;
    getPlanById: (planId: string) => PurchasePlan | undefined;
    getProductsForPlan: (planId: string) => ProductOption[];
    getStacksForPlan: (planId: string) => Stack[];
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
    // Initialize state with sample data
    plans: samplePlans,
    productsByPlan: {
        'plan-1': sampleProducts, // Assuming plan '1' has these products
        'plan-2': [],
        'plan-3': [],
    },
    stacksByPlan: {
        'plan-1': [sampleStack], // Assuming plan '1' has this stack
        'plan-2': [],
        'plan-3': [],
    },

    // Action to add a new plan
    addPlan: (newPlanData) => {
        const newPlan: PurchasePlan = {
            id: `plan-${Date.now()}`, // Simple unique ID for now
            ...newPlanData,
        };
        set((state) => ({
            plans: [newPlan, ...state.plans],
            // Also initialize the data for the new plan
            productsByPlan: {
                ...state.productsByPlan,
                [newPlan.id]: [], // Start with no products
            },
            stacksByPlan: { ...state.stacksByPlan, [newPlan.id]: [] }, // Start with no stacks
        }));
    },

    // Getter to find a specific plan by its ID
    getPlanById: (planId) => {
        return get().plans.find(p => p.id === planId);
    },

    // Getter to find products for a specific plan
    getProductsForPlan: (planId) => {
        return get().productsByPlan[planId] || [];
    },

    // Getter to find stacks for a specific plan
    getStacksForPlan: (planId) => {
        return get().stacksByPlan[planId] || [];
    },
}));
