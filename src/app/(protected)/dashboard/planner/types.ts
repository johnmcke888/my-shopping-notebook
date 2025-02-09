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