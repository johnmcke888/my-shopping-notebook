'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
    X, Package, Building2, RefreshCw, Ban, LayoutGrid,
    List, MoreHorizontal, Edit, Archive, Download,
    Trash, Layers
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LucideIcon } from 'lucide-react';
import MerchantModal from './MerchantModal';

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
    brand: string;
    modelNumber: string;
    image: string;
    price: {
        msrp: number;
        current: number;
    };
    specs: string[];
    notes: string;
    reviews: {
        source: string;
        url: string;
        title?: string;
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
const PlanActions = ({
    onEdit,
    onArchive,
    onExport,
    onDelete
}: {
    onEdit: () => void;
    onArchive: () => void;
    onExport: () => void;
    onDelete: () => void;
}) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Plan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Details
            </DropdownMenuItem>
            <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
            >
                <Trash className="h-4 w-4 mr-2" />
                Delete Plan
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);
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
    onStatusChange?: (productId: string, status: ProductOption['status']) => void;
}

// Move getBestMerchant outside of ProductCard
const getBestMerchant = (merchants: MerchantOption[]): MerchantOption | undefined => {
    if (!merchants.length) return undefined;
    return merchants.reduce((best, current) => {
        if (!best) return current;
        return current.netPrice < best.netPrice ? current : best;
    }, merchants[0]);
};

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    isSelected,
    onSelect,
    selectedItem,
    setEditingOptionId,
    setShowMerchantModal: setShowMerchantModalGlobal,
    setShowRemoveConfirmModal,
    handleUpdateItemStatus,
    onStatusChange
}) => {


    const [showMerchantModal, setShowMerchantModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    // Now we can safely use getBestMerchant in useMemo
    const savings = useMemo(() => {
        const bestPrice = getBestMerchant(product.merchants)?.netPrice ?? product.price.current;
        return ((product.price.msrp - bestPrice) / product.price.msrp * 100).toFixed(0);
    }, [product.price.msrp, product.price.current, product.merchants]);

    const handleStatusChange = (newStatus: ProductOption['status']) => {
        // Update parent state
        onStatusChange?.(product.id, newStatus);

        // Update global state
        handleUpdateItemStatus(selectedItem.id, product.id, newStatus);
    };

    const handleEditProduct = (productId: string) => {
    };

    const handleRemoveProduct = (productId: string) => {
        setEditingOptionId(productId);
        setShowRemoveConfirmModal(true);
    };

    return (
        <Card className="relative bg-white">
            {product.status === 'shortlisted' && (
                <Badge
                    className="absolute -top-2.5 -right-2.5 z-10 bg-blue-100 text-blue-800 flex items-center gap-1 pointer-events-none px-2 py-1 shadow-sm"
                >
                    <Star className="h-4 w-4" />
                    Shortlisted
                </Badge>
            )}
            <CardContent className="p-6">
                <div className="flex gap-8">
                    {/* Left: Image */}
                    <div className="w-80 flex-shrink-0 relative">
                        <div className="aspect-[4/3] relative">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-contain cursor-zoom-in"
                                onClick={() => setShowImageModal(true)}
                            />
                        </div>
                    </div>

                    {/* Right: Content Area */}
                    <div className="flex-1 min-w-0 space-y-4">
                        {/* Title and Actions */}
                        <div className="flex items-start justify-between">
                            <h3 className="text-xl font-medium">{product.name}</h3>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMerchantModal(true);
                                    }}
                                >
                                    <Store className="h-4 w-4" />
                                    Add Seller
                                </Button>
                                <Button
                                    size="sm"
                                    variant={product.status === 'shortlisted' ? 'default' : 'outline'}
                                    className="flex items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStatusChange('shortlisted');
                                    }}
                                >
                                    <Star className="h-4 w-4" />
                                    Shortlist
                                </Button>
                                <Button
                                    size="sm"
                                    variant={product.status === 'rejected' ? 'destructive' : 'outline'}
                                    className="flex items-center gap-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newStatus = product.status === 'rejected' ? 'considering' : 'rejected';
                                        handleUpdateItemStatus(selectedItem.id, product.id, newStatus);
                                    }}
                                >
                                    <Ban className="h-4 w-4" />
                                    {product.status === 'rejected' ? 'Unreject' : 'Reject'}
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEditProduct(product.id)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleRemoveProduct(product.id)}
                                            className="text-red-600"
                                        >
                                            <Trash className="h-4 w-4 mr-2" />
                                            Remove Product
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Price Flow */}
                        <div className="flex items-center flex-wrap gap-2">
                            <span className="text-gray-500 line-through">
                                {formatCurrency(product.price.msrp)}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                                {formatCurrency(product.price.current)}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-green-600">
                                {formatCurrency(getBestMerchant(product.merchants)?.netPrice ?? product.price.current)}
                            </span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {savings}% Off
                            </Badge>
                        </div>

                        {/* Auto-adjusting Content Grid */}
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                            {/* Specifications */}
                            <div className="space-y-2">
                                {product.specs.map((spec, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <Circle className="h-1.5 w-1.5 mt-2 text-gray-400" />
                                        <span className="text-gray-600">{spec}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Notes & Reviews */}
                            <div className="space-y-3">
                                {product.notes && (
                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                                        <span className="text-gray-600">{product.notes}</span>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {product.reviews.map((review, i) => (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            asChild
                                        >
                                            <a
                                                href={review.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Link className="h-4 w-4" />
                                                {review.source}
                                            </a>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* Merchant Modal */}
            {showMerchantModal && (
                <MerchantModal
                    productId={product.id}
                    onClose={() => setShowMerchantModal(false)}
                    onSubmit={(merchantData) => {
                        setShowMerchantModal(false);
                    }}
                />
            )}

            {/* Rejection Overlay */}
            {product.status === 'rejected' && (
                <div className="absolute inset-0 bg-gray-500/10 pointer-events-none">
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

const ProductListItem: React.FC<ProductCardProps> = ({
    product,
    isSelected,
    onSelect,
    selectedItem,
    setEditingOptionId,
    setShowMerchantModal,
    setShowRemoveConfirmModal,
    handleUpdateItemStatus
}) => {
    const bestMerchant = product.merchants.reduce((best, current) => {
        if (!best) return current;
        return current.netPrice < best.netPrice ? current : best;
    }, product.merchants[0]);

    return (
        <div className={`px-4 py-2 border rounded-lg mb-1 flex items-center gap-4 cursor-pointer
            ${isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}
            ${product.status === 'rejected' ? 'opacity-60' : ''}`}
            onClick={() => onSelect(product.id)}
        >
            {/* Image */}
            <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 object-contain bg-gray-50 rounded"
            />

            {/* Name and Status */}
            <div className="flex-1 min-w-0 flex items-center gap-2">
                <h3 className="font-medium truncate">{product.name}</h3>
                {product.status === 'shortlisted' && (
                    <Badge className="bg-yellow-100 text-yellow-800 flex-shrink-0">
                        <Star className="h-3 w-3 mr-1 inline" />
                        Shortlisted
                    </Badge>
                )}
            </div>

            {/* Price Breakdown */}
            <div className="flex items-center gap-2 flex-shrink-0 mr-6">
                <span className="text-sm text-gray-500 line-through">
                    {formatCurrency(product.price.msrp)}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                    {formatCurrency(bestMerchant?.price ?? product.price.msrp)}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-green-600">
                    {formatCurrency(bestMerchant?.netPrice ?? product.price.msrp)}
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-shrink-0">
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditingOptionId(product.id);
                        setShowMerchantModal(true);
                    }}
                >
                    <Store className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant={product.status === 'shortlisted' ? 'default' : 'outline'}
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.stopPropagation();
                        const newStatus = product.status === 'shortlisted' ? 'considering' : 'shortlisted';
                        handleUpdateItemStatus(selectedItem.id, product.id, newStatus);
                    }}
                >
                    <Star className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant={product.status === 'rejected' ? 'destructive' : 'outline'}
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.stopPropagation();
                        const newStatus = product.status === 'rejected' ? 'considering' : 'rejected';
                        handleUpdateItemStatus(selectedItem.id, product.id, newStatus);
                    }}
                >
                    <Ban className="h-4 w-4" />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:border-red-600"
                    onClick={(e) => {
                        e.stopPropagation();
                        setEditingOptionId(product.id);
                        setShowRemoveConfirmModal(true);
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

const PurchasePlannerMockup: React.FC = () => {
    // Initialize with sample data
    const [items, setItems] = useState<PurchaseItem[]>([
        {
            id: '1',
            name: 'Standing Desk',
            priority: 'high',
            targetPrice: { min: 500, max: 700 },
            status: 'active',
            options: [
                {
                    id: '1-1',
                    name: 'Fully Jarvis',
                    brand: 'Fully',
                    modelNumber: 'Jarvis',
                    image: '/api/placeholder/400/200',
                    price: { msrp: 799, current: 649 },
                    specs: [
                        'Height Range: 24.5" to 50"',
                        'Weight Capacity: 350lbs',
                        '7-year warranty'
                    ],
                    notes: "The Wirecutter's top pick. Stable at all heights according to BTD.",
                    reviews: [
                        { source: 'BTD', url: '#', title: 'In-depth Review' }
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
        brand: '',
        modelNumber: '',
        imageUrl: '',
        price: {
            msrp: 0,
            current: 0
        },
        specs: [] as string[],
        notes: '',
        reviews: [{ source: '', url: '', title: '' }]
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
    const [viewType, setViewType] = useState<'card' | 'list'>('card');

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
            brand: newProduct.brand,
            modelNumber: newProduct.modelNumber,
            image: newProduct.imageUrl || '/api/placeholder/400/200',
            price: {
                msrp: Number(newProduct.price.msrp) || 0,
                current: Number(newProduct.price.current) || 0
            },
            specs: newProduct.specs,
            notes: newProduct.notes,
            reviews: newProduct.reviews.filter(r => r.source && r.url),
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
            brand: '',
            modelNumber: '',
            imageUrl: '',
            price: { msrp: 0, current: 0 },
            specs: [],
            notes: '',
            reviews: [{ source: '', url: '', title: '' }]
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

    const handleProductStatusChange = (productId: string, newStatus: ProductOption['status']) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === selectedItem?.id) {
                return {
                    ...item,
                    options: item.options.map(option =>
                        option.id === productId
                            ? { ...option, status: newStatus }
                            : option
                    )
                };
            }
            return item;
        }));
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
                                    {/* Top line with main info */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                {selectedItem.priority === 'high' && <ArrowUpCircle className="h-4 w-4 text-red-500" />}
                                                {selectedItem.priority === 'normal' && <Circle className="h-4 w-4 text-amber-500" />}
                                                {selectedItem.priority === 'low' && <MinusCircle className="h-4 w-4 text-blue-500" />}
                                                <span>{selectedItem.priority.charAt(0).toUpperCase() + selectedItem.priority.slice(1)} Priority</span>
                                                <span>•</span>
                                                <span>Budget: {formatCurrency(selectedItem.targetPrice.max)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom line with all controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Filter tabs */}
                                            <Tabs
                                                value={activeTab}
                                                onValueChange={(value) => setActiveTab(value as 'all' | 'shortlist' | 'rejected')}
                                            >
                                                <TabsList>
                                                    <TabsTrigger value="all" className="flex items-center gap-2">
                                                        <Layers className="h-4 w-4" />
                                                        <span>All Options</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="shortlist" className="flex items-center gap-2">
                                                        <Star className="h-4 w-4" />
                                                        <span>Shortlist</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="rejected" className="flex items-center gap-2">
                                                        <Ban className="h-4 w-4" />
                                                        <span>Rejected</span>
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>

                                            {/* View type tabs */}
                                            <Tabs
                                                value={viewType}
                                                onValueChange={(value) => setViewType(value as 'card' | 'list')}
                                            >
                                                <TabsList>
                                                    <TabsTrigger value="card" className="flex items-center gap-2">
                                                        <LayoutGrid className="h-4 w-4" />
                                                        <span>Card View</span>
                                                    </TabsTrigger>
                                                    <TabsTrigger value="list" className="flex items-center gap-2">
                                                        <List className="h-4 w-4" />
                                                        <span>List View</span>
                                                    </TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </div>

                                        <div className="flex items-center gap-2">
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
                                                <PlanActions
                                                    onEdit={() => {
                                                        setEditingItemId(selectedItem.id);
                                                        setNewNeed({
                                                            name: selectedItem.name,
                                                            priority: selectedItem.priority,
                                                            targetPrice: selectedItem.targetPrice,
                                                            notes: selectedItem.notes || ''
                                                        });
                                                        setShowNeedModal(true);
                                                    }}
                                                    onArchive={() => {
                                                        setItemToAction(selectedItem.id);
                                                        setShowArchiveConfirm(true);
                                                    }}
                                                    onExport={() => {
                                                    }}
                                                    onDelete={() => {
                                                        setItemToAction(selectedItem.id);
                                                        setShowDeleteConfirm(true);
                                                    }}
                                                />
                                            )}
                                            <Button
                                                size="sm"
                                                onClick={() => setShowProductModal(true)}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                Add Option
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Notes (if any) */}
                                    {selectedItem.notes && (
                                        <div className="mt-4 text-sm text-gray-600 flex items-start gap-2">
                                            <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                                            <span>{selectedItem.notes}</span>
                                        </div>
                                    )}
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
                                                viewType === 'card' ? (
                                                    <ProductCard
                                                        key={option.id}
                                                        product={option}
                                                        isSelected={option.id === selectedItem.selectedOption}
                                                        onSelect={(id) => {
                                                            setItems(prevItems => prevItems.map(item =>
                                                                item.id === selectedItem.id
                                                                    ? { ...item, selectedOption: id }
                                                                    : item
                                                            ));
                                                        }}
                                                        selectedItem={selectedItem}
                                                        setEditingOptionId={setEditingOptionId}
                                                        setShowMerchantModal={setShowMerchantModal}
                                                        setShowRemoveConfirmModal={setShowRemoveConfirmModal}
                                                        handleUpdateItemStatus={handleUpdateItemStatus}
                                                        onStatusChange={handleProductStatusChange}
                                                    />
                                                ) : (
                                                    <ProductListItem
                                                        key={option.id}
                                                        product={option}
                                                        isSelected={option.id === selectedItem.selectedOption}
                                                        onSelect={(id) => {
                                                            setItems(prevItems => prevItems.map(item =>
                                                                item.id === selectedItem.id
                                                                    ? { ...item, selectedOption: id }
                                                                    : item
                                                            ));
                                                        }}
                                                        selectedItem={selectedItem}
                                                        setEditingOptionId={setEditingOptionId}
                                                        setShowMerchantModal={setShowMerchantModal}
                                                        setShowRemoveConfirmModal={setShowRemoveConfirmModal}
                                                        handleUpdateItemStatus={handleUpdateItemStatus}
                                                    />
                                                )
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
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Add Product Option</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Product Name */}
                        <div>
                            <Label>Product Name</Label>
                            <Input
                                value={newProduct.name}
                                onChange={(e) => setNewProduct(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                placeholder="e.g., Ankarsrum Original Kitchen Machine"
                            />
                        </div>

                        {/* Brand and Model Number (side by side) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Brand</Label>
                                <Input
                                    value={newProduct.brand}
                                    onChange={(e) => setNewProduct(prev => ({
                                        ...prev,
                                        brand: e.target.value
                                    }))}
                                    placeholder="e.g., Ankarsrum"
                                />
                            </div>
                            <div>
                                <Label>Model Number</Label>
                                <Input
                                    value={newProduct.modelNumber}
                                    onChange={(e) => setNewProduct(prev => ({
                                        ...prev,
                                        modelNumber: e.target.value
                                    }))}
                                    placeholder="e.g., AKM 6230"
                                />
                            </div>
                        </div>

                        {/* Image URL */}
                        <div>
                            <Label>Image URL</Label>
                            <Input
                                value={newProduct.imageUrl}
                                onChange={(e) => setNewProduct(prev => ({
                                    ...prev,
                                    imageUrl: e.target.value
                                }))}
                                placeholder="https://..."
                            />
                        </div>

                        {/* Pricing */}
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

                        {/* Specifications (now a textarea) */}
                        <Textarea
                            value={newProduct.specs.join('\n')}
                            onChange={(e) => setNewProduct(prev => ({
                                ...prev,
                                specs: e.target.value.split('\n').filter(line => line.trim())
                            }))}
                            placeholder="Enter product specifications (one per line)"
                            className="min-h-[80px] max-h-[300px]"
                        />


                        {/* Reviews */}
                        <div>
                            <Label> Reviews</Label>
                            {newProduct.reviews.map((review, index) => (
                                <div key={index} className="flex gap-2 mt-2">
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
                                                    reviews: [...prev.reviews, { source: '', url: '', title: '' }]
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
                            ))}
                        </div>

                        {/* Notes */}
                        <Textarea
                            value={newProduct.notes}
                            onChange={(e) => setNewProduct(prev => ({
                                ...prev,
                                notes: e.target.value
                            }))}
                            placeholder="Add any additional notes about this product"
                            className="min-h-[80px] max-h-[300px]"
                        />

                        {/* Action Buttons */}
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