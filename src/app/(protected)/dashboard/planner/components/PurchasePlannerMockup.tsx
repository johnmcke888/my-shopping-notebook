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
    ChevronRight, Clock, Link, MessageSquare, Bookmark,
    X, Package, Building2, RefreshCw, Ban
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Core types
interface PurchaseItem {
    id: string;
    name: string;
    priority: 'high' | 'normal' | 'low';
    targetPrice: {
        min: number;
        max: number;
    };
    notes?: string;
    options: ProductOption[];
    selectedOption?: string;
    status: 'active' | 'archived';  // This is what we added
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
    shipping?: string;
    tax?: number | 'none' | 'unknown';
    returnPolicy?: string;
}

// Add this after the interfaces and before any components
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

interface ConfirmationDialogProps {
    title: string;
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    primaryAction: () => void;
    primaryActionText: string;
    secondaryAction?: () => void;
    secondaryActionText?: string;
    destructive?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    title,
    children,
    open,
    onOpenChange,
    primaryAction,
    primaryActionText,
    secondaryAction,
    secondaryActionText,
    destructive = false
}) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                {children}
                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    {secondaryAction && (
                        <Button
                            variant="secondary"
                            onClick={secondaryAction}
                        >
                            {secondaryActionText}
                        </Button>
                    )}
                    <Button
                        variant={destructive ? "destructive" : "default"}
                        onClick={primaryAction}
                    >
                        {primaryActionText}
                    </Button>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);

interface RemoveMerchantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    merchant: string;
    onConfirm: () => void;
}

const RemoveMerchantDialog: React.FC<RemoveMerchantDialogProps> = ({
    open,
    onOpenChange,
    merchant,
    onConfirm
}) => (
    <ConfirmationDialog
        title="Remove Merchant Option"
        open={open}
        onOpenChange={onOpenChange}
        primaryAction={onConfirm}
        primaryActionText="Remove"
        destructive
    >
        <p>Are you sure you want to remove {merchant}? This can't be undone.</p>
    </ConfirmationDialog>
);

interface RemoveProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReject: () => void;
    onRemove: () => void;
}

const RemoveProductDialog: React.FC<RemoveProductDialogProps> = ({
    open,
    onOpenChange,
    onReject,
    onRemove
}) => (
    <ConfirmationDialog
        title="Remove Product Option"
        open={open}
        onOpenChange={onOpenChange}
        primaryAction={onRemove}
        primaryActionText="Remove Completely"
        secondaryAction={onReject}
        secondaryActionText="Move to Rejected"
        destructive
    >
        <p>Keep in rejected list for future reference?</p>
    </ConfirmationDialog>
);

