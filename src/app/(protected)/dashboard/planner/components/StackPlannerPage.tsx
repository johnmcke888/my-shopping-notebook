'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, Plus, Star, ExternalLink, Clock, AlertCircle, CreditCard, Gift, Store, ShoppingCart } from 'lucide-react';
import PurchasePlansList from './plans/PurchasePlansList';
import { StatisticCards } from './stats/StatisticCards';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PurchasePlan, ProductOption, Stack, StackComponent } from '../types';
import { sampleProducts, sampleStack } from '../data/sampleData';
import { AddPlanDialog } from '../components/plans/AddPlanDialog';
import { samplePlans } from '../data/sampleData';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { ListFilter, Tags } from 'lucide-react';
import { List as ListIcon, Tag as TagIcon, Plus as PlusIcon } from "lucide-react"



const StackPlannerPage = () => {  // Changed to arrow function for consistency
    // State management
    const [activePlan, setActivePlan] = useState<PurchasePlan>(samplePlans[0]);
    const [products, setProducts] = useState<ProductOption[]>(sampleProducts);
    const [stack, setStack] = useState<Stack>(sampleStack);
    const [plans, setPlans] = useState(samplePlans);
    const [viewMode, setViewMode] = useLocalStorage<'priority' | 'category'>(
        'planner-view-mode',
        'priority'
    );

    // Updated statistics calculation
    const stats = (() => {
        const totalNeedsCount = plans.length;
        const highPriorityPlans = plans.filter(p => p.priority === 'HIGH');
        const highPriorityCount = highPriorityPlans.length;
        const totalMinimumCost = plans.reduce((sum, plan) => sum + plan.budget, 0);
        const highPriorityCost = highPriorityPlans.reduce((sum, plan) => sum + plan.budget, 0);
        const averageSavings = 19; // Could be calculated from actual savings data
        const estimatedSavings = Math.round((totalMinimumCost * (averageSavings / 100)));

        return {
            totalNeedsCount,
            highPriorityCount,
            totalMinimumCost,
            highPriorityCost,
            averageSavings,
            estimatedSavings
        };
    })();

    const calculateStackSavings = (stack: Stack) => {
        const componentSavings = stack.components.reduce((sum: number, comp: StackComponent) => sum + comp.value, 0);
        const totalSavings = (stack.listPrice - stack.salePrice) + componentSavings;
        const savingsPercentage = Math.round((totalSavings / stack.listPrice) * 100);
        return {
            amount: totalSavings,
            percentage: savingsPercentage
        };
    };

    const handleAddPlan = (newPlan: Omit<PurchasePlan, 'id'>) => {
        const plan: PurchasePlan = {
            id: crypto.randomUUID(),
            ...newPlan
        };
        setPlans(prevPlans => [...prevPlans, plan]);
        setActivePlan(plan);
    };

    return (
        <div className="h-screen flex flex-col">
            <StatisticCards {...stats} />

            {/* Main Content Area */}
            <div className="flex-1 flex gap-4 p-4 min-h-0">
                {/* Needs Rail */}
                <div className="w-1/5 flex flex-col bg-white rounded-lg border">
                    <div className="p-4 border-b space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-semibold">Purchase Plans</h2>
                            <AddPlanDialog onAddPlan={handleAddPlan} />
                        </div>
                        <Input placeholder="Search across all items..." className="w-full" />

                        {/* Updated View Toggle */}
                        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-md w-fit">
                            <button
                                onClick={() => setViewMode('priority')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${viewMode === 'priority' ? 'bg-white shadow-sm' : 'text-gray-600'
                                    }`}
                            >
                                <ListIcon className="h-4 w-4" />
                                Priority
                            </button>
                            <button
                                onClick={() => setViewMode('category')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${viewMode === 'category' ? 'bg-white shadow-sm' : 'text-gray-600'
                                    }`}
                            >
                                <TagIcon className="h-4 w-4" />
                                Category
                            </button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-6">
                            {viewMode === 'priority' ? (
                                // Existing Priority View
                                (['HIGH', 'NORMAL', 'LOW'] as const).map((priority) => (
                                    <div key={priority}>
                                        <div className="text-sm font-medium text-blue-600 mb-2">{priority}</div>
                                        {plans
                                            .filter(plan => plan.priority === priority)
                                            .map(plan => (
                                                <div
                                                    key={plan.id}
                                                    className={`p-2 rounded-md cursor-pointer ${plan.id === activePlan.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setActivePlan(plan)}
                                                >
                                                    <div className="font-medium">{plan.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        ${plan.budget}
                                                        {plan.category && ` • ${plan.category}`}
                                                    </div>
                                                </div>
                                            ))}
                                        {plans.filter(plan => plan.priority === priority).length === 0 && (
                                            <div className="text-sm text-gray-500 italic p-2">
                                                No {priority.toLowerCase()} priority plans
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                // New Category View
                                <div className="space-y-4">
                                    {Object.entries(
                                        plans.reduce((acc, plan) => {
                                            const category = plan.category || 'uncategorized';
                                            return {
                                                ...acc,
                                                [category]: [...(acc[category] || []), plan],
                                            };
                                        }, {} as Record<string, PurchasePlan[]>)
                                    ).map(([category, categoryPlans]) => (
                                        <div key={category} className="space-y-2">
                                            <div className="text-blue-600 text-sm">
                                                {category === 'uncategorized' ? 'Uncategorized' : category}
                                            </div>
                                            {categoryPlans.map(plan => (
                                                <div
                                                    key={plan.id}
                                                    className={`py-2 cursor-pointer ${plan.id === activePlan.id ? 'bg-blue-50' : ''
                                                        }`}
                                                    onClick={() => setActivePlan(plan)}
                                                >
                                                    <div className="font-medium">{plan.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        ${plan.budget.toLocaleString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Stack Workspace */}
                <div className="w-4/5 flex flex-col bg-white rounded-lg border">
                    {/* Product Header */}
                    <div className="p-4 border-b">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-semibold">{activePlan.name}</h2>
                                <div className="text-sm text-gray-500">
                                    {activePlan.priority} Priority • Budget: ${activePlan.budget}
                                </div>
                            </div>
                            <Button>Add Option</Button>
                        </div>

                        {/* Product Options */}
                        <div className="flex gap-6 mt-4 pb-4 overflow-x-auto">
                            {products.map(product => (
                                <Card key={product.id} className={`w-96 flex-shrink-0 ${product.selected ? 'bg-blue-50 border-blue-200' : ''}`}>
                                    <CardContent className="p-4">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-48 object-cover rounded-md mb-4"
                                        />
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-lg">{product.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.type === 'premium' ? 'Premium' : 'Budget'} Option
                                                    </div>
                                                </div>
                                                {product.selected && (
                                                    <Badge className="bg-blue-100 text-blue-800">Selected</Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {product.specs.join(' • ')}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="outline" className="w-96 flex-shrink-0">
                                <Plus className="h-4 w-4 mr-2" /> Add Option
                            </Button>
                        </div>
                    </div>

                    {/* Stack Builder */}
                    <div className="flex-1 p-4 flex gap-4 min-h-0">
                        {/* Stack Workspace */}
                        <div className="flex-1">
                            <Card className="mb-4">
                                <CardHeader>
                                    <CardTitle className="text-lg">{stack.name} - {stack.merchant}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span>List Price</span>
                                            <span>${stack.listPrice}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Sale Price</span>
                                            <span className="text-green-600">
                                                -${stack.listPrice - stack.salePrice}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-md space-y-2">
                                            {stack.components.map(component => (
                                                <div key={component.id} className="flex items-center gap-2">
                                                    {component.type === 'credit-card' && <CreditCard className="h-4 w-4" />}
                                                    {component.type === 'store-reward' && <Store className="h-4 w-4" />}
                                                    <span className="text-sm">
                                                        {component.name} ({component.details})
                                                    </span>
                                                    <Badge className="ml-auto">-${component.value}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                        <Button className="w-full">Add Component</Button>

                                        {/* Final Calculations */}
                                        {(() => {
                                            const savings = calculateStackSavings(stack);
                                            return (
                                                <>
                                                    <div className="flex justify-between font-medium">
                                                        <span>Final Price</span>
                                                        <span>${stack.salePrice - stack.components.reduce((sum, comp) => sum + comp.value, 0)}</span>
                                                    </div>
                                                    <div className="text-sm text-green-600">
                                                        Total Savings: {savings.percentage}% (${savings.amount})
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </CardContent>
                            </Card>

                            <Button className="w-full" variant="outline">
                                <Plus className="h-4 w-4 mr-2" /> Build New Stack
                            </Button>
                        </div>

                        {/* Stack Components */}
                        <Card className="w-72">
                            <CardHeader>
                                <CardTitle className="text-lg">Available Components</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-medium mb-2">Credit Cards</h3>
                                        <div className="space-y-2">
                                            <div className="p-2 bg-gray-50 rounded-md text-sm">
                                                Chase Freedom - Portal (4%)
                                            </div>
                                            <div className="p-2 bg-gray-50 rounded-md text-sm">
                                                Amex Platinum (1x MR)
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-2">Gift Cards</h3>
                                        <div className="p-2 bg-gray-50 rounded-md text-sm">
                                            No gift cards available
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-medium mb-2">Store Rewards</h3>
                                        <div className="p-2 bg-gray-50 rounded-md text-sm">
                                            Newsletter Signup ($50 off)
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StackPlannerPage;

