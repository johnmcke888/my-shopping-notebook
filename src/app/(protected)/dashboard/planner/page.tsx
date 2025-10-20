'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, PlusCircle } from 'lucide-react';
// Corrected import paths using the '@/' alias
import { StatisticCards } from '@/app/(protected)/dashboard/planner/components/stats/StatisticCards';
import { AddPlanDialog } from '@/app/(protected)/dashboard/planner/components/plans/AddPlanDialog';
import type { PurchasePlan } from '@/app/(protected)/dashboard/planner/types';
import { formatCurrency } from '@/utils/formatters';
import { usePlannerStore } from '@/lib/planner-store';

// This is the new Planner Dashboard page.
export default function PlannerDashboardPage() {
    const { plans, addPlan } = usePlannerStore();

    // Recalculate stats whenever the plans change
    const stats = useMemo(() => {
        const totalNeedsCount = plans.length;
        const highPriorityPlans = plans.filter(p => p.priority === 'HIGH');
        const highPriorityCount = highPriorityPlans.length;
        const totalMinimumCost = plans.reduce((sum, plan) => sum + plan.budget, 0);
        const highPriorityCost = highPriorityPlans.reduce((sum, plan) => sum + plan.budget, 0);

        // These would be calculated more dynamically in the future
        const averageSavings = 19;
        const estimatedSavings = Math.round((totalMinimumCost * (averageSavings / 100)));

        return {
            totalNeedsCount,
            highPriorityCount,
            totalMinimumCost,
            highPriorityCost,
            averageSavings,
            estimatedSavings
        };
    }, [plans]);

    const getPriorityBadgeClass = (priority: 'HIGH' | 'NORMAL' | 'LOW') => {
        switch (priority) {
            case 'HIGH':
                return "bg-red-100 text-red-800 border-red-200";
            case 'NORMAL':
                return "bg-amber-100 text-amber-800 border-amber-200";
            case 'LOW':
                return "bg-blue-100 text-blue-800 border-blue-200";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Re-using the statistics cards component */}
            <StatisticCards {...stats} />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>All Purchase Plans</CardTitle>
                    {/* The "Add Plan" button now uses the action from the store */}
                    <AddPlanDialog onAddPlan={addPlan}>
                        <Button>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Plan
                        </Button>
                    </AddPlanDialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Plan Name</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Budget</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {plans.map((plan) => (
                                <TableRow key={plan.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <Link href={`/dashboard/planner/${plan.id}`} className="block w-full h-full">
                                            {plan.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/planner/${plan.id}`} className="block w-full h-full">
                                            <Badge variant="outline" className={getPriorityBadgeClass(plan.priority)}>
                                                {plan.priority}
                                            </Badge>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/planner/${plan.id}`} className="block w-full h-full">
                                            {formatCurrency(plan.budget)}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/planner/${plan.id}`} className="block w-full h-full">
                                            {plan.category || 'N/A'}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
