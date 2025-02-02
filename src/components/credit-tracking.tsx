// src/components/credit-tracking.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Plus, History } from 'lucide-react';

interface Credit {
  id: string;
  name: string;
  amount: number;
  frequency: 'annual' | 'monthly' | 'semi-annual';
  currentBalance: number;
  nextRefresh: Date;
  usageHistory: {
    date: Date;
    amount: number;
    merchant?: string;
  }[];
}

const sampleCredits: Credit[] = [
  {
    id: 'uber',
    name: 'Uber Cash',
    amount: 200,
    frequency: 'monthly',
    currentBalance: 15,
    nextRefresh: new Date('2024-03-01'),
    usageHistory: [
      { date: new Date('2024-02-15'), amount: 15, merchant: 'Uber Eats' }
    ]
  },
  {
    id: 'entertainment',
    name: 'Digital Entertainment Credit',
    amount: 240,
    frequency: 'monthly',
    currentBalance: 20,
    nextRefresh: new Date('2024-03-01'),
    usageHistory: []
  },
  {
    id: 'airline-fee',
    name: 'Airline Incidental Fee Credit',
    amount: 200,
    frequency: 'annual',
    currentBalance: 150,
    nextRefresh: new Date('2025-01-01'),
    usageHistory: [
      { date: new Date('2024-01-15'), amount: 50, merchant: 'United Airlines' }
    ]
  }
];

interface CreditTrackingProps {
  cardName: string;
}

export const CreditTracking: React.FC<CreditTrackingProps> = ({ cardName }) => {
  const [credits] = useState<Credit[]>(sampleCredits);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [isAddingUsage, setIsAddingUsage] = useState(false);
  const [newUsage, setNewUsage] = useState({
    amount: '',
    merchant: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddUsage = (credit: Credit) => {
    setSelectedCredit(credit);
    setIsAddingUsage(true);
    setNewUsage({
      amount: '',
      merchant: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const submitUsage = () => {
    // Here you would typically make an API call to update the database
    console.log('Adding usage:', {
      creditId: selectedCredit?.id,
      ...newUsage
    });
    setIsAddingUsage(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Credit Tracking - {cardName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {credits.map(credit => (
            <div key={credit.id} className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{credit.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {credit.frequency === 'monthly' ? 'Monthly' : 
                     credit.frequency === 'annual' ? 'Annual' : 
                     'Semi-annual'} credit
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    ${credit.currentBalance} available
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddUsage(credit)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress 
                  value={(credit.currentBalance / credit.amount) * 100}
                  className="h-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    Used: ${credit.amount - credit.currentBalance} of ${credit.amount}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Refreshes {credit.nextRefresh.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {credit.usageHistory.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <History className="h-4 w-4" />
                    Recent Activity
                  </div>
                  {credit.usageHistory.map((usage, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{usage.merchant || 'Unknown'}</span>
                      <span>-${usage.amount.toFixed(2)} on {usage.date.toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={isAddingUsage} onOpenChange={setIsAddingUsage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Credit Usage - {selectedCredit?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Used</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newUsage.amount}
                  onChange={(e) => setNewUsage(prev => ({
                    ...prev,
                    amount: e.target.value
                  }))}
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant (Optional)</Label>
              <Input
                id="merchant"
                placeholder="Enter merchant name"
                value={newUsage.merchant}
                onChange={(e) => setNewUsage(prev => ({
                  ...prev,
                  merchant: e.target.value
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date Used</Label>
              <Input
                id="date"
                type="date"
                value={newUsage.date}
                onChange={(e) => setNewUsage(prev => ({
                  ...prev,
                  date: e.target.value
                }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddingUsage(false)}>
                Cancel
              </Button>
              <Button onClick={submitUsage}>
                Record Usage
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreditTracking;