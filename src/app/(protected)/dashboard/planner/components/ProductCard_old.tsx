'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Store, Star, Ban, MoreHorizontal, MessageSquare,
    Circle, ChevronRight, Link, Edit, Trash
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ProductCardProps,
    MerchantOption,
    ProductOption
} from '../types';
import MerchantModal from './MerchantModal';
import { formatCurrency } from '@/utils/formatters';

// Helper function to find best merchant deal
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

    const savings = useMemo(() => {
        const bestPrice = getBestMerchant(product.merchants)?.netPrice ?? product.price.current;
        return ((product.price.msrp - bestPrice) / product.price.msrp * 100).toFixed(0);
    }, [product.price.msrp, product.price.current, product.merchants]);

    const handleStatusChange = (newStatus: ProductOption['status']) => {
        onStatusChange?.(product.id, newStatus);
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

export default ProductCard;
