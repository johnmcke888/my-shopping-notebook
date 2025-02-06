'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// First, let's define our simple types
type OfferType = 'sale' | 'promo' | 'discount';

type Offer = {
    id: number;
    type: OfferType;
    merchant: string;
    description: string;
    startDate: string;
    endDate?: string;
    notes?: string;
    // Fields for different offer types
    promoCode?: string;
    discountAmount?: string;
    minimumSpend?: string;
    maximumDiscount?: string;
};

type BillingFrequency = 'monthly' | 'every30' | 'yearly' | 'custom';

type Subscription = {
    id: number;
    merchant: string;           // Required: Store/service name
    subscriptionName?: string;  // Optional: Specific plan name
    price: number;             // Required: Base price
    includeTax: boolean;       // Whether to add sales tax
    billingFrequency: BillingFrequency;  // Required: How often billed
    customInterval?: number;    // Days between bills (for custom frequency)
    nextBillDate: string;      // Required: Next charge date
    // Trial period fields
    hasTrial: boolean;
    trialLength?: number;
    trialEndDate?: string;
    // Duration fields
    hasEndDate: boolean;
    endDate?: string;
    notes?: string;
};

const getDaysInMonth = (date: Date): number => {
    // Create a new date object for the first day of the NEXT month
    // Then subtract 1 day to get the last day of our target month
    // getDate() will then tell us what day that is (28-31)
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date): number => {
    // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

// Format a date as "Month Year" (e.g., "January 2024")
const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
};


