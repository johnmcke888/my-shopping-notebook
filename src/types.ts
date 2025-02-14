export interface MerchantModalProps {
    productId: string;
    onClose: () => void;
    onSubmit: (data: MerchantData) => void;
    userProfile?: UserProfile;
}

export interface UserProfile {
    cards?: Card[];
    giftCards?: GiftCard[];
    storeRewards?: StoreReward[];
    defaultTaxRate?: number;
    state?: string;
}

export interface Card {
    id: string;
    name: string;
}

export interface GiftCard {
    id: string;
    merchant: string;
    balance: number;
}

export interface StoreReward {
    id: string;
    store: string;
    programName: string;
}

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

export type SavingsType = 'exclusive' | 'coupon' | 'portal' | 'cardRewards' | 'cardLinked' | 'rebate' | 'storeRewards' | 'giftCard';

interface BaseSaving {
    id: string;
    type: SavingsType;
    amount: number;
    amountType: 'fixed' | 'percentage';
}

export interface ExclusiveSaving extends BaseSaving {
    type: 'exclusive';
    description: string;
}

export interface CouponSaving extends BaseSaving {
    type: 'coupon';
    code: string;
    minimumSpend?: number;
}

export interface PortalSaving extends BaseSaving {
    type: 'portal';
    portalName: string;
}

export interface CardRewardSaving extends BaseSaving {
    type: 'cardRewards';
    cardId?: string;
    cardName: string;
    category: string;
    isManualEntry?: boolean;
}

export interface CardLinkedSaving extends BaseSaving {
    type: 'cardLinked';
    cardId?: string;
    cardName?: string;
}

export interface RebateSaving extends BaseSaving {
    type: 'rebate';
    submitByDate: string;
    rebateType: 'MAIL_IN' | 'ONLINE' | 'AUTO';
}

export interface StoreRewardSaving extends BaseSaving {
    type: 'storeRewards';
    programId?: string;
    programName: string;
    isManualEntry?: boolean;
    isRedeeming?: boolean;
    pointsEarned?: number;
    pointValue?: number;
    redemptionAmount?: number;
}

export interface GiftCardSaving extends BaseSaving {
    type: 'giftCard';
    cardId?: string;
    source?: string;
    faceValue: number;
    purchasePrice: number;
    isManualEntry?: boolean;
}

export type Saving = ExclusiveSaving | CouponSaving | PortalSaving | CardRewardSaving | CardLinkedSaving | RebateSaving | StoreRewardSaving | GiftCardSaving; 