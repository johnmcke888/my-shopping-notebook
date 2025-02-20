// components/stats/StatisticCards.tsx

import { Card, CardContent } from "@/components/ui/card"

interface StatProps {
    totalNeedsCount: number;
    highPriorityCount: number;
    totalMinimumCost: number;
    highPriorityCost: number;
    averageSavings: number;
    estimatedSavings: number;
}

export function StatisticCards({
    totalNeedsCount,
    highPriorityCount,
    totalMinimumCost,
    highPriorityCost,
    averageSavings,
    estimatedSavings
}: StatProps) {
    return (
        <div className="grid grid-cols-4 gap-4 p-4">
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{totalNeedsCount}</div>
                        <p className="text-sm text-muted-foreground">Total Needs</p>
                        <p className="text-xs text-blue-600">{highPriorityCount} High Priority</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold">${totalMinimumCost}</div>
                        <p className="text-sm text-muted-foreground">Total Investment Required</p>
                        <p className="text-xs text-blue-600">${highPriorityCost} High Priority</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{averageSavings}%</div>
                        <p className="text-sm text-muted-foreground">Potential Savings</p>
                        <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${averageSavings}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold">${estimatedSavings}</div>
                        <p className="text-sm text-muted-foreground">Estimated Total Savings</p>
                        <p className="text-xs text-green-600">With Optimized Stacks</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}