interface ProductCardProps {
    product: ProductOption;
    isSelected: boolean;
    onSelect: (id: string) => void;
    selectedItem: PurchaseItem;
    setEditingOptionId: (id: string | null) => void;
    setShowMerchantModal: (show: boolean) => void;
    setShowRemoveConfirmModal: (show: boolean) => void;
    handleUpdateItemStatus: (itemId: string, optionId: string, status: ProductOption['status']) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    isSelected,
    onSelect,
    selectedItem,
    setEditingOptionId,
    setShowMerchantModal,
    setShowRemoveConfirmModal,
    handleUpdateItemStatus
}) => {
    const savings = ((product.price.msrp - product.price.current) / product.price.msrp * 100).toFixed(0);

    return (
        <Card
            className={`relative bg-white ${isSelected ? 'ring-2 ring-blue-100 bg-blue-50' : 'hover:bg-gray-50'} 
                transition-all cursor-pointer`}
            onClick={() => onSelect(product.id)}
        >
            <CardContent className="p-6">
                <div className="flex gap-6">
                    {/* Left Column - Image */}
                    <div className="w-48 flex-shrink-0">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-32 w-full object-cover rounded-md bg-gray-100"
                        />
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Product Info */}
                        <div className="flex justify-between">
                            <div className="flex-1 pr-6">
                                {/* Header */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium flex items-center gap-4">
                                            {product.name}
                                            <div className="flex items-center gap-1 text-sm">
                                                <span className="text-gray-500 line-through">
                                                    {formatCurrency(product.price.msrp)}
                                                </span>
                                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">
                                                    {formatCurrency(product.price.current)}
                                                </span>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                                                    {savings}% Off
                                                </Badge>
                                            </div>
                                        </h3>
                                    </div>
                                    {product.status === 'shortlisted' && (
                                        <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                                            <Star className="h-4 w-4 mr-1 inline" />
                                            Shortlisted
                                        </Badge>
                                    )}
                                </div>

                                {/* Specs */}
                                <div className="space-y-1 mb-4">
                                    {product.specs.map((spec, i) => (
                                        <div key={i} className="text-sm text-gray-600">• {spec}</div>
                                    ))}
                                </div>

                                {/* Reviews */}
                                <div className="flex items-center gap-3">
                                    {product.reviews.map((review, i) => (
                                        <a
                                            key={i}
                                            href={review.url}
                                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Link className="h-3 w-3" />
                                            {review.source}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons - Right side with proper spacing */}
                            <div className="absolute top-6 right-6 flex flex-col gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center justify-center gap-2 transition-all duration-200
                  w-[120px] md:w-28  // Full width on larger screens
                  min-w-[32px]"      // Prevents squishing on small screens
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingOptionId(product.id);
                                        setShowMerchantModal(true);
                                    }}
                                >
                                    <Store className="h-4 w-4" />
                                    <span className="hidden md:inline">Add Seller</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant={product.status === 'shortlisted' ? 'default' : 'outline'}
                                    className="flex items-center justify-center gap-2 transition-all duration-200
                  w-[120px] md:w-28
                  min-w-[32px]"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newStatus = product.status === 'shortlisted' ? 'considering' : 'shortlisted';
                                        handleUpdateItemStatus(selectedItem.id, product.id, newStatus);
                                    }}
                                >
                                    <Star className="h-4 w-4" />
                                    <span className="hidden md:inline">Shortlist</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant={product.status === 'rejected' ? 'destructive' : 'outline'}
                                    className="flex items-center justify-center gap-2 transition-all duration-200
                  w-[120px] md:w-28
                  min-w-[32px]"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newStatus = product.status === 'rejected' ? 'considering' : 'rejected';
                                        handleUpdateItemStatus(selectedItem.id, product.id, newStatus);
                                    }}
                                >
                                    <MinusCircle className="h-4 w-4" />
                                    <span className="hidden md:inline">Reject</span>
                                </Button>
                            </div>
                        </div>

                        {/* Notes Section */}
                        {product.notes && (
                            <div className="mt-2 pt-2 border-t">
                                <div className="flex items-start gap-2 text-sm">
                                    <MessageSquare className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                                    <span className="text-gray-600">{product.notes}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            {/* Remove Button - Top Right */}
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                onClick={(e) => {
                    e.stopPropagation();
                    setEditingOptionId(product.id);
                    setShowRemoveConfirmModal(true);
                }}
            >
                <X className="h-4 w-4" />
            </Button>

            {/* Rejection Overlay */}
            {product.status === 'rejected' && (
                <div className="absolute inset-0 bg-gray-500/10">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-0 w-[200%] h-[200%] origin-top-left -rotate-45 border-t-2 border-gray-300 transform -translate-y-1/2" />
                    </div>
                </div>
            )}
        </Card>
    );
};

// Add after the existing interfaces
interface DetailRowProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <span className="text-gray-500">{label}:</span>
        <span className="text-gray-700">{value}</span>
    </div>
);

interface RewardRowProps {
    reward: {
        type: 'credit-card' | 'store';
        value: string;
        name: string;
    };
}

