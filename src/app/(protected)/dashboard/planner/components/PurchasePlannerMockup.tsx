'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertCircle, ArrowUpCircle, Circle, MinusCircle,
    Plus, ExternalLink, Star, Store, CreditCard,
    ChevronRight, Clock, Link, MessageSquare
} from 'lucide-react';

// Core types
interface PurchaseItem {
    id: string;
    name: string;
    priority: 'high' | 'normal' | 'low';
    targetPrice: {
        min: number;
        max: number;
    };
    options: ProductOption[];
    selectedOption?: string;
}

interface ProductOption {
    id: string;
    name: string;
    image: string;
    price: {
        msrp: number;
        current: number;
    };
    specs: string[];
    notes: string;
    reviews: {
        source: string;
        title: string;
        url: string;
    }[];
    status: 'considering' | 'shortlisted' | 'rejected';
    merchants: MerchantOption[];
}

interface MerchantOption {
    id: string;
    name: string;
    price: number;
    netPrice: number;
    rewards: {
        type: 'credit-card' | 'store';
        value: string;
        name: string;
    }[];
    notes: string;
    bestValue?: boolean;
}

const PurchasePlannerMockup: React.FC = () => {
    // Initialize with sample data
    const [items, setItems] = useState<PurchaseItem[]>([
        {
            id: '1',
            name: 'Standing Desk',
            priority: 'high',
            targetPrice: { min: 500, max: 700 },
            options: [
                {
                    id: '1-1',
                    name: 'Fully Jarvis',
                    image: '/api/placeholder/400/200',
                    price: { msrp: 799, current: 649 },
                    specs: [
                        'Height Range: 24.5" to 50"',
                        'Weight Capacity: 350lbs',
                        '7-year warranty'
                    ],
                    notes: "The Wirecutter's top pick. Stable at all heights according to BTD.",
                    reviews: [
                        { source: 'BTD', title: 'In-depth Review', url: '#' }
                    ],
                    status: 'considering',
                    merchants: [
                        {
                            id: 'm1',
                            name: 'Fully.com',
                            price: 649,
                            netPrice: 622,
                            rewards: [
                                { type: 'credit-card', value: '4%', name: 'Chase Portal + Freedom' }
                            ],
                            notes: 'Free shipping, 30-day trial',
                            bestValue: true
                        }
                    ]
                }
            ],
            selectedOption: '1-1'
        }
    ]);

    const [selectedItemId, setSelectedItemId] = useState<string>('1');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'shortlist' | 'rejected'>('all');
    const [showProductModal, setShowProductModal] = useState(false);
    const [showMerchantModal, setShowMerchantModal] = useState(false);
    const [editingOptionId, setEditingOptionId] = useState<string | null>(null);

    const [newProduct, setNewProduct] = useState({
        name: '',
        price: { msrp: 0, current: 0 },
        specs: [''],
        notes: '',
        reviews: [{ source: '', title: '', url: '' }]
    });

    const [newMerchant, setNewMerchant] = useState({
        name: '',
        price: 0,
        rewards: [{ type: 'credit-card' as const, value: '', name: '' }],
        notes: ''
    });

    // Computed values
    const selectedItem = items.find(item => item.id === selectedItemId);
    const selectedOption = selectedItem?.options.find(opt => opt.id === selectedItem.selectedOption);

    // Filter items by priority
    const itemsByPriority = {
        high: items.filter(item => item.priority === 'high'),
        normal: items.filter(item => item.priority === 'normal'),
        low: items.filter(item => item.priority === 'low')
    };

    // Metrics calculations
    const metrics = {
        activePlans: items.length,
        highPriorityCount: itemsByPriority.high.length,
        totalPlanned: items.reduce((sum, item) => {
            const selectedOpt = item.options.find(opt => opt.id === item.selectedOption);
            return sum + (selectedOpt?.price.current || 0);
        }, 0),
        averageSavings: items.reduce((sum, item) => {
            const selectedOpt = item.options.find(opt => opt.id === item.selectedOption);
            if (!selectedOpt) return sum;
            const savings = (selectedOpt.price.msrp - selectedOpt.price.current) / selectedOpt.price.msrp;
            return sum + savings;
        }, 0) / (items.length || 1),
        plansOptimized: items.filter(item => {
            const selectedOpt = item.options.find(opt => opt.id === item.selectedOption);
            if (!selectedOpt) return false;
            return (selectedOpt.price.msrp - selectedOpt.price.current) / selectedOpt.price.msrp >= 0.25;
        }).length
    };
    // Handler functions
    const handleAddItem = () => {
        const newItem: PurchaseItem = {
            id: `item-${Date.now()}`,
            name: 'New Item',
            priority: 'normal',
            targetPrice: { min: 0, max: 100 },
            options: [],
        };
        setItems([...items, newItem]);
        setSelectedItemId(newItem.id);
    };

    const handleSelectItem = (id: string) => {
        setSelectedItemId(id);
    };

    const handleUpdateItemStatus = (itemId: string, optionId: string, newStatus: 'considering' | 'shortlisted' | 'rejected') => {
        setItems(items.map(item => {
            if (item.id !== itemId) return item;
            return {
                ...item,
                options: item.options.map(opt => {
                    if (opt.id !== optionId) return opt;
                    return { ...opt, status: newStatus };
                })
            };
        }));
    };

    const handleAddProductOption = () => {
        if (!selectedItem) return;

        const newOption: ProductOption = {
            id: `option-${Date.now()}`,
            name: newProduct.name,
            image: '/api/placeholder/400/200',
            price: newProduct.price,
            specs: newProduct.specs.filter(Boolean),
            notes: newProduct.notes,
            reviews: newProduct.reviews.filter(r => r.source && r.title),
            status: 'considering',
            merchants: []
        };

        setItems(items.map(item => {
            if (item.id !== selectedItem.id) return item;
            return {
                ...item,
                options: [...item.options, newOption]
            };
        }));

        setShowProductModal(false);
        setNewProduct({
            name: '',
            price: { msrp: 0, current: 0 },
            specs: [''],
            notes: '',
            reviews: [{ source: '', title: '', url: '' }]
        });
    };

    const handleAddMerchant = (optionId: string) => {
        if (!newMerchant.name || !newMerchant.price) return;

        const merchant: MerchantOption = {
            id: `merchant-${Date.now()}`,
            name: newMerchant.name,
            price: newMerchant.price,
            netPrice: newMerchant.price * (1 - newMerchant.rewards.reduce((sum, r) =>
                sum + (parseFloat(r.value) / 100), 0)),
            rewards: newMerchant.rewards.filter(r => r.value && r.name),
            notes: newMerchant.notes,
            bestValue: false // Will be calculated when comparing with other merchants
        };

        setItems(items.map(item => {
            if (item.id !== selectedItemId) return item;
            return {
                ...item,
                options: item.options.map(opt => {
                    if (opt.id !== optionId) return opt;

                    // Add new merchant and recalculate bestValue flag
                    const updatedMerchants = [...opt.merchants, merchant];
                    const lowestPrice = Math.min(...updatedMerchants.map(m => m.netPrice));

                    return {
                        ...opt,
                        merchants: updatedMerchants.map(m => ({
                            ...m,
                            bestValue: m.netPrice === lowestPrice
                        }))
                    };
                })
            };
        }));

        setShowMerchantModal(false);
        setNewMerchant({
            name: '',
            price: 0,
            rewards: [{ type: 'credit-card', value: '', name: '' }],
            notes: ''
        });
    };

    const handleRemoveOption = (itemId: string, optionId: string) => {
        setItems(items.map(item => {
            if (item.id !== itemId) return item;
            return {
                ...item,
                options: item.options.filter(opt => opt.id !== optionId)
            };
        }));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };
    return (
        <div className="p-6 space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-2xl font-bold mb-1">{metrics.activePlans}</div>
                            <p className="text-sm text-muted-foreground">Active Plans</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {metrics.highPriorityCount} High Priority
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-2xl font-bold mb-1">{formatCurrency(metrics.totalPlanned)}</div>
                            <p className="text-sm text-muted-foreground">Total Planned</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Next: Standing Desk ($700)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-2xl font-bold mb-1">{(metrics.averageSavings * 100).toFixed(0)}%</div>
                            <p className="text-sm text-muted-foreground">Average Savings</p>
                            <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${metrics.averageSavings * 100}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-2xl font-bold mb-1">{metrics.plansOptimized}/{metrics.activePlans}</div>
                            <p className="text-sm text-muted-foreground">Plans Optimized</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                25% or more Below MSRP
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="h-[calc(100vh-12rem)] flex bg-gray-50">
                {/* Priority Rail */}
                <div className="w-60 border-r bg-white">
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-sm">Priority Items</h2>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={handleAddItem}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <Input
                            className="text-sm"
                            placeholder="Search across all items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="h-[calc(100vh-5rem)]">
                        <div className="p-2 space-y-4">
                            {Object.entries(itemsByPriority).map(([priority, priorityItems]) => (
                                <div key={priority} className={`space-y-1`}>
                                    <div className="px-2 py-1 flex items-center gap-2 text-xs font-medium text-gray-500 uppercase">
                                        {priority === 'high' && <ArrowUpCircle className="h-4 w-4 text-red-500" />}
                                        {priority === 'normal' && <Circle className="h-4 w-4 text-amber-500" />}
                                        {priority === 'low' && <MinusCircle className="h-4 w-4 text-blue-500" />}
                                        {priority}
                                    </div>
                                    {priorityItems
                                        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map(item => (
                                            <div
                                                key={item.id}
                                                className={`px-2 py-1.5 rounded-md text-sm cursor-pointer
                                                ${selectedItemId === item.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
                                                onClick={() => handleSelectItem(item.id)}
                                            >
                                                {item.name}
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                {/* Product Analysis Panel */}
                <div className="flex-1 max-w-4xl border-r bg-white">
                    {selectedItem ? (
                        <>
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="font-semibold">{selectedItem.name}</h2>
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            {selectedItem.priority === 'high' && <ArrowUpCircle className="h-4 w-4 text-red-500" />}
                                            {selectedItem.priority === 'normal' && <Circle className="h-4 w-4 text-amber-500" />}
                                            {selectedItem.priority === 'low' && <MinusCircle className="h-4 w-4 text-blue-500" />}
                                            {selectedItem.priority.charAt(0).toUpperCase() + selectedItem.priority.slice(1)} Priority •
                                            Target: {formatCurrency(selectedItem.targetPrice.min)}-{formatCurrency(selectedItem.targetPrice.max)}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => setShowProductModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        Add Option
                                    </Button>
                                </div>
                                <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                                    <TabsList>
                                        <TabsTrigger value="all">All Options</TabsTrigger>
                                        <TabsTrigger value="shortlist">Shortlist</TabsTrigger>
                                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            <ScrollArea className="h-[calc(100vh-8rem)]">
                                <div className="p-4 space-y-6">
                                    {selectedItem.options
                                        .filter(option => {
                                            if (activeTab === 'all') return true;
                                            if (activeTab === 'shortlist') return option.status === 'shortlisted';
                                            return option.status === 'rejected';
                                        })
                                        .map(option => (
                                            <Card key={option.id} className={option.status === 'shortlisted' ? 'ring-2 ring-blue-100' : ''}>
                                                <CardContent className="p-6">
                                                    <div className="flex gap-6">
                                                        <img
                                                            src={option.image}
                                                            alt={option.name}
                                                            className="w-48 h-32 object-cover rounded-md bg-gray-100"
                                                        />
                                                        <div className="flex-1 space-y-4">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h3 className="font-medium text-lg">
                                                                        {option.status === 'shortlisted' && (
                                                                            <Star className="h-4 w-4 text-yellow-400 inline mr-2" />
                                                                        )}
                                                                        {option.name}
                                                                    </h3>
                                                                    <div className="text-sm text-gray-500">
                                                                        MSRP: {formatCurrency(option.price.msrp)} Now: {formatCurrency(option.price.current)}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-1">
                                                                {option.specs.map((spec, i) => (
                                                                    <div key={i} className="text-sm text-gray-600">• {spec}</div>
                                                                ))}
                                                            </div>

                                                            <Separator />

                                                            <div className="space-y-2">
                                                                <div className="flex items-start gap-2 text-sm">
                                                                    <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                                                                    <div className="text-gray-600">{option.notes}</div>
                                                                </div>

                                                                <div className="flex items-center gap-3">
                                                                    {option.reviews.map((review, i) => (
                                                                        <a
                                                                            key={i}
                                                                            href={review.url}
                                                                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                                                        >
                                                                            <Link className="h-3 w-3" />
                                                                            {review.source}
                                                                        </a>
                                                                    ))}
                                                                </div>

                                                                {/* Action Buttons */}
                                                                <div className="flex gap-2 mt-4">
                                                                    <Button
                                                                        size="sm"
                                                                        variant={option.status === 'shortlisted' ? 'default' : 'outline'}
                                                                        className="w-28"
                                                                        onClick={() => handleUpdateItemStatus(selectedItem.id, option.id, 'shortlisted')}
                                                                    >
                                                                        Shortlist
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant={option.status === 'rejected' ? 'destructive' : 'outline'}
                                                                        className="w-28"
                                                                        onClick={() => handleUpdateItemStatus(selectedItem.id, option.id, 'rejected')}
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="w-28"
                                                                        onClick={() => handleRemoveOption(selectedItem.id, option.id)}
                                                                    >
                                                                        Remove
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            </ScrollArea>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select an item to view details
                        </div>
                    )}
                </div>
                {/* Merchant Comparison Panel */}
                <div className="w-96 bg-white">
                    {selectedOption ? (
                        <>
                            <div className="p-4 border-b">
                                <h2 className="font-semibold mb-2">{selectedOption.name}</h2>
                                <div className="text-sm text-gray-500">
                                    Best Value: {formatCurrency(selectedOption.merchants[0]?.netPrice || 0)}
                                    ({formatCurrency(selectedOption.merchants[0]?.netPrice || 0)} after rewards)
                                </div>
                            </div>
                            <ScrollArea className="h-[calc(100vh-5rem)]">
                                <div className="p-4 space-y-4">
                                    {selectedOption.merchants.map((merchant) => (
                                        <Card
                                            key={merchant.id}
                                            className={merchant.bestValue ? 'ring-2 ring-green-200 bg-green-50' : ''}
                                        >
                                            <CardContent className="p-4">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h3 className="font-medium">{merchant.name}</h3>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="text-gray-500 line-through">${selectedOption.price.msrp}</span>
                                                                <span className="text-gray-500">→ ${merchant.price}</span>
                                                                <span className="text-green-600 font-medium">→ ${merchant.netPrice}</span>
                                                            </div>
                                                        </div>
                                                        {merchant.bestValue && (
                                                            <Badge className="bg-green-100 text-green-800">Best Value</Badge>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        {merchant.rewards.map((reward, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                                {reward.type === 'store' ? (
                                                                    <Store className="h-4 w-4" />
                                                                ) : (
                                                                    <CreditCard className="h-4 w-4" />
                                                                )}
                                                                {reward.value} {reward.name}
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            Free Shipping
                                                        </div>
                                                        {merchant.notes && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <AlertCircle className="h-4 w-4" />
                                                                {merchant.notes}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {merchant.bestValue && (
                                                        <Button
                                                            className="w-full bg-gray-900 hover:bg-gray-800"
                                                            onClick={() => {
                                                                // Here you'd implement purchase tracking logic
                                                                console.log('Marked as purchased from:', merchant.name);
                                                            }}
                                                        >
                                                            Mark Purchased
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a product option to view merchants
                        </div>
                    )}
                </div>
            </div>

            {/* Add Product Modal */}
            <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Product Option</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Product Name</Label>
                            <Input
                                value={newProduct.name}
                                onChange={(e) => setNewProduct(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>MSRP</Label>
                                <Input
                                    type="number"
                                    value={newProduct.price.msrp}
                                    onChange={(e) => setNewProduct(prev => ({
                                        ...prev,
                                        price: { ...prev.price, msrp: parseFloat(e.target.value) }
                                    }))}
                                />
                            </div>
                            <div>
                                <Label>Current Price</Label>
                                <Input
                                    type="number"
                                    value={newProduct.price.current}
                                    onChange={(e) => setNewProduct(prev => ({
                                        ...prev,
                                        price: { ...prev.price, current: parseFloat(e.target.value) }
                                    }))}
                                />
                            </div>
                        </div>
                        <div>
                            <Label>Specifications</Label>
                            {newProduct.specs.map((spec, index) => (
                                <div key={index} className="flex gap-2 mt-2">
                                    <Input
                                        value={spec}
                                        onChange={(e) => {
                                            const newSpecs = [...newProduct.specs];
                                            newSpecs[index] = e.target.value;
                                            setNewProduct(prev => ({ ...prev, specs: newSpecs }));
                                        }}
                                        placeholder="e.g., Height Range: 24.5&quot; to 50&quot;"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            if (index === newProduct.specs.length - 1) {
                                                setNewProduct(prev => ({
                                                    ...prev,
                                                    specs: [...prev.specs, '']
                                                }));
                                            } else {
                                                setNewProduct(prev => ({
                                                    ...prev,
                                                    specs: prev.specs.filter((_, i) => i !== index)
                                                }));
                                            }
                                        }}
                                    >
                                        {index === newProduct.specs.length - 1 ? '+' : '-'}
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div>
                            <Label>Notes</Label>
                            <Textarea
                                value={newProduct.notes}
                                onChange={(e) => setNewProduct(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                                placeholder="Add any important details about this product option"
                                className="h-20"
                            />
                        </div>

                        <div>
                            <Label>Reviews</Label>
                            {newProduct.reviews.map((review, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2 mt-2">
                                    <Input
                                        placeholder="Source"
                                        value={review.source}
                                        onChange={(e) => {
                                            const newReviews = [...newProduct.reviews];
                                            newReviews[index] = { ...review, source: e.target.value };
                                            setNewProduct(prev => ({ ...prev, reviews: newReviews }));
                                        }}
                                    />
                                    <Input
                                        placeholder="Title"
                                        value={review.title}
                                        onChange={(e) => {
                                            const newReviews = [...newProduct.reviews];
                                            newReviews[index] = { ...review, title: e.target.value };
                                            setNewProduct(prev => ({ ...prev, reviews: newReviews }));
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="URL"
                                            value={review.url}
                                            onChange={(e) => {
                                                const newReviews = [...newProduct.reviews];
                                                newReviews[index] = { ...review, url: e.target.value };
                                                setNewProduct(prev => ({ ...prev, reviews: newReviews }));
                                            }}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                if (index === newProduct.reviews.length - 1) {
                                                    setNewProduct(prev => ({
                                                        ...prev,
                                                        reviews: [...prev.reviews, { source: '', title: '', url: '' }]
                                                    }));
                                                } else {
                                                    setNewProduct(prev => ({
                                                        ...prev,
                                                        reviews: prev.reviews.filter((_, i) => i !== index)
                                                    }));
                                                }
                                            }}
                                        >
                                            {index === newProduct.reviews.length - 1 ? '+' : '-'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowProductModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddProductOption}>
                                Add Product Option
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Merchant Modal */}
            <Dialog open={showMerchantModal} onOpenChange={setShowMerchantModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Merchant Option</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Merchant Name</Label>
                            <Input
                                value={newMerchant.name}
                                onChange={(e) => setNewMerchant(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                placeholder="e.g., Amazon, Best Buy"
                            />
                        </div>

                        <div>
                            <Label>Price</Label>
                            <Input
                                type="number"
                                value={newMerchant.price}
                                onChange={(e) => setNewMerchant(prev => ({
                                    ...prev,
                                    price: parseFloat(e.target.value)
                                }))}
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <Label>Rewards</Label>
                            {newMerchant.rewards.map((reward, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2 mt-2">
                                    <Input
                                        placeholder="Value (%)"
                                        value={reward.value}
                                        onChange={(e) => {
                                            const newRewards = [...newMerchant.rewards];
                                            newRewards[index] = { ...reward, value: e.target.value };
                                            setNewMerchant(prev => ({ ...prev, rewards: newRewards }));
                                        }}
                                    />
                                    <Input
                                        placeholder="Name"
                                        value={reward.name}
                                        onChange={(e) => {
                                            const newRewards = [...newMerchant.rewards];
                                            newRewards[index] = { ...reward, name: e.target.value };
                                            setNewMerchant(prev => ({ ...prev, rewards: newRewards }));
                                        }}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            if (index === newMerchant.rewards.length - 1) {
                                                setNewMerchant(prev => ({
                                                    ...prev,
                                                    rewards: [...prev.rewards, { type: 'credit-card', value: '', name: '' }]
                                                }));
                                            } else {
                                                setNewMerchant(prev => ({
                                                    ...prev,
                                                    rewards: prev.rewards.filter((_, i) => i !== index)
                                                }));
                                            }
                                        }}
                                    >
                                        {index === newMerchant.rewards.length - 1 ? '+' : '-'}
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div>
                            <Label>Notes</Label>
                            <Textarea
                                value={newMerchant.notes}
                                onChange={(e) => setNewMerchant(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                                placeholder="Add any important details about this merchant"
                                className="h-20"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowMerchantModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => handleAddMerchant(editingOptionId!)}>
                                Add Merchant
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PurchasePlannerMockup;