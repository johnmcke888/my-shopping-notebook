// src/app/(protected)/dashboard/planner/data/sampleData.ts

import type { ProductOption, Stack, PurchasePlan } from '../types';

export const samplePlans: PurchasePlan[] = [
    {
        id: '1',
        name: 'Standing Desk',
        priority: 'HIGH',
        budget: 700
    },
    {
        id: '2',
        name: 'Coffee Maker',
        priority: 'NORMAL',
        budget: 200
    },
    {
        id: '3',
        name: 'Desk Lamp',
        priority: 'LOW',
        budget: 50
    }
];

export const sampleProducts: ProductOption[] = [
    {
        id: '1',
        name: 'Fully Jarvis',
        type: 'premium',
        image: '/api/placeholder/400/300',
        specs: [
            'Height Range: 24.5" to 50"',
            'Weight Capacity: 350lbs',
            '7-year warranty'
        ],
        brand: 'Fully',
        modelNumber: 'JRV2',
        price: {
            msrp: 799,
            current: 699
        },
        notes: 'Highly rated bamboo top option',
        selected: true,
        reviews: {
            rating: 4.8,
            count: 2547,
            source: 'fully.com'
        },
        status: 'in_stock',
        merchant: {
            name: 'Fully',
            reliability: 'verified',
            fulfillment: 'direct'
        }
    },
    {
        id: '2',
        name: 'Vari Essential',
        type: 'budget',
        image: '/api/placeholder/400/300',
        specs: [
            'Height Range: 25" to 50.5"',
            'Weight Capacity: 300lbs',
            '5-year warranty'
        ],
        brand: 'Vari',
        modelNumber: 'ESS22',
        price: {
            msrp: 599,
            current: 499
        },
        notes: 'Good value entry-level option',
        selected: false,
        reviews: {
            rating: 4.5,
            count: 1832,
            source: 'amazon.com'
        },
        status: 'low_stock',
        merchant: {
            name: 'Amazon',
            reliability: 'verified',
            fulfillment: 'marketplace'
        }
    }
];

export const sampleStack: Stack = {
    id: '1',
    name: 'Stack #1',
    merchant: 'Fully.com Direct',
    listPrice: 799,
    salePrice: 649,
    components: [
        {
            id: '1',
            type: 'credit-card',
            name: 'Chase Freedom Portal',
            value: 26,
            details: '4% cashback'
        },
        {
            id: '2',
            type: 'store-reward',
            name: 'Newsletter Signup',
            value: 50,
            details: '$50 off first purchase'
        }
    ]
};