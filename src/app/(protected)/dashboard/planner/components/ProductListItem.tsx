'use client';

import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Store, Star, Ban, X, ChevronRight
} from 'lucide-react';
import { ProductCardProps } from '../types';
import { formatCurrency } from '@/utils/formatters';

const ProductListItem: React.FC<ProductCardProps> = ({
    product,
    isSelected,
    onSelect,
    selectedItem,
    setEditingOptionId,
    showMerchantModal,
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

export default ProductListItem;