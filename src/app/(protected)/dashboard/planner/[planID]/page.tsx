'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Star, CreditCard, Gift, Store, ChevronLeft } from 'lucide-react';
// Corrected import paths using the '@/' alias
import { PurchasePlan, ProductOption, Stack, StackComponent } from '@/app/(protected)/dashboard/planner/types';
import { sampleProducts, sampleStack, samplePlans } from '@/app/(protected)/dashboard/planner/data/sampleData';
import { formatCurrency } from '@/utils/formatters';

// This page receives `params` from the URL, which includes the planId.
export default function PlanWorkspacePage({ params }: { params: { planId: string } }) {
    // Find the specific plan from our sample data using the ID from the URL.
    const activePlan = useMemo(() =>
        samplePlans.find(p => p.id === params.planId),
        [params.planId]
    );

    // State for this specific plan's data
    const [products, setProducts] = useState<ProductOption[]>(sampleProducts);
    const [stack, setStack] = useState<Stack>(sampleStack);

    // Helper function for calculating savings
    const calculateStackSavings = (stack: Stack) => {
        const componentSavings = stack.components.reduce((sum: number, comp: StackComponent) => sum + comp.value, 0);
        const totalSavings = (stack.listPrice - stack.salePrice) + componentSavings;
        const savingsPercentage = Math.round((totalSavings / stack.listPrice) * 100);
        return {
            amount: totalSavings,
            percentage: savingsPercentage
        };
    };

    // If no plan is found for the given ID, show a "not found" message.
    if (!activePlan) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <h2 className="text-2xl font-bold">Plan Not Found</h2>
                <p className="text-muted-foreground">The purchase plan you're looking for doesn't exist.</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard/planner">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to All Plans
                    </Link>
                </Button>
            </div>
    }

    // The main UI for the workspace, now focused on a single plan.
    return (
        <div className="h-full flex flex-col gap-4">
            {/* Header Section */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/planner">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{activePlan.name}</h1>
                    <div className="text-sm text-muted-foreground">
                        {activePlan.priority} Priority • Budget: {formatCurrency(activePlan.budget)}
                    </div>
                </div>
            </div>

            {/* Product Options Section */}
            <Card className="flex-shrink-0">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Product Options</CardTitle>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-6 pb-4 overflow-x-auto">
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
                    </div>
                </CardContent>
            </Card>

            {/* Stack Builder Section */}
            <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
                {/* Stack Workspace */}
                <div className="col-span-2">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">{stack.name} - {stack.merchant}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span>List Price</span>
                                    <span>{formatCurrency(stack.listPrice)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Sale Price</span>
                                    <span className="text-green-600">
                                        -{formatCurrency(stack.listPrice - stack.salePrice)}
                                    </span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-md space-y-2">
                                    {stack.components.map(component => (
                                        <div key={component.id} className="flex items-center gap-2">
                                            {component.type === 'credit-card' && <CreditCard className="h-4 w-4 text-muted-foreground" />}
                                            {component.type === 'store-reward' && <Store className="h-4 w-4 text-muted-foreground" />}
                                            <span className="text-sm">
                                                {component.name} ({component.details})
                                            </span>
                                            <Badge variant="outline" className="ml-auto">-{formatCurrency(component.value)}</Badge>
                                        </div>
                                    ))}
                                </div>
                                <Button className="w-full" variant="outline">Add Component</Button>

                                {/* Final Calculations */}
                                {(() => {
                                    const savings = calculateStackSavings(stack);
                                    const finalPrice = stack.salePrice - stack.components.reduce((sum, comp) => sum + comp.value, 0);
                                    return (
                                        <>
                                            <div className="flex justify-between font-bold text-lg pt-4 border-t">
                                                <span>Final Price</span>
                                                <span>{formatCurrency(finalPrice)}</span>
                                            </div>
                                            <div className="text-sm text-green-600 text-right">
                                                Total Savings: {savings.percentage}% ({formatCurrency(savings.amount)})
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Available Components */}
                <div className="col-span-1">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">Available Components</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium mb-2 text-sm">Credit Cards</h3>
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
                                    <h3 className="font-medium mb-2 text-sm">Gift Cards</h3>
                                    <div className="p-2 bg-gray-50 rounded-md text-sm">
                                        No gift cards available
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-medium mb-2 text-sm">Store Rewards</h3>
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
    );
}