// Main component
const OffersCalendarPage = () => {
    // Helper functions to make our date math easier
    // This tracks what month/year we're currently viewing
    const [currentDate, setCurrentDate] = useState(new Date());

    // State for our offers and modal
    const [offers, setOffers] = useState<Offer[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newOffer, setNewOffer] = useState<Partial<Offer>>({
        type: 'sale',
        startDate: new Date().toISOString().split('T')[0],
    });
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    // Function to handle adding a new offer
    const [newSubscription, setNewSubscription] = useState<Partial<Subscription>>({
        includeTax: false,
        billingFrequency: 'monthly',
        hasTrial: false,
        hasEndDate: false,
        nextBillDate: new Date().toISOString().split('T')[0],
    });
    // Add this after your useState declarations
    useEffect(() => {
        console.log('Current offers:', offers);
    }, [offers]);
    // Replace the current handleAddOffer function with this one:
    const handleAddOffer = async () => {
        if (newOffer.type && newOffer.merchant && newOffer.description) {
            // First, create our offer object
            const offerToAdd = {
                id: Date.now(),
                type: newOffer.type,
                merchant: newOffer.merchant,
                description: newOffer.description,
                startDate: newOffer.startDate || new Date().toISOString().split('T')[0],
                endDate: newOffer.endDate,
                notes: newOffer.notes,
                promoCode: newOffer.promoCode,
                discountAmount: newOffer.discountAmount,
                minimumSpend: newOffer.minimumSpend,
                maximumDiscount: newOffer.maximumDiscount
            } as Offer;

            try {
                // Update the local state first
                setOffers(prev => [...prev, offerToAdd]);

                // Clear the form and close the modal
                setShowAddModal(false);
                setNewOffer({
                    type: 'sale',
                    startDate: new Date().toISOString().split('T')[0],
                });

            } catch (error) {
                console.error('Error saving offer:', error);
                // If saving fails, we might want to show an error message
                // but we'll keep the offer in local state for now
            }
        }
    }; return (
        <div className="p-6 space-y-6">
            {/* Calendar Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">Offers Calendar</h2>
                        </div>
                        <div className="space-x-2">
                            <Button onClick={() => setShowAddModal(true)}>Add Offer</Button>
                            <Button variant="outline" onClick={() => setShowSubscriptionModal(true)}>Add Subscription</Button>
                        </div>
                    </div>                </CardContent>
            </Card>

            {/* Add Offer Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Offer</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* 1. Offer Type */}
                        <div>
                            <Label>Offer Type</Label>
                            <Select
                                value={newOffer.type}
                                onValueChange={value => setNewOffer(prev => ({
                                    ...prev,
                                    type: value as OfferType
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sale">Sale/Promotion</SelectItem>
                                    <SelectItem value="promo">Promo Code</SelectItem>
                                    <SelectItem value="discount">Discount</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 2. Merchant */}
                        <div>
                            <Label>Merchant</Label>
                            <Input
                                placeholder="e.g., Amazon, Target"
                                value={newOffer.merchant || ''}
                                onChange={e => setNewOffer(prev => ({
                                    ...prev,
                                    merchant: e.target.value
                                }))}
                            />
                        </div>

                        {/* 3. Dynamic Offer Details */}
                        <div className="space-y-4">
                            {newOffer.type === 'promo' && (
                                <div>
                                    <Label>Promo Code</Label>
                                    <Input
                                        placeholder="Enter promo code"
                                        value={newOffer.promoCode || ''}
                                        onChange={e => setNewOffer(prev => ({
                                            ...prev,
                                            promoCode: e.target.value
                                        }))}
                                    />
                                </div>
                            )}

                            {newOffer.type === 'discount' && (
                                <>
                                    <div>
                                        <Label>Discount Amount</Label>
                                        <Input
                                            placeholder="e.g., $20 off or 20% off"
                                            value={newOffer.discountAmount || ''}
                                            onChange={e => setNewOffer(prev => ({
                                                ...prev,
                                                discountAmount: e.target.value
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Minimum Spend (Optional)</Label>
                                        <Input
                                            placeholder="e.g., $100"
                                            value={newOffer.minimumSpend || ''}
                                            onChange={e => setNewOffer(prev => ({
                                                ...prev,
                                                minimumSpend: e.target.value
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <Label>Maximum Discount (Optional)</Label>
                                        <Input
                                            placeholder="e.g., $50"
                                            value={newOffer.maximumDiscount || ''}
                                            onChange={e => setNewOffer(prev => ({
                                                ...prev,
                                                maximumDiscount: e.target.value
                                            }))}
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <Label>Description</Label>
                                <Input
                                    placeholder="Describe the offer"
                                    value={newOffer.description || ''}
                                    onChange={e => setNewOffer(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                />
                            </div>
                        </div>

                        {/* 4. Valid Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Start Date</Label>
                                <Input
                                    type="date"
                                    value={newOffer.startDate || ''}
                                    onChange={e => setNewOffer(prev => ({
                                        ...prev,
                                        startDate: e.target.value
                                    }))}
                                />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <Input
                                    type="date"
                                    value={newOffer.endDate || ''}
                                    onChange={e => setNewOffer(prev => ({
                                        ...prev,
                                        endDate: e.target.value
                                    }))}
                                />
                            </div>
                        </div>

                        {/* 5. Additional Notes */}
                        <div>
                            <Label>Additional Notes</Label>
                            <Input
                                placeholder="Any additional details or restrictions"
                                value={newOffer.notes || ''}
                                onChange={e => setNewOffer(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddOffer}>
                                Add Offer
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Subscription Modal */}
            <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Subscription</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* 1. Merchant Name */}
                        <div>
                            <Label>Merchant Name</Label>
                            <Input
                                placeholder="e.g., Netflix, Doordash"
                                value={newSubscription.merchant || ''}
                                onChange={e => setNewSubscription(prev => ({
                                    ...prev,
                                    merchant: e.target.value
                                }))}
                            />
                        </div>

                        {/* 2. Subscription Name */}
                        <div>
                            <Label>Subscription Name (Optional)</Label>
                            <Input
                                placeholder="e.g., DashPass, Premium Plan"
                                value={newSubscription.subscriptionName || ''}
                                onChange={e => setNewSubscription(prev => ({
                                    ...prev,
                                    subscriptionName: e.target.value
                                }))}
                            />
                        </div>

                        {/* 3. Price */}
                        <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={newSubscription.price || ''}
                                onChange={e => setNewSubscription(prev => ({
                                    ...prev,
                                    price: parseFloat(e.target.value)
                                }))}
                            />
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="includeTax"
                                    checked={newSubscription.includeTax}
                                    onCheckedChange={(checked) => setNewSubscription(prev => ({
                                        ...prev,
                                        includeTax: !!checked
                                    }))}
                                />
                                <Label htmlFor="includeTax">Include sales tax based on my state</Label>
                            </div>
                        </div>

                        {/* 4. Billing Frequency */}
                        <div>
                            <Label>Billing Frequency</Label>
                            <Select
                                value={newSubscription.billingFrequency}
                                onValueChange={value => setNewSubscription(prev => ({
                                    ...prev,
                                    billingFrequency: value as BillingFrequency
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select billing frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Every Month</SelectItem>
                                    <SelectItem value="every30">Every 30 Days</SelectItem>
                                    <SelectItem value="yearly">Every Year</SelectItem>
                                    <SelectItem value="custom">Custom Interval</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Interval (only shows if custom frequency selected) */}
                        {newSubscription.billingFrequency === 'custom' && (
                            <div>
                                <Label>Days Between Bills</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="e.g., 90 for quarterly"
                                    value={newSubscription.customInterval || ''}
                                    onChange={e => setNewSubscription(prev => ({
                                        ...prev,
                                        customInterval: parseInt(e.target.value)
                                    }))}
                                />
                            </div>
                        )}

                        {/* 5. Next Bill Date */}
                        <div>
                            <Label>Next Charge Date</Label>
                            <Input
                                type="date"
                                value={newSubscription.nextBillDate || ''}
                                onChange={e => setNewSubscription(prev => ({
                                    ...prev,
                                    nextBillDate: e.target.value
                                }))}
                            />
                        </div>

                        {/* 6. Trial Period */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hasTrial"
                                    checked={newSubscription.hasTrial}
                                    onCheckedChange={(checked) => setNewSubscription(prev => ({
                                        ...prev,
                                        hasTrial: !!checked,
                                        trialLength: undefined,
                                        trialEndDate: undefined
                                    }))}
                                />
                                <Label htmlFor="hasTrial">This subscription includes a free trial</Label>
                            </div>

                            {newSubscription.hasTrial && (
                                <div className="space-y-2 mt-2">
                                    <Input
                                        type="number"
                                        placeholder="Trial length in days"
                                        value={newSubscription.trialLength || ''}
                                        onChange={e => setNewSubscription(prev => ({
                                            ...prev,
                                            trialLength: parseInt(e.target.value)
                                        }))}
                                    />
                                    <Input
                                        type="date"
                                        value={newSubscription.trialEndDate || ''}
                                        onChange={e => setNewSubscription(prev => ({
                                            ...prev,
                                            trialEndDate: e.target.value
                                        }))}
                                    />
                                </div>
                            )}
                        </div>

                        {/* 7. Subscription Duration */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="hasEndDate"
                                    checked={newSubscription.hasEndDate}
                                    onCheckedChange={(checked) => setNewSubscription(prev => ({
                                        ...prev,
                                        hasEndDate: !!checked,
                                        endDate: undefined
                                    }))}
                                />
                                <Label htmlFor="hasEndDate">This subscription ends on a specific date</Label>
                            </div>

                            {newSubscription.hasEndDate && (
                                <Input
                                    type="date"
                                    value={newSubscription.endDate || ''}
                                    onChange={e => setNewSubscription(prev => ({
                                        ...prev,
                                        endDate: e.target.value
                                    }))}
                                />
                            )}
                        </div>

                        {/* 8. Notes */}
                        <div>
                            <Label>Additional Notes (Optional)</Label>
                            <Input
                                placeholder="E.g., Family plan covers 4 people"
                                value={newSubscription.notes || ''}
                                onChange={e => setNewSubscription(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowSubscriptionModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => {
                                if (newSubscription.merchant &&
                                    newSubscription.price &&
                                    newSubscription.billingFrequency &&
                                    newSubscription.nextBillDate) {
                                    // Add subscription logic here
                                    setShowSubscriptionModal(false);
                                }
                            }}>
                                Add Subscription
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Calendar Grid */}
            <Card className="mt-6">
                <CardContent className="pt-6">
                    {/* Calendar Header with Navigation */}
                    <div className="space-y-4">
                        {/* Month Navigation and Date Picker */}
                        <div className="flex items-center justify-between">
                            <Button
                                variant="outline"
                                className="w-32"
                                onClick={() => {
                                    const newDate = new Date(currentDate);
                                    newDate.setMonth(currentDate.getMonth() - 1);
                                    setCurrentDate(newDate);
                                }}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>

                            <div className="flex flex-col items-center">
                                <h2 className="text-2xl font-bold mb-2">
                                    {formatMonthYear(currentDate)}
                                </h2>
                                <Input
                                    type="date"
                                    className="w-40"
                                    value={currentDate.toISOString().split('T')[0]}
                                    onChange={(e) => setCurrentDate(new Date(e.target.value))}
                                />
                            </div>

                            <Button
                                variant="outline"
                                className="w-32"
                                onClick={() => {
                                    const newDate = new Date(currentDate);
                                    newDate.setMonth(currentDate.getMonth() + 1);
                                    setCurrentDate(newDate);
                                }}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {/* Day Headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center font-medium p-2">
                                {day}
                            </div>
                        ))}

                        {/* Calendar Dates */}
                        {(() => {
                            const daysInMonth = getDaysInMonth(currentDate);
                            const firstDay = getFirstDayOfMonth(currentDate);
                            const totalDays = firstDay + daysInMonth;
                            const requiredRows = Math.ceil(totalDays / 7);
                            const totalCells = requiredRows * 7;

                            // Create array for all calendar cells
                            return Array.from({ length: totalCells }, (_, index) => {
                                // Calculate the day number (1-31) or empty string if it's a padding day
                                const dayNumber = index - firstDay + 1;
                                const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

                                // Create a date object for this cell (if it's in the current month)
                                const cellDate = isCurrentMonth
                                    ? new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber)
                                    : null;

                                // Check if this date is today
                                const isToday = cellDate?.toDateString() === new Date().toDateString();

                                return (
                                    <div
                                        key={index}
                                        className={`p-2 min-h-24 border ${isCurrentMonth
                                            ? 'bg-white hover:bg-gray-50'
                                            : 'bg-gray-50/50 hover:bg-gray-50'
                                            } ${isToday
                                                ? 'border-blue-500 border-2'
                                                : ''
                                            }`}
                                    >
                                        {/* Day Number */}
                                        <div className={`text-right text-sm ${isCurrentMonth
                                            ? 'text-gray-900'
                                            : 'text-gray-400'
                                            }`}>
                                            {/* Always show the day number, even for adjacent months */}
                                            {dayNumber > 0 ? Math.abs(dayNumber) : ''}
                                        </div>

                                        {/* Offers will go here */}
                                        <div className="space-y-1">
                                            {cellDate && (
                                                <div className="space-y-1">
                                                    {/* Group offers for this day */}
                                                    {(() => {
                                                        const startingOffers = offers.filter(offer => {
                                                            const startDate = new Date(offer.startDate);
                                                            return cellDate.toDateString() === startDate.toDateString();
                                                        });

                                                        const endingOffers = offers.filter(offer => {
                                                            if (!offer.endDate) return false;
                                                            const endDate = new Date(offer.endDate);
                                                            return cellDate.toDateString() === endDate.toDateString();
                                                        });

                                                        const activeOffers = offers.filter(offer => {
                                                            const startDate = new Date(offer.startDate);
                                                            const endDate = offer.endDate ? new Date(offer.endDate) : null;
                                                            return startDate <= cellDate && (!endDate || cellDate <= endDate);
                                                        });

                                                        return (
                                                            <>
                                                                {/* Starting offers */}
                                                                {startingOffers.length > 0 && (
                                                                    <div className="flex items-center gap-1">
                                                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                                                        {startingOffers.length > 1 && (
                                                                            <span className="text-xs text-green-600">
                                                                                {startingOffers.length}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Ending offers */}
                                                                {endingOffers.length > 0 && (
                                                                    <div
                                                                        className="flex items-center gap-1 cursor-help"
                                                                        title={endingOffers.map(o =>
                                                                            `${o.merchant}: ${o.description}`
                                                                        ).join('\n')}
                                                                    >
                                                                        <div className="h-2 w-2 rounded-full bg-red-500" />
                                                                        {endingOffers.length > 1 && (
                                                                            <span className="text-xs text-red-600">
                                                                                {endingOffers.length}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}

                                                                {/* Active offers indicator */}
                                                                {activeOffers.length > 0 && startingOffers.length === 0 && endingOffers.length === 0 && (
                                                                    <div className="h-1 w-1 rounded-full bg-blue-300 mx-auto" />
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OffersCalendarPage;