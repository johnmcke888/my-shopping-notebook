'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus, Wallet, Gift, Tag } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

// Sample card database
const cardDatabase = `AmEx
AmEx Platinum Card for Schwab 
AmEx Schwab Investor Credit Card 
...`;  // Rest of the database

interface CreditCardData {
    id: number;
    name: string;
    issuer: string;
    type: 'personal' | 'business';
    annualFee: number;
    nextFeeDate?: string;
    apr: string;
    bonusCategories: {
        category: string;
        rate: number;
        type: string;
        details?: string;
    }[];
    baseRewards: {
        points: number;
        type: string;
        perDollar: boolean;
    };
    credits: {
        name: string;
        amount: number;
        used: number;
        frequency: 'annual' | 'monthly';
        details: string;
    }[];
}

interface PresetCard {
    name: string;
    issuer: string;
}

const RewardsPage = () => {
    // Move useState hooks inside the component
    const [isLoading, setIsLoading] = useState(true);
    const [creditCards, setCreditCards] = useState<CreditCardData[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const { userId } = useAuth();

    // Helper function to parse card names from the database
    const parseCardDatabase = (): PresetCard[] => {
        return cardDatabase
            .split('\n')
            .filter(line => line.includes('Review'))
            .map(line => {
                const name = line.split('Review')[0].trim();
                // Extract issuer (first word usually)
                const issuer = name.split(' ')[0];
                return {
                    name,
                    issuer
                };
            });
    };
    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [addCardMode, setAddCardMode] = useState<'preset' | 'custom'>('preset');
    const [searchTerm, setSearchTerm] = useState('');
    interface NewCardForm {
        name: string;
        issuer: string;
        annualFee: number;
        bonusCategories: Array<{
            category: string;
            rate: number;
        }>;
        baseRate: number;
        type: 'personal' | 'business';
    }

    const [newCard, setNewCard] = useState<NewCardForm>({
        name: '',
        issuer: '',
        annualFee: 0,
        bonusCategories: [{ category: '', rate: 0 }],
        baseRate: 1,
        type: 'personal' as 'personal' | 'business'
    });
    // Calculate summary statistics
    const totalAnnualFees = Array.isArray(creditCards) ?
        creditCards.reduce((sum, card) => sum + card.annualFee, 0) : 0;
    const nextFeeCard = Array.isArray(creditCards) && creditCards.length > 0 ?
        creditCards.reduce((closest, card) => {
            if (!closest || !closest.nextFeeDate) return card;
            if (!card.nextFeeDate) return closest;
            return new Date(card.nextFeeDate) < new Date(closest.nextFeeDate) ? card : closest;
        }, creditCards[0]) : null;

    const totalCredits = Array.isArray(creditCards) ?
        creditCards.reduce((sum, card) =>
            sum + card.credits.reduce((creditsSum, credit) => creditsSum + credit.amount, 0), 0) : 0;
    const usedCredits = Array.isArray(creditCards) ?
        creditCards.reduce((sum, card) =>
            sum + card.credits.reduce((creditsSum, credit) => creditsSum + credit.used, 0), 0) : 0;

    const aprs = Array.isArray(creditCards) ?
        creditCards
            .filter(card => card.apr && !isNaN(parseFloat(card.apr)))
            .map(card => parseFloat(card.apr)) : [];
    const lowestAPR = aprs.length > 0 ? Math.min(...aprs) : 0;
    const highestAPR = aprs.length > 0 ? Math.max(...aprs) : 0;

    // Get all unique categories for the optimizer
    const allCategories = Array.isArray(creditCards) ?
        Array.from(new Set(
            creditCards.flatMap(card =>
                (card.bonusCategories || []).map(bonus => bonus.category)
            )
        )) : [];

    const progressValue = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;
    const getBestCardForCategory = (category: string) => {
        return creditCards.reduce((best, card) => {
            const categoryBonus = card.bonusCategories?.find(bonus => bonus.category === category);
            const currentBestBonus = best?.bonusCategories?.find(bonus => bonus.category === category);

            if (!categoryBonus) return best;
            if (!best || !currentBestBonus) return card;
            return categoryBonus.rate > currentBestBonus.rate ? card : best;
        }, null as CreditCardData | null);
    };

    useEffect(() => {
        async function loadCreditCards() {
            if (!userId) return;
            setIsLoading(true);  // Start loading
            try {
                const response = await fetch(`/api/creditcards?userId=${userId}`);
                const data = await response.json();
                setCreditCards(data);
            } catch (error) {
                console.error('Error loading credit cards:', error);
            } finally {
                setIsLoading(false);  // End loading
            }
        }

        loadCreditCards();
    }, [userId]);

    return (
        <div className="p-6 space-y-6">
            {isLoading ? (
                <div className="text-center py-4">Loading credit cards...</div>
            ) : (
                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="flex items-center gap-2 text-2xl font-bold mb-1">
                                    {Array.isArray(creditCards) ? creditCards.length : 0}
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">Active Cards</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {Array.isArray(creditCards) ?
                                        creditCards.filter(card => card.type === 'business').length : 0} Business
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="text-2xl font-bold mb-1">${totalAnnualFees}</div>
                                <p className="text-sm text-muted-foreground">Annual Fees</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {nextFeeCard && nextFeeCard.nextFeeDate ? (
                                        <>Next: ${nextFeeCard.annualFee} in {
                                            new Date(nextFeeCard.nextFeeDate).toLocaleDateString('en-US', { month: 'short' })
                                        }</>
                                    ) : (
                                        'No upcoming fees'
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="text-2xl font-bold mb-1">
                                    ${usedCredits} <span className="text-sm text-muted-foreground">/ ${totalCredits}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">Credits Used</p>
                                <Progress
                                    value={totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0}
                                    className="w-full h-2 mt-2"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="text-2xl font-bold mb-1">
                                    {lowestAPR === highestAPR ?
                                        `${lowestAPR}%` :
                                        `${lowestAPR}% - ${highestAPR}%`}
                                </div>
                                <p className="text-sm text-muted-foreground">APR Range</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Your Credit Cards</CardTitle>
                    <Dialog open={isAddCardModalOpen} onOpenChange={setIsAddCardModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Card
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Credit Card</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 pt-4">
                                <div className="flex gap-4">
                                    <Button
                                        variant={addCardMode === 'preset' ? "default" : "outline"}
                                        onClick={() => setAddCardMode('preset')}
                                        className="flex-1"
                                    >
                                        Select from Database
                                    </Button>
                                    <Button
                                        variant={addCardMode === 'custom' ? "default" : "outline"}
                                        onClick={() => setAddCardMode('custom')}
                                        className="flex-1"
                                    >
                                        Create Custom Card
                                    </Button>
                                </div>

                                {addCardMode === 'preset' ? (
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <Input
                                                placeholder="Search for a card..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="flex-1"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                                            {parseCardDatabase()
                                                .filter(card =>
                                                    card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    card.issuer.toLowerCase().includes(searchTerm.toLowerCase())
                                                )
                                                .map((card, idx) => (
                                                    <Button
                                                        key={idx}
                                                        variant="outline"
                                                        className="justify-start h-auto py-4"
                                                        onClick={() => {
                                                            setNewCard(prev => ({
                                                                ...prev,
                                                                name: card.name,
                                                                issuer: card.issuer
                                                            }));
                                                            setAddCardMode('custom'); // Switch to custom mode to fill in details
                                                        }}
                                                    >
                                                        <div className="text-left">
                                                            <div className="font-medium">{card.name}</div>
                                                            <div className="text-sm text-muted-foreground">{card.issuer}</div>
                                                        </div>
                                                    </Button>
                                                ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Card Name</Label>
                                                <Input
                                                    id="name"
                                                    value={newCard.name}
                                                    onChange={(e) => setNewCard(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="e.g., Chase Sapphire Preferred"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="issuer">Card Issuer</Label>
                                                <Input
                                                    id="issuer"
                                                    value={newCard.issuer}
                                                    onChange={(e) => setNewCard(prev => ({ ...prev, issuer: e.target.value }))}
                                                    placeholder="e.g., Chase"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="annualFee">Annual Fee</Label>
                                                <Input
                                                    id="annualFee"
                                                    type="number"
                                                    value={newCard.annualFee}
                                                    onChange={(e) => setNewCard(prev => ({ ...prev, annualFee: parseFloat(e.target.value) }))}
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Card Type</Label>
                                                <Select
                                                    value={newCard.type}
                                                    onValueChange={(value: 'personal' | 'business') =>
                                                        setNewCard(prev => ({ ...prev, type: value }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select card type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="personal">Personal</SelectItem>
                                                        <SelectItem value="business">Business</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Bonus Categories</Label>
                                            {newCard.bonusCategories.map((category, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        placeholder="Category (e.g., Dining)"
                                                        value={category.category}
                                                        onChange={(e) => {
                                                            const newCategories = [...newCard.bonusCategories];
                                                            newCategories[index].category = e.target.value;
                                                            setNewCard(prev => ({ ...prev, bonusCategories: newCategories }));
                                                        }}
                                                    />
                                                    <Input
                                                        type="number"
                                                        placeholder="Rate"
                                                        className="w-24"
                                                        value={category.rate}
                                                        onChange={(e) => {
                                                            const newCategories = [...newCard.bonusCategories];
                                                            newCategories[index].rate = parseFloat(e.target.value);
                                                            setNewCard(prev => ({ ...prev, bonusCategories: newCategories }));
                                                        }}
                                                    />
                                                    {index === newCard.bonusCategories.length - 1 ? (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setNewCard(prev => ({
                                                                ...prev,
                                                                bonusCategories: [...prev.bonusCategories, { category: '', rate: 0 }]
                                                            }))}
                                                        >
                                                            +
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                const newCategories = newCard.bonusCategories.filter((_, i) => i !== index);
                                                                setNewCard(prev => ({ ...prev, bonusCategories: newCategories }));
                                                            }}
                                                        >
                                                            -
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="baseRate">Base Earning Rate</Label>
                                            <Input
                                                id="baseRate"
                                                type="number"
                                                value={newCard.baseRate}
                                                onChange={(e) => setNewCard(prev => ({ ...prev, baseRate: parseFloat(e.target.value) }))}
                                                placeholder="1"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsAddCardModalOpen(false);
                                                    setNewCard({
                                                        name: '',
                                                        issuer: '',
                                                        annualFee: 0,
                                                        bonusCategories: [{ category: '', rate: 0 }],
                                                        baseRate: 1,
                                                        type: 'personal'
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button onClick={() => {
                                                // Add card logic here
                                                setIsAddCardModalOpen(false);
                                            }}>
                                                Add Card
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">All Cards</TabsTrigger>
                            <TabsTrigger value="personal">Personal</TabsTrigger>
                            <TabsTrigger value="business">Business</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-4">
                            {Array.isArray(creditCards) && creditCards.length > 0 ? (
                                creditCards.map(card => (

                                    <Card key={card.id}>
                                        <CardContent className="pt-6">
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{card.name}</h3>
                                                        <p className="text-sm text-muted-foreground">{card.issuer}</p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                </div>

                                                {/* Rewards Structure */}
                                                <div className="space-y-4">
                                                    <h4 className="font-medium">Rewards Structure</h4>
                                                    <div className="pl-4 border-l-2 border-primary/20 space-y-3">
                                                        {/* Bonus Categories (sorted by rate) */}
                                                        {[...card.bonusCategories]
                                                            .sort((a, b) => b.rate - a.rate)
                                                            .map((bonus, idx) => (
                                                                <div key={idx} className="flex items-center gap-2 text-base">
                                                                    <span className="font-semibold">{bonus.rate}x</span>
                                                                    <span>{bonus.category}</span>
                                                                    {bonus.details && (
                                                                        <span className="text-sm text-muted-foreground">
                                                                            ({bonus.details})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        {/* Base Rate */}
                                                        <div className="flex items-center gap-2 text-base">
                                                            <span className="font-semibold">{card.baseRewards.points}x</span>
                                                            <span>All other purchases</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Credits */}
                                                {card.credits.length > 0 && (
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium">Credits & Benefits</h4>
                                                        <div className="pl-4 border-l-2 border-primary/20 space-y-4">
                                                            {card.credits.map((credit, idx) => (
                                                                <div key={idx} className="space-y-2">
                                                                    <div className="flex justify-between items-baseline">
                                                                        <span className="font-medium">{credit.name}</span>
                                                                        <span className="text-sm">
                                                                            ${credit.used} / ${credit.amount}
                                                                        </span>
                                                                    </div>
                                                                    <Progress
                                                                        value={(credit.used / credit.amount) * 100}
                                                                        className="h-2"
                                                                    />
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {credit.details}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-4">No credit cards found</div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Category Optimizer */}
            <Card>
                <CardHeader>
                    <CardTitle>Best Card For...</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                        >
                            <SelectTrigger className="w-[400px]">
                                <SelectValue placeholder="Select a spending category" />
                            </SelectTrigger>
                            <SelectContent>
                                {allCategories.map(category => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedCategory && getBestCardForCategory(selectedCategory) && (
                            <div className="flex items-center gap-4">
                                <span className="font-medium">
                                    {getBestCardForCategory(selectedCategory)?.name}
                                </span>
                                <span className="text-muted-foreground">
                                    ({getBestCardForCategory(selectedCategory)?.bonusCategories
                                        .find(bonus => bonus.category === selectedCategory)?.rate}x points)
                                </span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RewardsPage;