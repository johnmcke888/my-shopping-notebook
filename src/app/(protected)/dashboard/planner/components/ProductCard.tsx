'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Store, Star, Ban, MoreHorizontal, MessageSquare,
    Circle, ChevronRight, Link, Edit, Trash, ExternalLink
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from '@/utils/formatters';
import MerchantModal from './MerchantModal';
import { ProductCardProps, MerchantOption, ProductOption } from '../types';

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
    showMerchantModal,
    setShowMerchantModal,
    setShowRemoveConfirmModal,
    handleUpdateItemStatus,
    onStatusChange,
    setShowProductModal
}) => {
    // Local state
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
        // Let's add some console logs to track what's happening
        console.log('Edit clicked for product:', productId);

        try {
            setEditingOptionId(productId);
            setShowProductModal(true);

            // Add a cleanup function
            return () => {
                setEditingOptionId(null);
                setShowProductModal(false);
            };
        } catch (error) {
            console.error('Error in handleEditProduct:', error);
            // Reset states if there's an error
            setEditingOptionId(null);
            setShowProductModal(false);
        }
    };

    const handleRemoveProduct = (productId: string) => {
        setEditingOptionId(productId);
        setShowRemoveConfirmModal(true);
    };

    return (
        <Card className={`relative overflow-hidden ${product.status === 'rejected' ? 'bg-gray-50' : 'bg-white'
            }`}>
            {product.status === 'shortlisted' && (
                <div className="absolute top-0 left-0 w-20 h-20">
                    <div className="absolute transform -rotate-45 bg-blue-600 text-white text-xs font-semibold py-1 left-[-35px] top-[32px] w-[170px] text-center">
                        Shortlisted
                    </div>
                </div>
            )}

            <CardContent className="p-6">
                <div className="flex gap-6">
                    {/* Left Column - Image */}
                    <div className="w-[300px] flex-shrink-0">
                        <div className="relative aspect-video">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover rounded-lg border cursor-zoom-in"
                                onClick={() => setShowImageModal(true)}
                            />
                            {product.brand && (
                                <Badge className="absolute bottom-2 left-2 bg-white/90">
                                    {product.brand}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Content */}
                    <div className="flex-1 min-w-0 space-y-4">
                        {/* Header Section */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-semibold">{product.name}</h3>
                                {product.modelNumber && (
                                    <p className="text-sm text-gray-500">Model: {product.modelNumber}</p>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMerchantModal(true)}
                                >
                                    <Store className="h-4 w-4 mr-2" />
                                    Add Seller
                                </Button>
                                <Button
                                    variant={product.status === 'shortlisted' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusChange(product.status === 'shortlisted' ? 'considering' : 'shortlisted')}
                                >
                                    <Star className="h-4 w-4 mr-2" />
                                    {product.status === 'shortlisted' ? 'Shortlisted' : 'Shortlist'}
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
                                            onClick={() => handleStatusChange(
                                                product.status === 'rejected' ? 'considering' : 'rejected'
                                            )}
                                        >
                                            <Ban className="h-4 w-4 mr-2" />
                                            {product.status === 'rejected' ? 'Unreject' : 'Reject'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleEditProduct(product.id);
                                            }}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Details
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="flex items-center gap-4 bg-white border p-3 rounded-lg">                            <div className="flex items-center gap-2">
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
                        </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                {savings}% Off
                            </Badge>
                        </div>

                        <Separator />

                        {/* Specs & Notes Grid */}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Specifications */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm text-gray-600">Specifications</h4>
                                <div className="space-y-1">
                                    {product.specs.map((spec, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                            <Circle className="h-1.5 w-1.5 mt-1.5 text-gray-400" />
                                            <span className="text-gray-600">{spec}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Notes & Reviews */}
                            <div className="space-y-3">
                                {product.notes && (
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-600 mb-2">Notes</h4>
                                        <div className="flex items-start gap-2 text-sm">
                                            <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                                            <span className="text-gray-600">{product.notes}</span>
                                        </div>
                                    </div>
                                )}

                                {product.reviews.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-sm text-gray-600 mb-2">Reviews</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {product.reviews.map((review, i) => (
                                                <Button
                                                    key={i}
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="h-7"
                                                >
                                                    <a
                                                        href={review.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="h-3 w-3" />
                                                        {review.source}
                                                        {review.title && ` - ${review.title}`}
                                                    </a>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>

            {product.status === 'rejected' && (
                <div className="absolute inset-0 bg-gray-500/10 pointer-events-none">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-0 w-[200%] h-[200%] origin-top-left -rotate-45 border-t-2 border-gray-300 transform -translate-y-1/2" />
                    </div>
                </div>
            )}

            {showMerchantModal && (
                <MerchantModal
                    productId={product.id}
                    onClose={() => setShowMerchantModal(false)}
                    onSubmit={(merchantData) => {
                        setShowMerchantModal(false);
                    }}
                />
            )}
        </Card>
    );
};

export default ProductCard;