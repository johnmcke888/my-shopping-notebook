import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

// Type Definitions
type SavingsType =
    | 'exclusive'
    | 'coupon'
    | 'portal'
    | 'cardRewards'
    | 'cardLinked'
    | 'rebate'
    | 'storeRewards'
    | 'giftCard';

interface SavingsBase {
    id: string;
    type: SavingsType;
    amount: number;
    amountType: 'fixed' | 'percentage';
    expirationDate?: string;
}

interface ExclusiveSaving extends SavingsBase {
    type: 'exclusive';
    description: string;
}

interface CouponSaving extends SavingsBase {
    type: 'coupon';
    code: string;
    minimumSpend?: number;
}

interface PortalSaving extends SavingsBase {
    type: 'portal';
    portalId?: string;
    portalName: string;
    cashbackRate: number;
}

interface CardRewardSaving extends SavingsBase {
    type: 'cardRewards';
    cardId?: string;
    cardName: string;
    rewardRate: number;
    category: string;
    isManualEntry: boolean;
}

interface CardLinkedSaving extends SavingsBase {
    type: 'cardLinked';
    cardId?: string;
    minimumSpend?: number;
}

interface RebateSaving extends SavingsBase {
    type: 'rebate';
    submitByDate: string;
    rebateType: 'MAIL_IN' | 'ONLINE' | 'AUTO';
}

