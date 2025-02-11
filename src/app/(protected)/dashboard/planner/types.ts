export interface MerchantOption {
    id?: string;
    name: string;
    price: number;
    netPrice: number;
    rewards: Array<{
        type: 'credit-card' | 'store';
        value: string;
        name: string;
    }>;
    notes: string;
    bestValue?: boolean;
    shipping?: string;
    tax?: number | 'none' | 'unknown';
    returnPolicy?: string;
}

export interface MerchantModalProps {
    productId: string;
    onClose: () => void;
    onSubmit: (merchantData: Partial<MerchantOption>) => void;
}

export interface ProductOption {
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

export interface PurchaseItem {
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
    status: 'active' | 'archived';
}

export interface SharedProductProps {
    product: ProductOption;
    isSelected: boolean;
    onSelect: (id: string) => void;
    selectedItem: PurchaseItem;
    setEditingOptionId: (id: string | null) => void;
    setShowMerchantModal: (show: boolean) => void;
    setShowRemoveConfirmModal: (show: boolean) => void;
    handleUpdateItemStatus: (itemId: string, optionId: string, status: ProductOption['status']) => void;
    onStatusChange?: (productId: string, status: ProductOption['status']) => void;
    setShowProductModal: (show: boolean) => void;
}

export interface ProductCardProps extends SharedProductProps {
    product: ProductOption;
    isSelected: boolean;
    onSelect: (id: string) => void;
    selectedItem: PurchaseItem;
    setEditingOptionId: (id: string | null) => void;
    setShowMerchantModal: (show: boolean) => void;
    setShowRemoveConfirmModal: (show: boolean) => void;
    handleUpdateItemStatus: (itemId: string, optionId: string, status: ProductOption['status']) => void;
    onStatusChange?: (productId: string, status: ProductOption['status']) => void;
    setShowProductModal: (show: boolean) => void;
}

export interface ProductListItemProps extends SharedProductProps {
    product: ProductOption;
    isSelected: boolean;
    onSelect: (id: string) => void;
    selectedItem: PurchaseItem;
    setEditingOptionId: (id: string | null) => void;
    setShowMerchantModal: (show: boolean) => void;
    setShowRemoveConfirmModal: (show: boolean) => void;
    handleUpdateItemStatus: (itemId: string, optionId: string, status: ProductOption['status']) => void;
}