const RewardRow: React.FC<RewardRowProps> = ({ reward }) => (
    <div className="flex items-center gap-2 text-sm text-gray-600">
        {reward.type === 'store' ? (
            <Store className="h-4 w-4" />
        ) : (
            <CreditCard className="h-4 w-4" />
        )}
        <span>{reward.value} {reward.name}</span>
    </div>
);

// Add the helper function
const formatTax = (tax: number | 'none' | 'unknown'): string => {
    if (tax === 'none') return 'No sales tax';
    if (tax === 'unknown') return 'Tax unknown';
    return `${tax}% sales tax`;
};

// Update MerchantCard interface
interface MerchantCardProps extends MerchantOption {
    onRemove: () => void;
}

const MerchantCard: React.FC<MerchantCardProps> = ({
    name,
    price,
    netPrice,
    bestValue,
    shipping,
    tax,
    returnPolicy,
    rewards,
    onRemove
}) => (
    <Card className="relative">
        {bestValue && (
            <Badge className="absolute -top-2 -right-2 bg-green-100 text-green-800">
                Best Value
            </Badge>
        )}

        <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-lg">{name}</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-red-600"
                    onClick={onRemove}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">List Price</span>
                    <span className="line-through">{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-500">Cash Price</span>
                    <span>{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-green-600">
                    <span>Net Price</span>
                    <span>{formatCurrency(netPrice)}</span>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <DetailRow
                    icon={Package}
                    label="Shipping"
                    value={shipping || "Free shipping"}
                />
                <DetailRow
                    icon={Building2}
                    label="Sales Tax"
                    value={formatTax(tax || 'unknown')}
                />
                <DetailRow
                    icon={RefreshCw}
                    label="Returns"
                    value={returnPolicy || "Return policy unknown"}
                />
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500">Rewards & Savings</h4>
                {rewards.map((reward, i) => (
                    <RewardRow key={i} reward={reward} />
                ))}
            </div>

            {bestValue && (
                <Button className="w-full mt-6" variant="default">
                    Mark Purchased
                </Button>
            )}
        </CardContent>
    </Card>
);

const PurchasePlannerMockup: React.FC = () => {
    // Initialize with sample data
    const [items, setItems] = useState<PurchaseItem[]>([
        {
            id: '1',
            name: 'Standing Desk',
            priority: 'high',
            targetPrice: { min: 500, max: 700 },
            status: 'active',  // Add this line
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

    const [selectedItemId, setSelectedItemId] = useState<string | null>('1');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'shortlist' | 'rejected'>('all');
    const [showProductModal, setShowProductModal] = useState(false);
    const [showMerchantModal, setShowMerchantModal] = useState(false);
    const [showNeedModal, setShowNeedModal] = useState(false);
    const [newNeed, setNewNeed] = useState({
        name: '',
        priority: 'normal' as 'high' | 'normal' | 'low',
        targetPrice: {
            min: 0,
            max: 0
        },
        notes: ''
    });
    const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: { msrp: 0, current: 0 },
        specs: [''],
        notes: '',
        reviews: [{ source: '', title: '', url: '' }]
    });
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToAction, setItemToAction] = useState<string | null>(null);
    const [showRemoveConfirmModal, setShowRemoveConfirmModal] = useState(false);
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
        if (!newNeed.name) return;

        if (editingItemId) {
            // Editing existing item
            setItems(items.map(item =>
                item.id === editingItemId
                    ? {
                        ...item,
                        name: newNeed.name,
                        priority: newNeed.priority,
                        targetPrice: {
                            min: newNeed.targetPrice.max,
                            max: newNeed.targetPrice.max
                        },
                        notes: newNeed.notes,
                        status: item.status // Preserve existing status
                    }
                    : item
            ));
            setEditingItemId(null);
        } else {
            // Adding new item
            const newItem: PurchaseItem = {
                id: `item-${Date.now()}`,
                name: newNeed.name,
                priority: newNeed.priority,
                targetPrice: {
                    min: newNeed.targetPrice.max,
                    max: newNeed.targetPrice.max
                },
                notes: newNeed.notes,
                options: [],
                status: 'active' // Ensure new items always have 'active' status
            };
            setItems([...items, newItem]);
            setSelectedItemId(newItem.id);
        }

        // Reset form and close modal
        setShowNeedModal(false);
        setNewNeed({
            name: '',
            priority: 'normal',
            targetPrice: { min: 0, max: 0 },
            notes: ''
        });
    };

    const handleSelectItem = (id: string) => {
        setSelectedItemId(id);
    };

    const handleUpdateItemStatus = (
        itemId: string,
        optionId: string,
        status: ProductOption['status']
    ) => {
        setItems(items.map(item => {
            if (item.id !== itemId) return item;
            return {
                ...item,
                options: item.options.map(opt => {
                    if (opt.id !== optionId) return opt;
                    return { ...opt, status };
                })
            };
        }));
    };

    const handleRemoveMerchant = (optionId: string, merchantId: string) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id !== selectedItem?.id) return item;

            const updatedOptions = item.options.map(opt => {
                if (opt.id !== optionId) return opt;

                // Remove the merchant and recalculate best value
                const updatedMerchants = opt.merchants.filter(m => m.id !== merchantId);
                if (updatedMerchants.length === 0) return { ...opt, merchants: [] };

                const lowestPrice = Math.min(...updatedMerchants.map(m => m.netPrice));
                return {
                    ...opt,
                    merchants: updatedMerchants.map(m => ({
                        ...m,
                        bestValue: m.netPrice === lowestPrice
                    }))
                };
            });

            return { ...item, options: updatedOptions };
        }));
    };

    const handleAddProductOption = () => {
        if (!selectedItem) return;
        if (!newProduct.name) return;

        const newOption: ProductOption = {
            id: `option-${Date.now()}`,
            name: newProduct.name,
            image: '/api/placeholder/400/200',
            price: {
                msrp: Number(newProduct.price.msrp) || 0,
                current: Number(newProduct.price.current) || 0
            },
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

        console.log('Updated items:', items); // Add this line

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

    const handleArchivePlan = () => {
        if (!itemToAction) return;

        setItems(items.map(item =>
            item.id === itemToAction
                ? { ...item, status: 'archived' }
                : item
        ));

        setShowArchiveConfirm(false);
        setItemToAction(null);
    };

    const handleDeletePlan = () => {
        if (!itemToAction) return;

        setItems(items.filter(item => item.id !== itemToAction));

        setShowDeleteConfirm(false);
        setItemToAction(null);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-2xl font-bold mb-1">1</div>
                            <p className="text-sm text-muted-foreground">Active Plans</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                1 High Priority
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-2xl font-bold mb-1">$649</div>
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
                            <div className="text-2xl font-bold mb-1">19%</div>
                            <p className="text-sm text-muted-foreground">Average Savings</p>
                            <div className="w-full bg-gray-100 h-2 rounded-full mt-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: '19%' }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="text-2xl font-bold mb-1">0/1</div>
                            <p className="text-sm text-muted-foreground">Plans Optimized</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                25% or more Below MSRP
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="h-[calc(100vh-12rem)]">
                <div className="flex h-full">
                    {/* Priority Rail - 15% */}
                    <div className="w-60 flex-shrink-0 border-r bg-white">
                        <div className="p-4 flex flex-col gap-4 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold text-sm">Purchase Plans</h2>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setShowNeedModal(true)}
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
                        <div className="overflow-auto h-[calc(100%-88px)]">
                            <div className="p-2 space-y-4">
                                <div className="space-y-6">
                                    {/* Active Plans */}
                                    {Object.entries(itemsByPriority).map(([priority, priorityItems]) => (
                                        <div key={priority} className={`space-y-1`}>
                                            <div className="px-2 py-1 flex items-center gap-2 text-xs font-medium text-gray-500 uppercase">
                                                {priority === 'high' && <ArrowUpCircle className="h-4 w-4 text-red-500" />}
                                                {priority === 'normal' && <Circle className="h-4 w-4 text-amber-500" />}
                                                {priority === 'low' && <MinusCircle className="h-4 w-4 text-blue-500" />}
                                                {priority}
                                            </div>
                                            {priorityItems
                                                .filter(item => !item.status || item.status === 'active')
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

                                    {/* Archived Plans */}
                                    <div className="mt-8">
                                        <div className="px-2 py-1 flex items-center gap-2 text-xs font-medium text-gray-500 uppercase">
                                            <Bookmark className="h-4 w-4 text-gray-500" />
                                            Archived Plans
                                        </div>
                                        {items
                                            .filter(item => item.status === 'archived')
                                            .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(item => (
                                                <div
                                                    key={item.id}
                                                    className="px-2 py-1.5 rounded-md text-sm cursor-pointer text-gray-500 hover:bg-gray-100"
                                                    onClick={() => handleSelectItem(item.id)}
                                                >
                                                    {item.name}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Analysis Panel - 55% */}
                    <div className="flex-1 border-r bg-white overflow-hidden">
                        {selectedItem ? (
                            <div className="h-full flex flex-col">
                                <div className="p-4 border-b flex-shrink-0">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h2 className="font-semibold">{selectedItem.name}</h2>
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                                    {selectedItem.priority === 'high' && <ArrowUpCircle className="h-4 w-4 text-red-500" />}
                                                    {selectedItem.priority === 'normal' && <Circle className="h-4 w-4 text-amber-500" />}
                                                    {selectedItem.priority === 'low' && <MinusCircle className="h-4 w-4 text-blue-500" />}
                                                    {selectedItem.priority.charAt(0).toUpperCase() + selectedItem.priority.slice(1)} Priority •
                                                    Target: {formatCurrency(selectedItem.targetPrice.max)}
                                                </div>
                                                {selectedItem.notes && (
                                                    <div className="text-sm text-gray-600 flex items-start gap-2">
                                                        <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                                                        <span>{selectedItem.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {selectedItem?.status === 'archived' ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (!selectedItem) return;
                                                        setItems(prevItems => prevItems.map(item =>
                                                            item.id === selectedItem.id
                                                                ? { ...item, status: 'active' }
                                                                : item
                                                        ));
                                                    }}
                                                >
                                                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                                                    Reactivate Plan
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (!selectedItem) return;
                                                        setItemToAction(selectedItem.id);
                                                        setShowArchiveConfirm(true);
                                                    }}
                                                >
                                                    <Bookmark className="h-4 w-4 mr-2" />
                                                    Archive Plan
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingItemId(selectedItem.id);
                                                    setNewNeed({
                                                        name: selectedItem.name,
                                                        priority: selectedItem.priority,
                                                        targetPrice: selectedItem.targetPrice,
                                                        notes: selectedItem.notes || ''
                                                    });
                                                    setShowNeedModal(true);
                                                }}
                                            >
                                                Edit Details
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => setShowProductModal(true)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                Add Option
                                            </Button>
                                        </div>
                                    </div>
                                    <Tabs value={activeTab} onValueChange={(value: 'all' | 'shortlist' | 'rejected') => setActiveTab(value)}>
                                        <TabsList>
                                            <TabsTrigger value="all">All Options</TabsTrigger>
                                            <TabsTrigger value="shortlist">Shortlist</TabsTrigger>
                                            <TabsTrigger value="rejected">Rejected</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                                <div className="overflow-auto flex-1 p-4">
                                    <div className="space-y-6">
                                        {selectedItem.options
                                            .filter(option => {
                                                if (activeTab === 'all') return true;
                                                if (activeTab === 'shortlist') return option.status === 'shortlisted';
                                                return option.status === 'rejected';
                                            })
                                            .map(option => (
                                                <ProductCard
                                                    key={option.id}
                                                    product={option}
                                                    isSelected={option.id === selectedItem.selectedOption}
                                                    selectedItem={selectedItem}
                                                    setEditingOptionId={setEditingOptionId}
                                                    setShowMerchantModal={setShowMerchantModal}
                                                    setShowRemoveConfirmModal={setShowRemoveConfirmModal}
                                                    handleUpdateItemStatus={handleUpdateItemStatus}
                                                    onSelect={(id) => {
                                                        setItems(prevItems => prevItems.map(item =>
                                                            item.id === selectedItem.id
                                                                ? { ...item, selectedOption: id }
                                                                : item
                                                        ));
                                                    }}
                                                />
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Select an item to view details
                            </div>
                        )}
                    </div>

                    {/* Merchant Panel - 30% */}
                    <div className="w-96 flex-shrink-0 bg-white">
                        {selectedOption ? (
                            <div className="h-full flex flex-col">
                                <div className="p-4 border-b flex-shrink-0">
                                    <h2 className="font-semibold mb-6">{selectedOption.name}</h2>
                                    <div className="space-y-1">
                                        <div className="text-sm flex justify-between">
                                            <span className="text-gray-500">Cash Price:</span>
                                            <span className="font-medium">{formatCurrency(selectedOption.merchants[0]?.price || 0)}</span>
                                        </div>
                                        <div className="text-sm flex justify-between">
                                            <span className="text-gray-500">Net Price:</span>
                                            <span className="text-green-600 font-medium">{formatCurrency(selectedOption.merchants[0]?.netPrice || 0)}</span>
                                        </div>
                                        <div className="text-sm flex justify-between">
                                            <span className="text-gray-500">Total Savings:</span>
                                            <span className="text-green-600 font-medium">{formatCurrency((selectedOption.merchants[0]?.price || 0) - (selectedOption.merchants[0]?.netPrice || 0))}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-auto flex-1 p-4">
                                    <div className="space-y-4">
                                        {selectedOption.merchants.map((merchant) => (
                                            <MerchantCard
                                                key={merchant.id}
                                                {...merchant}
                                                onRemove={() => {
                                                    setEditingOptionId(merchant.id);
                                                    setShowRemoveConfirmModal(true);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Select a product option to view merchants
                            </div>
                        )}
                    </div>
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
                                    value={newProduct.price.msrp || ''}
                                    onChange={(e) => setNewProduct(prev => ({
                                        ...prev,
                                        price: {
                                            ...prev.price,
                                            msrp: e.target.value === '' ? 0 : Number(e.target.value)
                                        }
                                    }))}
                                />
                            </div>
                            <div>
                                <Label>Current Price</Label>
                                <Input
                                    type="number"
                                    value={newProduct.price.current || ''}
                                    onChange={(e) => setNewProduct(prev => ({
                                        ...prev,
                                        price: {
                                            ...prev.price,
                                            current: e.target.value === '' ? 0 : Number(e.target.value)
                                        }
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
            {/* Need Management Modal */}
            <Dialog open={showNeedModal} onOpenChange={setShowNeedModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItemId ? 'Edit Item' : 'Add New Item'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Name</Label>
                            <Input
                                value={newNeed.name}
                                onChange={(e) => setNewNeed(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                placeholder="e.g., Standing Desk"
                            />
                        </div>

                        <div>
                            <Label>Priority</Label>
                            <div className="flex gap-4 mt-2">
                                <Button
                                    variant={newNeed.priority === 'high' ? "default" : "outline"}
                                    onClick={() => setNewNeed(prev => ({ ...prev, priority: 'high' }))}
                                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 border-red-200"
                                >
                                    High
                                </Button>
                                <Button
                                    variant={newNeed.priority === 'normal' ? "default" : "outline"}
                                    onClick={() => setNewNeed(prev => ({ ...prev, priority: 'normal' }))}
                                    className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 border-amber-200"
                                >
                                    Normal
                                </Button>
                                <Button
                                    variant={newNeed.priority === 'low' ? "default" : "outline"}
                                    onClick={() => setNewNeed(prev => ({ ...prev, priority: 'low' }))}
                                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200"
                                >
                                    Low
                                </Button>
                            </div>
                        </div>

                        <div>
                            <Label>Target Budget</Label>
                            <div className="mt-2">
                                <Input
                                    type="number"
                                    placeholder="Maximum budget"
                                    value={newNeed.targetPrice.max === 0 ? '' : newNeed.targetPrice.max}
                                    onChange={(e) => setNewNeed(prev => ({
                                        ...prev,
                                        targetPrice: {
                                            min: 0,
                                            max: e.target.value === '' ? 0 : parseInt(e.target.value)
                                        }
                                    }))}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Notes (Optional)</Label>
                            <Textarea
                                value={newNeed.notes}
                                onChange={(e) => setNewNeed(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                                placeholder="Add any additional context or requirements"
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            {editingItemId && (
                                <Button
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        setItemToAction(editingItemId);
                                        setShowDeleteConfirm(true);
                                        setShowNeedModal(false);
                                    }}
                                >
                                    Delete Plan
                                </Button>
                            )}
                            <div className="flex gap-2 ml-auto">
                                <Button variant="outline" onClick={() => setShowNeedModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddItem}>
                                    {editingItemId ? 'Save Changes' : 'Add Item'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Archive Confirmation Modal */}
            <Dialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Archive Purchase Plan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>This plan will be moved to Archives for future reference. You can find it there if you need to revisit these options later.</p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowArchiveConfirm(false);
                                    setItemToAction(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    if (!itemToAction) return;
                                    setItems(prevItems => prevItems.map(item =>
                                        item.id === itemToAction
                                            ? { ...item, status: 'archived' }
                                            : item
                                    ));
                                    setShowArchiveConfirm(false);
                                    setItemToAction(null);
                                    setSelectedItemId(null); // Clear selection after archiving
                                }}
                            >
                                Archive Plan
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Purchase Plan</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-red-600">This plan will be permanently deleted. This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setItemToAction(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (!itemToAction) return;
                                    setItems(prevItems => prevItems.filter(item => item.id !== itemToAction));
                                    setShowDeleteConfirm(false);
                                    setItemToAction(null);
                                }}
                            >
                                Delete Plan
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Remove Option Confirmation Modal */}
            <RemoveProductDialog
                open={showRemoveConfirmModal}
                onOpenChange={setShowRemoveConfirmModal}
                onReject={() => {
                    if (!selectedItem || !editingOptionId) return;
                    handleUpdateItemStatus(selectedItem.id, editingOptionId, 'rejected');
                    setShowRemoveConfirmModal(false);
                    setEditingOptionId(null);
                }}
                onRemove={() => {
                    if (!selectedItem || !editingOptionId) return;
                    handleRemoveOption(selectedItem.id, editingOptionId);
                    setShowRemoveConfirmModal(false);
                    setEditingOptionId(null);
                }}
            />
            {/* Remove Merchant Confirmation Modal */}
            <RemoveMerchantDialog
                open={showRemoveConfirmModal}
                onOpenChange={setShowRemoveConfirmModal}
                merchant={selectedOption?.merchants.find(m => m.id === editingOptionId)?.name || ''}
                onConfirm={() => {
                    if (!selectedOption || !editingOptionId) return;
                    handleRemoveMerchant(selectedOption.id, editingOptionId);
                    setShowRemoveConfirmModal(false);
                    setEditingOptionId(null);
                }}
            />
        </div>
    );
};

export default PurchasePlannerMockup;