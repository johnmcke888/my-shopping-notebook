// src/types/index.ts

// src/app/(protected)/dashboard/planner/types.ts

export interface PurchasePlan {
    id: string;
    name: string;
    priority: 'HIGH' | 'NORMAL' | 'LOW';
    budget: number;
    targetDate?: Date;
    category?: string;
}

export interface ProductPrice {
    msrp: number;
    current: number;
}

export interface ProductOption {
    id: string;
    name: string;
    type: 'premium' | 'budget';
    image: string;
    specs: string[];
    brand: string;
    modelNumber: string;
    price: {
        msrp: number;
        current: number;
    };
    notes: string;
    selected?: boolean;
    // Add missing required properties
    reviews: {
        rating: number;
        count: number;
        source: string;
    };
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    merchant: {
        name: string;
        reliability: 'verified' | 'unverified';
        fulfillment: 'direct' | 'marketplace';
    };
}

export interface StackComponent {
    id: string;
    type: 'credit-card' | 'gift-card' | 'store-reward' | 'portal' | 'coupon';
    name: string;
    value: number;
    details?: string;
}

export interface Stack {
    id: string;
    name: string;
    merchant: string;
    listPrice: number;
    salePrice: number;
    components: StackComponent[];
}

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
    showMerchantModal: boolean;
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

// Existing interfaces remain unchanged
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

// New type definitions for enhanced merchant modal
export type SavingsType =
    | 'exclusive'
    | 'coupon'
    | 'portal'
    | 'cardRewards'
    | 'cardLinked'
    | 'rebate'
    | 'storeRewards'
    | 'giftCard';

export interface SavingsBase {
    id: string;
    type: SavingsType;
    amount: number;
    amountType: 'fixed' | 'percentage';
    expirationDate?: string;
}

export interface ExclusiveSaving extends SavingsBase {
    type: 'exclusive';
    description: string;
}

export interface CouponSaving extends SavingsBase {
    type: 'coupon';
    code: string;
    minimumSpend?: number;
}

export interface PortalSaving extends SavingsBase {
    type: 'portal';
    portalId?: string;
    portalName: string;
    cashbackRate: number;
}

export interface CardRewardSaving extends SavingsBase {
    type: 'cardRewards';
    cardId?: string;
    cardName: string;
    rewardRate: number;
    category: string;
    isManualEntry: boolean;
}

export interface CardLinkedSaving extends SavingsBase {
    type: 'cardLinked';
    cardId?: string;
    minimumSpend?: number;
}

export interface RebateSaving extends SavingsBase {
    type: 'rebate';
    submitByDate: string;
    rebateType: 'MAIL_IN' | 'ONLINE' | 'AUTO';
}

export interface StoreRewardSaving extends SavingsBase {
    type: 'storeRewards';
    programId?: string;
    programName: string;
    isManualEntry: boolean;
    pointsEarned?: number;
    pointValue?: number;
    isRedeeming: boolean;
    redemptionType: 'POINTS' | 'CASH';
    redemptionAmount: number;
}

export interface GiftCardSaving extends SavingsBase {
    type: 'giftCard';
    cardId?: string;
    faceValue: number;
    purchasePrice: number;
    source?: string;
    isManualEntry: boolean;
}

export type Saving =
    | ExclusiveSaving
    | CouponSaving
    | PortalSaving
    | CardRewardSaving
    | CardLinkedSaving
    | RebateSaving
    | StoreRewardSaving
    | GiftCardSaving;

export interface MerchantData {
    name: string;
    url?: string;
    listPrice: number;
    salePrice: number;
    shipping: {
        isFree: boolean;
        cost?: number;
    };
    tax: {
        applies: boolean;
        rate: number;
    };
    returns: {
        available: boolean;
        period?: number;
        unit: 'days' | 'months' | 'years';
    };
    savings: Saving[];
    notes?: string;
}