interface StoreRewardSaving extends SavingsBase {
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

interface GiftCardSaving extends SavingsBase {
    type: 'giftCard';
    cardId?: string;
    faceValue: number;
    purchasePrice: number;
    source?: string;
    isManualEntry: boolean;
}

type Saving =
    | ExclusiveSaving
    | CouponSaving
    | PortalSaving
    | CardRewardSaving
    | CardLinkedSaving
    | RebateSaving
    | StoreRewardSaving
    | GiftCardSaving;

interface MerchantModalProps {
    productId: string;
    onClose: () => void;
    onSubmit: (merchantData: MerchantData) => void;
    userProfile?: {
        defaultTaxRate: number;
        state: string;
        cards?: {
            id: string;
            name: string;
            rewards: Array<{
                category: string;
                rate: number;
            }>;
        }[];
        storeRewards?: {
            id: string;
            store: string;
            programName: string;
            pointValue: number;
        }[];
        giftCards?: {
            id: string;
            merchant: string;
            balance: number;
        }[];
    };
}

interface MerchantData {
    name: string;
    url?: string;
    listPrice: number;
    salePrice: number;
    shippingCost: number;
    taxRate: number;
    returnPolicy: string;
    savings: Saving[];
    notes?: string;
}

// Savings Type Configuration
const SAVINGS_TYPES = {
    exclusive: {
        label: 'Exclusive Savings',
        description: 'Member pricing, student discounts, etc.'
    },
    coupon: {
        label: 'Coupon Code',
        description: 'Store or manufacturer coupons'
    },
    portal: {
        label: 'Shopping Portal',
        description: 'Cashback sites like Rakuten, TopCashback'
    },
    cardRewards: {
        label: 'Card Rewards',
        description: 'Credit/debit card reward categories'
    },
    cardLinked: {
        label: 'Card-Linked Offer',
        description: 'AmEx offers, Chase offers, etc.'
    },
    rebate: {
        label: 'Rebate',
        description: 'Mail-in or online rebates'
    },
    storeRewards: {
        label: 'Store Rewards',
        description: 'Store loyalty program points/rewards'
    },
    giftCard: {
        label: 'Gift Card',
        description: 'Discounted gift cards'
    }
} as const;

// Add these utility classes at the top of the file
const inputStyles = {
    numeric: "w-16 text-right px-2 py-1",
    price: "font-medium tabular-nums text-right",
    shipping: "font-medium tabular-nums text-right before:content-['$']"
};

// Add these style utilities
const styles = {
    formSection: "mb-6 pb-4 border-b border-gray-200 last:border-b-0",
    sectionTitle: "text-lg font-medium mb-4",
    priceInputContainer: "relative",
    currencySymbol: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none",
    priceInput: "pl-7 w-full",
    termsGrid: "grid grid-cols-1 md:grid-cols-2 gap-4",
    termItem: "flex items-center gap-2",
    termCheckbox: "h-4 w-4",
    termLabel: "text-sm text-gray-700"
};

const MerchantModal: React.FC<MerchantModalProps> = ({
    productId,
    onClose,
    onSubmit,
    userProfile
}) => {
    // Core merchant data state
    const [merchantData, setMerchantData] = useState<MerchantData>({
        name: '',
        listPrice: 0,
        salePrice: 0,
        shippingCost: 0,
        taxRate: userProfile?.defaultTaxRate || 0,
        returnPolicy: '',
        savings: []
    });

    // Active saving being edited
    const [activeSaving, setActiveSaving] = useState<Partial<Saving> | null>(null);

    // Calculation helper functions
    const calculateInitialDiscount = () => {
        if (!merchantData.listPrice || !merchantData.salePrice) return 0;
        return ((merchantData.listPrice - merchantData.salePrice) / merchantData.listPrice) * 100;
    };

    const calculateShipping = () => merchantData.shippingCost;

    const calculateTax = () => {
        const basePrice = merchantData.salePrice || merchantData.listPrice;
        return (basePrice * (merchantData.taxRate / 100));
    };

    const calculateSavings = (price: number) => {
        return merchantData.savings.reduce((total, saving) => {
            if (saving.amountType === 'fixed') {
                return total + saving.amount;
            } else {
                return total + (price * (saving.amount / 100));
            }
        }, 0);
    };

    // Primary calculation
    const calculateFinalPrice = () => {
        const basePrice = merchantData.salePrice || merchantData.listPrice;
        const shipping = calculateShipping();
        const tax = calculateTax();
        const savings = calculateSavings(basePrice);

        return basePrice + shipping + tax - savings;
    };

    // Form submission handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (merchantData.name && merchantData.salePrice > 0) {
            onSubmit(merchantData);
            onClose();
        }
    };

    // We'll continue with the JSX in the next section...

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="w-[1000px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Seller</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Merchant Details Section */}
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>Merchant Details</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Merchant Name</Label>
                                    <Input
                                        value={merchantData.name}
                                        onChange={(e) => setMerchantData(prev => ({
                                            ...prev,
                                            name: e.target.value
                                        }))}
                                        placeholder="e.g., Amazon, Best Buy"
                                        className="truncate"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Product URL (Optional)</Label>
                                    <Input
                                        value={merchantData.url || ''}
                                        onChange={(e) => setMerchantData(prev => ({
                                            ...prev,
                                            url: e.target.value
                                        }))}
                                        placeholder="https://"
                                        className="truncate"
                                    />
                                </div>
                            </div>

                            {/* Second row - Purchase terms with optimized proportions */}
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-3">
                                    <Label>Shipping Cost</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="pl-7 w-full"
                                            value={merchantData.shippingCost}
                                            onChange={(e) => setMerchantData(prev => ({
                                                ...prev,
                                                shippingCost: parseFloat(e.target.value) || 0
                                            }))}
                                        />
                                    </div>
                                </div>
                                <div className="col-span-3">
                                    <Label>Sales Tax Rate</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="pr-7 w-full"
                                            value={merchantData.taxRate}
                                            onChange={(e) => setMerchantData(prev => ({
                                                ...prev,
                                                taxRate: parseFloat(e.target.value) || 0
                                            }))}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                    </div>
                                </div>
                                <div className="col-span-6">
                                    <Label>Return Policy</Label>
                                    <Input
                                        value={merchantData.returnPolicy}
                                        onChange={(e) => setMerchantData(prev => ({
                                            ...prev,
                                            returnPolicy: e.target.value
                                        }))}
                                        className="w-full"
                                        placeholder="e.g., 30 days, no returns, store credit only"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Section */}
                    <div className={styles.formSection}>
                        <h3 className={styles.sectionTitle}>Pricing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>List Price</Label>
                                <div className={styles.priceInputContainer}>
                                    <span className={styles.currencySymbol}>$</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className={styles.priceInput}
                                        value={merchantData.listPrice || ''}
                                        onChange={(e) => setMerchantData(prev => ({
                                            ...prev,
                                            listPrice: parseFloat(e.target.value) || 0
                                        }))}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Sale Price</Label>
                                <div className={styles.priceInputContainer}>
                                    <span className={styles.currencySymbol}>$</span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className={styles.priceInput}
                                        value={merchantData.salePrice || ''}
                                        onChange={(e) => setMerchantData(prev => ({
                                            ...prev,
                                            salePrice: parseFloat(e.target.value) || 0
                                        }))}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Initial discount display */}
                        {merchantData.listPrice > 0 && merchantData.salePrice > 0 && (
                            <div className="mt-4 text-sm bg-blue-50 text-blue-700 p-3 rounded-md">
                                Initial discount: {calculateInitialDiscount().toFixed(1)}% off list price
                            </div>
                        )}
                    </div>

                    {/* Add/Edit Savings and Price Breakdown Section */}
                    <div className="grid grid-cols-2 gap-6 border-t pt-4">
                        {/* Add/Edit Savings Panel */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium">Add/Edit Savings</h3>
                                <Select
                                    value={activeSaving?.type || ''}
                                    onValueChange={(value: SavingsType) => {
                                        setActiveSaving({
                                            type: value,
                                            amount: 0,
                                            amountType: 'percentage'
                                        });
                                    }}
                                >
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(SAVINGS_TYPES).map(([value, config]) => (
                                            <SelectItem key={value} value={value}>
                                                {config.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Dynamic Savings Form */}
                            {activeSaving && (
                                <div className="space-y-4 bg-gray-50 p-4 rounded-md">
                                    {/* Common Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Amount</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={activeSaving.amount || ''}
                                                onChange={(e) => setActiveSaving(prev => ({
                                                    ...prev!,
                                                    amount: parseFloat(e.target.value) || 0
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <Label>Type</Label>
                                            <Select
                                                value={activeSaving.amountType || 'percentage'}
                                                onValueChange={(value: 'fixed' | 'percentage') => {
                                                    setActiveSaving(prev => ({
                                                        ...prev!,
                                                        amountType: value
                                                    }));
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="fixed">Fixed ($)</SelectItem>
                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Type-Specific Fields */}
                                    {activeSaving.type === 'exclusive' && (
                                        <div>
                                            <Label>Description</Label>
                                            <Input
                                                placeholder="e.g., Member Price, Student Discount"
                                                value={(activeSaving as Partial<ExclusiveSaving>).description || ''}
                                                onChange={(e) => setActiveSaving(prev => ({
                                                    ...prev!,
                                                    description: e.target.value
                                                }))}
                                            />
                                        </div>
                                    )}

                                    {activeSaving.type === 'coupon' && (
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Coupon Code</Label>
                                                <Input
                                                    placeholder="Enter code"
                                                    value={(activeSaving as Partial<CouponSaving>).code || ''}
                                                    onChange={(e) => setActiveSaving(prev => ({
                                                        ...prev!,
                                                        code: e.target.value
                                                    }))}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={activeSaving.amountType === 'percentage' ? 'default' : 'outline'}
                                                        onClick={() => setActiveSaving(prev => ({
                                                            ...prev!,
                                                            amountType: 'percentage'
                                                        }))}
                                                    >
                                                        %
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant={activeSaving.amountType === 'fixed' ? 'default' : 'outline'}
                                                        onClick={() => setActiveSaving(prev => ({
                                                            ...prev!,
                                                            amountType: 'fixed'
                                                        }))}
                                                    >
                                                        $
                                                    </Button>
                                                </div>
                                                <div className="relative">
                                                    {activeSaving.amountType === 'fixed' && (
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                    )}
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        className={activeSaving.amountType === 'fixed' ? 'pl-7' : ''}
                                                        value={activeSaving.amount || ''}
                                                        onChange={(e) => setActiveSaving(prev => ({
                                                            ...prev!,
                                                            amount: parseFloat(e.target.value) || 0
                                                        }))}
                                                    />
                                                    {activeSaving.amountType === 'percentage' && (
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Minimum Spend (Optional)</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                    <Input
                                                        type="number"
                                                        className="pl-7"
                                                        placeholder="0.00"
                                                        value={(activeSaving as Partial<CouponSaving>).minimumSpend || ''}
                                                        onChange={(e) => setActiveSaving(prev => ({
                                                            ...prev!,
                                                            minimumSpend: parseFloat(e.target.value) || undefined
                                                        }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Continue with other saving types... Let me know if you want me to keep going */}

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setActiveSaving(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => {
                                                // Add validation logic here
                                                const newSaving = {
                                                    ...activeSaving,
                                                    id: crypto.randomUUID()
                                                } as Saving;

                                                setMerchantData(prev => ({
                                                    ...prev,
                                                    savings: [...prev.savings, newSaving]
                                                }));
                                                setActiveSaving(null);
                                            }}
                                        >
                                            Save Discount
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Existing Savings List */}
                            <div className="space-y-2">
                                {merchantData.savings.map((saving) => (
                                    <div
                                        key={saving.id}
                                        className="flex items-center justify-between p-2 bg-white border rounded-md"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {SAVINGS_TYPES[saving.type].label}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {saving.amountType === 'fixed'
                                                    ? `${saving.amount}`
                                                    : `${saving.amount}%`}
                                                {saving.type === 'coupon' &&
                                                    ` - Code: ${(saving as CouponSaving).code}`}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setActiveSaving(saving)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setMerchantData(prev => ({
                                                        ...prev,
                                                        savings: prev.savings.filter(s => s.id !== saving.id)
                                                    }));
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Breakdown Panel */}
                        <div className="space-y-4">
                            <h3 className="font-medium">Price Breakdown</h3>
                            <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                                <div className="flex justify-between text-sm">
                                    <span>List Price:</span>
                                    <span className={inputStyles.price}>${merchantData.listPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Sale Price:</span>
                                    <span className={inputStyles.price}>${merchantData.salePrice.toFixed(2)}</span>
                                </div>

                                {/* Shipping */}
                                <div className="flex justify-between text-sm">
                                    <span>Shipping:</span>
                                    <span className={inputStyles.shipping}>
                                        {merchantData.shippingCost === 0 ? 'Free' : merchantData.shippingCost.toFixed(2)}
                                    </span>
                                </div>

                                {/* Tax */}
                                {merchantData.taxRate > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span>Tax ({merchantData.taxRate}%):</span>
                                        <span className={inputStyles.price}>${calculateTax().toFixed(2)}</span>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="border-t my-2" />

                                {/* Applied Savings */}
                                {merchantData.savings.length > 0 && (
                                    <>
                                        <div className="text-sm font-medium">Applied Savings:</div>
                                        {merchantData.savings.map((saving) => (
                                            <div key={saving.id} className="flex justify-between text-sm pl-4">
                                                <span>{SAVINGS_TYPES[saving.type].label}:</span>
                                                <span className="text-green-600">
                                                    -{saving.amountType === 'fixed'
                                                        ? `${saving.amount.toFixed(2)}`
                                                        : `${saving.amount}%`}
                                                </span>
                                            </div>
                                        ))}
                                        <div className="border-t my-2" />
                                    </>
                                )}

                                {/* Final Price */}
                                <div className="flex justify-between font-medium">
                                    <span>Final Price:</span>
                                    <span className="text-green-600">
                                        ${calculateFinalPrice().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="border-t pt-4">
                        <Label>Additional Notes</Label>
                        <Textarea
                            value={merchantData.notes || ''}
                            onChange={(e) => setMerchantData(prev => ({
                                ...prev,
                                notes: e.target.value
                            }))}
                            placeholder="Any additional details about this seller or offer"
                            className="h-20"
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Add Seller
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default MerchantModal;