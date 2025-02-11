import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { MerchantOption, MerchantModalProps } from '../types';

const MerchantModal: React.FC<MerchantModalProps> = ({
    productId,
    onClose,
    onSubmit
}) => {
    const [merchantData, setMerchantData] = useState<Partial<MerchantOption>>({
        name: '',
        price: 0,
        netPrice: 0,
        rewards: [],
        notes: '',
    });

    const handleSubmit = () => {
        // Add validation here if needed
        onSubmit({
            ...merchantData,
            id: crypto.randomUUID?.() || Math.random().toString(36).slice(2), // Fallback for environments without crypto
        });
        onClose(); // Close modal after submission
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Seller</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Merchant Name</Label>
                        <Input
                            id="name"
                            value={merchantData.name}
                            onChange={(e) => setMerchantData((prev: Partial<MerchantOption>) => ({
                                ...prev,
                                name: e.target.value
                            }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">List Price</Label>
                            <Input
                                id="price"
                                type="number"
                                value={merchantData.price}
                                onChange={(e) => setMerchantData((prev: Partial<MerchantOption>) => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="netPrice">Net Price</Label>
                            <Input
                                id="netPrice"
                                type="number"
                                value={merchantData.netPrice}
                                onChange={(e) => setMerchantData((prev: Partial<MerchantOption>) => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={merchantData.notes}
                            onChange={(e) => setMerchantData(prev => ({
                                ...prev,
                                notes: e.target.value
                            }))}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        Add Seller
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MerchantModal; 