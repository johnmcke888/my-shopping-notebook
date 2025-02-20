'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    ArrowUpCircle, Circle, MinusCircle, Package,
    Building2, Info, Store, Star, CreditCard, Plus,
    Receipt, Tag, ShoppingBag, ArrowRight, ChevronRight,
    Gift
} from 'lucide-react';

interface Reward {
    type: 'sale' | 'portal' | 'credit-card' | 'store' | 'rebate';
    value: string;
    name: string;
}

interface MerchantCardProps {
    merchant: string;
    msrp: number;
    price: number;
    rewards: Reward[];
    finalPrice: number;
    shipping: string;
    tax: number | 'none' | 'unknown';
    returnPolicy: string;
    bestValue?: boolean;
    onPurchase: (details: {
        merchant: string;
        price: number;
        finalPrice: number;
        rewards: Reward[];
    }) => void;

}

interface ProductCardProps {
    name: string;
    image?: string;
    msrp: number;
    currentPrice: number;
    specs: string[];
    isSelected?: boolean;
    onActionClick: (action: 'shortlist' | 'reject' | 'delete') => void;

}

interface PrioritySectionProps {
    level: 'high' | 'normal' | 'low';
    icon: React.ReactNode;
    items: string[];
    isActive?: boolean;
}
const PrioritySection: React.FC<PrioritySectionProps> = ({ level, icon, items, isActive }) => (
    <div className= {`space-y-1 ${isActive ? 'bg-gray-50 rounded-md' : ''}`}>
        <div className="px-2 py-1 flex items-center gap-2 text-xs font-medium text-gray-500 uppercase" >
            { icon } { level }
</div>
{
    items.map((item, i) => (
        <div
                key= { i }
                className = {`px-2 py-1.5 rounded-md text-sm cursor-pointer
            ${isActive && i === 0 ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
            >
    { item }
    </div>
        ))}
</div>
);

const ProductCard: React.FC<ProductCardProps> = ({
    name,
    image,
    msrp,
    currentPrice,
    specs,
    isSelected,
    onActionClick
}) => (
    <Card className= "relative" >
    <CardContent className="p-6" >
        <div className="flex gap-6" >
            {/* Left side - Image */ }
            < div className = "w-40 flex-shrink-0 md:block hidden" >
                <img
                        src={ image || '/api/placeholder/400/200' }
alt = { name }
className = "h-32 w-full object-cover rounded-md bg-gray-100"
    />
    </div>

{/* Center - Main Content */ }
<div className="flex-1 min-w-0" >
    <div className="flex items-start gap-4" >
        {/* Star and Main Content */ }
        < div className = "flex gap-3 flex-1 min-w-0" >
            {/* Star Column - Always takes space whether visible or not */ }
            < div className = "w-4 flex-shrink-0 mt-1" >
                { isSelected && (
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                )}
</div>

{/* Title and Specs */ }
<div className="flex-1 min-w-0" >
    <div className="mb-2" >
        <h3 className="font-medium text-lg" > { name } </h3>
            < div className = "text-sm text-gray-500" >
                MSRP: ${ msrp }
{
    currentPrice < msrp && (
        <span className="ml-2" > Now: ${ currentPrice } </span>
                                        )
}
</div>
    </div>
    < div className = "space-y-1" >
    {
        specs.map((spec, i) => (
            <div key= { i } className = "text-sm text-gray-600" >• { spec } </div>
        ))
    }
        </div>
        </div>
        </div>

{/* Action Buttons */ }
<div className="flex flex-col gap-2 flex-shrink-0" >
    <Button
                                variant="outline"
size = "sm"
className = "border-blue-200 text-blue-700 hover:bg-blue-50 w-24"
onClick = {() => onActionClick('shortlist')}
                            >
    Shortlist
    </Button>
    < Button
variant = "outline"
size = "sm"
className = "border-red-100 text-red-600 hover:bg-red-50 w-24"
onClick = {() => onActionClick('reject')}
                            >
    Reject
    </Button>
    < Button
variant = "outline"
size = "sm"
className = "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 w-24"
onClick = {() => onActionClick('delete')}
                            >
    Remove
    </Button>
    </div>
    </div>
    </div>
    </div>
    </CardContent>
    </Card>
);

const MerchantCard: React.FC<MerchantCardProps> = ({
    merchant,
    msrp,
    price,
    rewards,
    finalPrice,
    shipping,
    tax,
    returnPolicy,
    bestValue
}) => (
    <Card className= { bestValue? 'ring-1 ring-green-200': '' } >
    <CardContent className="p-4" >
        <div className="space-y-4" >
            <div className="flex justify-between items-start" >
                <div>
                <h3 className="font-medium" > { merchant } </h3>
                    < div className = "flex items-center gap-1 text-sm" >
                        <span className="text-gray-500 line-through" > ${ msrp } </span>
                            < ArrowRight className = "h-3 w-3" />
                                <span className="text-gray-700" > ${ price } </span>
                                    < ArrowRight className = "h-3 w-3" />
                                        <span className="text-green-600 font-medium" > ${ finalPrice } </span>
                                            </div>
                                            </div>
{
    bestValue && (
        <Badge className="bg-green-100 text-green-800" > Best Value </Badge>
                    )
}
</div>

    < div className = "space-y-2 pt-2" >
    {
        rewards.map((reward, i) => (
            <div key= { i } className = "flex items-center gap-2 text-sm text-gray-600" >
            { reward.type === 'sale' && <Tag className="h-4 w-4" /> }
                            { reward.type === 'portal' && <ShoppingBag className="h-4 w-4" /> }
                            { reward.type === 'credit-card' && <CreditCard className="h-4 w-4" /> }
                            { reward.type === 'store' && <Store className="h-4 w-4" /> }
                            { reward.type === 'rebate' && <Gift className="h-4 w-4" /> }
                            { reward.value } { reward.name }
        </div>
        ))
    }
        </div>

        < Separator />

        <div className="space-y-2" >
            <div className="flex items-center gap-2 text-sm text-gray-600" >
                <Package className="h-4 w-4 flex-shrink-0" />
                    <span>
                    { shipping === 'free' ? (
                        <span className= "text-gray-600" > Free Shipping </span>
                            ) : shipping === 'unknown' ? (
    <span className= "text-gray-500" > Shipping unknown </span>
                            ) : (
    <span>${ shipping } </span>
                            )}
</span>
    </div>

    < div className = "flex items-center gap-2 text-sm text-gray-600" >
        <Building2 className="h-4 w-4 flex-shrink-0" />
            <span>
            { tax === 'none' ? (
                <span className= "text-gray-600" > No sales tax </span>
                            ) : tax === 'unknown' ? (
    <span className= "text-gray-500" > Tax unknown </span>
                            ) : (
    <span>{ tax } % sales tax </span>
                            )}
</span>
    </div>

    < div className = "flex items-center gap-2 text-sm text-gray-600" >
        <Info className="h-4 w-4 flex-shrink-0" />
            <span>
            { returnPolicy === 'unknown' ? (
                <span className= "text-gray-500" > Return policy unknown </span>
                            ) : (
    returnPolicy
)}
</span>
    </div>
    < div className = "mt-4 flex justify-end" >
        <Button
                            className="w-full"
onClick = {() => onPurchase({
    merchant,
    price,
    finalPrice,
    rewards
})}
                        >
    Mark Purchased
        </Button>
        </div>
        </div>
        </div>
        </CardContent>
        </Card>
);

const PurchasePlannerMockup: React.FC = () => {
    return (
        <div className= "p-6 space-y-6" >
        <div className="grid grid-cols-4 gap-4" >
            <Card>
            <CardContent className="pt-6" >
                <div className="flex flex-col items-center text-center" >
                    <div className="text-2xl font-bold mb-1" > 12 </div>
                        < p className = "text-sm text-muted-foreground" > Active Plans </p>
                            < p className = "text-xs text-muted-foreground mt-1" > 4 High Priority </p>
                                </div>
                                </CardContent>
                                </Card>

                                < Card >
                                <CardContent className="pt-6" >
                                    <div className="flex flex-col items-center text-center" >
                                        <div className="text-2xl font-bold mb-1" > $2, 450 </div>
                                            < p className = "text-sm text-muted-foreground" > Total Planned </p>
                                                < p className = "text-xs text-muted-foreground mt-1" > Next: Standing Desk($700) </p>
                                                    </div>
                                                    </CardContent>
                                                    </Card>

                                                    < Card >
                                                    <CardContent className="pt-6" >
                                                        <div className="flex flex-col items-center text-center" >
                                                            <div className="flex items-baseline gap-1" >
                                                                <span className="text-2xl font-bold" > 35 % </span>
                                                                    </div>
                                                                    < p className = "text-sm text-muted-foreground" > Average Savings over MSRP </p>
                                                                        < Progress value = { 35} className = "w-full h-2 mt-2" />
                                                                            </div>
                                                                            </CardContent>
                                                                            </Card>

                                                                            < Card >
                                                                            <CardContent className="pt-6" >
                                                                                <div className="flex flex-col items-center text-center" >
                                                                                    <div className="text-2xl font-bold mb-1" > 3 / 12 </div>
                                                                                        < p className = "text-sm text-muted-foreground" > Plans Optimized </p>
                                                                                            < p className = "text-xs text-muted-foreground mt-1" > 25 % or more Below MSRP </p>
                                                                                                </div>
                                                                                                </CardContent>
                                                                                                </Card>
                                                                                                </div>

                                                                                                < div className = "h-[calc(100vh-12rem)]" >
                                                                                                    <div className="grid grid-cols-12 gap-6 h-full" >
                                                                                                        {/* Priority List */ }
                                                                                                        < div className = "col-span-2 flex flex-col" >
                                                                                                            <Card>
                                                                                                            <CardContent className="p-4" >
                                                                                                                <div className="flex items-center justify-between mb-4" >
                                                                                                                    <h3 className="font-semibold" > Priority Items </h3>
                                                                                                                        < Button size = "sm" variant = "ghost" className = "h-8 w-8 p-0" >
                                                                                                                            <Plus className="h-4 w-4" />
                                                                                                                                </Button>
                                                                                                                                </div>
                                                                                                                                < Input
    className = "mb-4"
    placeholder = "Search items..."
        />
        <ScrollArea className="h-[calc(100vh-15rem)]" >
            <div className="space-y-4" >
                <PrioritySection
                                            level="high"
    icon = {< ArrowUpCircle className = "h-4 w-4 text-red-500" />}
items = { ["Standing Desk", "Monitor Arms"]}
isActive = { true}
    />
    <PrioritySection
                                            level="normal"
icon = {< Circle className = "h-4 w-4 text-amber-500" />}
items = { ["Coffee Maker", "Office Chair"]}
    />
    <PrioritySection
                                            level="low"
icon = {< MinusCircle className = "h-4 w-4 text-blue-500" />}
items = { ["Desk Lamp", "Keyboard"]}
    />
    </div>
    </ScrollArea>
    </CardContent>
    </Card>
    </div>

{/* Product Analysis */ }
<div className="col-span-6 flex flex-col" >
    <Card>
    <CardContent className="p-0" >
        <div className="p-4 border-b" >
            <div className="flex items-center justify-between mb-4" >
                <div>
                <h2 className="font-semibold" > Standing Desk </h2>
                    < div className = "text-sm text-gray-500 flex items-center gap-2" >
                        <ArrowUpCircle className="h-4 w-4 text-red-500" />
                            High Priority • Target: $500 - 700
                                </div>
                                </div>
                                < Button size = "sm" > Add Option </Button>
                                    </div>
                                    < Tabs defaultValue = "all" className = "w-full" >
                                        <TabsList>
                                        <TabsTrigger value="all" > Considering </TabsTrigger>
                                            < TabsTrigger value = "shortlist" > Shortlist </TabsTrigger>
                                                < TabsTrigger value = "rejected" > Rejected </TabsTrigger>
                                                    </TabsList>
                                                    </Tabs>
                                                    </div>

                                                    < ScrollArea className = "h-[calc(100vh-18rem)]" >
                                                        <div className="p-4 space-y-4" >
                                                            <ProductCard
                                            name="Fully Jarvis"
msrp = { 799}
currentPrice = { 599}
specs = {
    [
    "Height Range: 24.5\" to 50\"",
    "Weight Capacity: 350lbs",
    "7-year warranty"
    ]}
isSelected = { true}
    />
    <ProductCard
                                            name="Uplift V2"
msrp = { 849}
currentPrice = { 699}
specs = {
    [
    "Height Range: 25.5\" to 51.1\"",
    "Weight Capacity: 355lbs",
    "15-year warranty"
    ]}
    />
    </div>
    </ScrollArea>
    </CardContent>
    </Card>
    </div>

{/* Merchant Comparison */ }
<div className="col-span-4 flex flex-col" >
    <Card>
    <CardContent className="p-0" >
        <div className="p-4 border-b" >
            <h2 className="font-semibold mb-2" > Fully Jarvis </h2>
                < div className = "text-sm text-gray-500" >
                    Best Value: $549($522 after rewards)
                        </div>
                        </div>

                        < ScrollArea className = "h-[calc(100vh-18rem)]" >
                            <div className="max-h-[calc(100vh-18rem)] overflow-y-auto pr-4" >
                                <div className="p-4 space-y-4" >
                                    <MerchantCard
                                                merchant="Fully.com"
msrp = { 799}
price = { 649}
shipping = "free"
tax = { 8.875}
returnPolicy = "30-day free returns"
rewards = {
    [
    { type: "sale", value: "-$150", name: "Summer Sale" },
    { type: "portal", value: "8%", name: "Rakuten" },
    { type: "credit-card", value: "4%", name: "Chase Freedom" }
    ]}
finalPrice = { 522}
bestValue = { true}
    />
    <MerchantCard
                                                merchant="Amazon"
msrp = { 799}
price = { 699}
shipping = "free"
tax = "none"
returnPolicy = "30-day returns"
rewards = {
    [
    { type: "sale", value: "-$100", name: "Limited Time Deal" },
    { type: "credit-card", value: "5%", name: "Prime Card" }
    ]}
finalPrice = { 664}
    />
    </div>
    </div>
    </ScrollArea>
    </CardContent>
    </Card>
    </div>
    </div>
    </div>
    </div>
    );
};
export default PurchasePlannerMockup;
