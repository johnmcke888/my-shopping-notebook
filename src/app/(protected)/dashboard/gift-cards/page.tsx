'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Gift, Plus, Trash2, AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

type GiftCard = {
  id: number;
  merchant: string;
  cardNumber: string;
  pin?: string;
  balance: number;
  isNetworkCard: boolean;
  expirationDate: string | null;
  dateAdded: string;
  dateSpent?: string;
  status: 'active' | 'spent';
};

export default function GiftCardsPage() {
  // All our existing state
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [showActiveCards, setShowActiveCards] = useState(true);
  const [newCard, setNewCard] = useState({
    merchant: '',
    cardNumber: '',
    pin: '',
    balance: '',
    isNetworkCard: false,
    hasExpiration: false,
    expirationDate: '',
    hasEnteredCardNumber: false
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [viewingCard, setViewingCard] = useState<GiftCard | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<GiftCard | null>(null);
  const [cardToSpend, setCardToSpend] = useState<GiftCard | null>(null);

  // New validation state
  const [validation, setValidation] = useState({
    cardNumber: { isValid: true, showValidation: false },
    cvv: { isValid: true, showValidation: false },
    expiration: { isValid: true, showValidation: false }
  });

  // Our existing helper functions
  const filteredCards = giftCards.filter(card => 
    showActiveCards ? card.status === 'active' : card.status === 'spent'
  );
  
  const activeCards = giftCards.filter(card => card.status === 'active');
  const totalBalance = activeCards.reduce((sum, card) => sum + card.balance, 0);

  const nextExpiration = activeCards
  .filter(card => card.expirationDate)
  .sort((a, b) => {
    const [monthA, dayA, yearA] = (a.expirationDate || '').split('/');
    const [monthB, dayB, yearB] = (b.expirationDate || '').split('/');
    const dateA = dayA ? new Date(`${yearA}-${monthA}-${dayA}`) : new Date(`${yearA}-${monthA}-01`);
    const dateB = dayB ? new Date(`${yearB}-${monthB}-${dayB}`) : new Date(`${yearB}-${monthB}-01`);
    return dateA.getTime() - dateB.getTime();
  })[0];

  // New validation helper functions
  const isValidCardNumber = (number: string): boolean => {
    // Remove spaces/dashes and check if empty
    number = number.replace(/[\s-]/g, '');
    if (!number) return true; // Empty is valid since it's optional
    
    // Basic number check
    if (!/^\d+$/.test(number)) return false;

    // Luhn Algorithm
    let sum = 0;
    let isEven = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  };

  const isValidExpirationDate = (value: string): boolean => {
    if (!value) return true; // Empty is valid since it's optional
    const [month, year] = value.split('/');
    if (!month || !year) return false;
    
    const currentDate = new Date();
    const cardDate = new Date(parseInt(`20${year}`), parseInt(month) - 1);
    return cardDate > currentDate;
  };

  const isValidCVV = (cvv: string, isAmex: boolean): boolean => {
    if (!cvv) return true; // Empty is valid since it's optional
    const correctLength = isAmex ? 4 : 3;
    return /^\d+$/.test(cvv) && cvv.length === correctLength;
  };
// Our existing formatting functions
const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).replace('$', '');
  };
 
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
 
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [month, day, year] = dateStr.split('/');
    if (!day) {
      const date = new Date(`${year}-${month}-01`);
      return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    }
    const date = new Date(`${year}-${month}-${day}`);
    return date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
 
  const formatExpirationDate = (value: string, isNetworkCard: boolean) => {
    if (isNetworkCard) {
      const numbers = value.replace(/\D/g, '');
      let month = numbers.substring(0, 2);
      const year = numbers.substring(2, 6);
      
      if (month.length === 1 && parseInt(month) > 1) {
        month = '0' + month;
      }
      
      if (parseInt(month) > 12) {
        month = '12';
      }
      
      if (month || year) {
        return `${month}${year ? '/' + year : ''}`;
      }
      return '';
    }
    return value;
  };
 
  // Updated Input Handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cardNumber' && newCard.isNetworkCard) {
      if (!validateNetworkCardNumber(value, newCard.isNetworkCard)) return;
      setValidation(prev => ({
        ...prev,
        cardNumber: {
          isValid: isValidCardNumber(value),
          showValidation: value.length > 0
        }
      }));
    }
 
    if (name === 'pin' && newCard.isNetworkCard) {
      const maxLength = newCard.cardNumber.startsWith('3') ? 4 : 3;
      if (value.length > maxLength) return;
      setValidation(prev => ({
        ...prev,
        cvv: {
          isValid: isValidCVV(value, newCard.cardNumber.startsWith('3')),
          showValidation: value.length > 0
        }
      }));
    }
    
    if (name === 'expirationDate' && newCard.isNetworkCard) {
      const formatted = formatExpirationDate(value, newCard.isNetworkCard);
      setValidation(prev => ({
        ...prev,
        expiration: {
          isValid: isValidExpirationDate(formatted),
          showValidation: formatted.length > 0
        }
      }));
      setNewCard(prev => ({
        ...prev,
        expirationDate: formatted
      }));
      return;
    }
 
    setNewCard(prev => {
      const updates: any = {
        ...prev,
        [name]: value
      };
      
      if (name === 'cardNumber') {
        updates.hasEnteredCardNumber = value.length > 0;
        const detectedType = detectCardType(value, prev.isNetworkCard);
        if (detectedType) {
          updates.merchant = detectedType;
        }
      }
      
      return updates;
    });
  };
 
  // All our existing helper functions remain the same
  const handleNetworkCardChange = (checked: boolean) => {
    setNewCard(prev => ({
      ...prev,
      isNetworkCard: checked,
      cardNumber: '',
      pin: '',
      merchant: '',
      expirationDate: ''
    }));
    setValidation({
      cardNumber: { isValid: true, showValidation: false },
      cvv: { isValid: true, showValidation: false },
      expiration: { isValid: true, showValidation: false }
    });
  };
 
  const handleCardSpent = (card: GiftCard) => {
    setCardToSpend(card);
  };
 
  const confirmCardSpent = () => {
    if (cardToSpend) {
      setGiftCards(prev => prev.map(card => 
        card.id === cardToSpend.id 
          ? { ...card, status: 'spent', dateSpent: new Date().toISOString() } 
          : card
      ));
      setCardToSpend(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };
 
  const handleDeleteCard = (id: number) => {
    setGiftCards(prev => prev.filter(card => card.id !== id));
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
 
    // Validate fields if they're filled in
    if (newCard.cardNumber && !isValidCardNumber(newCard.cardNumber)) {
      alert('Please enter a valid card number or leave it empty');
      return;
    }
 
    if (newCard.pin && !isValidCVV(newCard.pin, newCard.cardNumber.startsWith('3'))) {
      alert('Please enter a valid CVV/PIN or leave it empty');
      return;
    }
 
    if (newCard.isNetworkCard && newCard.expirationDate && !isValidExpirationDate(newCard.expirationDate)) {
      alert('Please enter a valid expiration date or leave it empty');
      return;
    }
 
    const newGiftCard: GiftCard = {
      id: giftCards.length + 1,
      merchant: newCard.merchant,
      cardNumber: newCard.cardNumber,
      pin: newCard.pin || undefined,
      balance: parseFloat(newCard.balance),
      isNetworkCard: newCard.isNetworkCard,
      expirationDate: newCard.expirationDate || null,
      dateAdded: new Date().toISOString(),
      status: 'active'
    };
 
    setGiftCards(prev => [...prev, newGiftCard]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
 
    setNewCard({
      merchant: '',
      cardNumber: '',
      pin: '',
      balance: '',
      isNetworkCard: false,
      hasExpiration: false,
      expirationDate: '',
      hasEnteredCardNumber: false
    });
    setIsModalOpen(false);
  };
 
  return (
    <div className="p-6 space-y-6">
      {showSuccess && (
        <Alert className="fixed top-4 right-4 w-96 bg-green-100 border-green-600">
          <AlertDescription>Action completed successfully!</AlertDescription>
        </Alert>
      )}
 
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                {activeCards.length}
                <Gift className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Active Cards</p>
            </div>
 
            <div className="text-center border-x">
              <div className="text-2xl font-bold">${formatCurrency(totalBalance)}</div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
            </div>
 
            <div className="text-center">
              {nextExpiration ? (
                <>
                  <div className="text-lg font-medium">
                    {formatDisplayDate(nextExpiration.expirationDate || '')}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Next Expiration ({nextExpiration.merchant})
                  </p>
                </>
              ) : (
                <>
                  <div className="text-lg font-medium">No Cards</div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
 
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Your Gift Cards</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant={showActiveCards ? "default" : "outline"}
                onClick={() => setShowActiveCards(true)}
                size="sm"
              >
                Active
              </Button>
              <Button 
                variant={!showActiveCards ? "default" : "outline"}
                onClick={() => setShowActiveCards(false)}
                size="sm"
              >
                Spent
              </Button>
            </div>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
           <DialogTrigger asChild>
             <Button className="flex items-center gap-2">
               <Plus className="h-4 w-4" /> Add Card
             </Button>
           </DialogTrigger>
           <DialogContent>
             <DialogHeader>
               <DialogTitle>Add New Gift Card</DialogTitle>
             </DialogHeader>
             
             <form onSubmit={handleSubmit} className="space-y-4">
               <div className="flex items-center space-x-2">
                 <Checkbox 
                   id="isNetworkCard" 
                   checked={newCard.isNetworkCard}
                   onCheckedChange={handleNetworkCardChange}
                 />
                 <Label htmlFor="isNetworkCard">
                   Gift card from Visa, Mastercard, American Express, or Discover
                 </Label>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="merchant">Merchant</Label>
                 <div className="relative">
                   <Input
                     id="merchant"
                     name="merchant"
                     placeholder="e.g., Amazon, Target, Visa"
                     value={newCard.merchant}
                     onChange={handleInputChange}
                     required={!newCard.hasEnteredCardNumber}
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="balance">Balance</Label>
                 <Input
                   id="balance"
                   name="balance"
                   type="number"
                   step="0.01"
                   min="0"
                   placeholder="0.00"
                   value={newCard.balance}
                   onChange={handleInputChange}
                   required
                   className="no-spin-buttons"
                 />
               </div>

               <div className="space-y-2">
                 <Label htmlFor="cardNumber">Card Number (Optional)</Label>
                 <div className="relative">
                   <Input
                     id="cardNumber"
                     name="cardNumber"
                     placeholder="Enter card number"
                     value={newCard.cardNumber}
                     onChange={handleInputChange}
                     className={`${
                       validation.cardNumber.showValidation
                         ? validation.cardNumber.isValid
                           ? 'border-green-500 focus:border-green-500'
                           : 'border-red-500 focus:border-red-500'
                         : ''
                     }`}
                   />
                   {validation.cardNumber.showValidation && (
                     <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                       {validation.cardNumber.isValid ? (
                         <Check className="h-4 w-4 text-green-500" />
                       ) : (
                         <X className="h-4 w-4 text-red-500" />
                       )}
                     </div>
                   )}
                 </div>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="pin">
                   {newCard.isNetworkCard ? 'CVV' : 'Card PIN'} (Optional)
                 </Label>
                 <div className="relative">
                   <Input
                     id="pin"
                     name="pin"
                     type="password"
                     placeholder={newCard.isNetworkCard ? 
                       (newCard.cardNumber 
                         ? `Enter ${newCard.cardNumber.startsWith('3') ? '4-digit' : '3-digit'} CVV` 
                         : 'Enter 3 or 4 digit CVV'
                       ) : "Enter PIN"}
                     value={newCard.pin}
                     onChange={handleInputChange}
                     className={`${
                       validation.cvv.showValidation && newCard.isNetworkCard
                         ? validation.cvv.isValid
                           ? 'border-green-500 focus:border-green-500'
                           : 'border-red-500 focus:border-red-500'
                         : ''
                     }`}
                   />
                   {validation.cvv.showValidation && newCard.isNetworkCard && (
                     <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                       {validation.cvv.isValid ? (
                         <Check className="h-4 w-4 text-green-500" />
                       ) : (
                         <X className="h-4 w-4 text-red-500" />
                       )}
                     </div>
                   )}
                 </div>
               </div>

               {!newCard.isNetworkCard && (
                 <div className="flex items-center space-x-2">
                   <Checkbox 
                     id="hasExpiration" 
                     checked={newCard.hasExpiration}
                     onCheckedChange={(checked) => {
                       setNewCard(prev => ({
                         ...prev,
                         hasExpiration: checked,
                         expirationDate: ''
                       }));
                     }}
                   />
                   <Label htmlFor="hasExpiration">Card has expiration date</Label>
                 </div>
               )}

               {(newCard.hasExpiration || newCard.isNetworkCard) && (
                 <div className="space-y-2">
                   <Label htmlFor="expirationDate">
                     Expiration Date {newCard.isNetworkCard && '(Optional but suggested)'}
                   </Label>
                   <div className="relative">
                     {newCard.isNetworkCard ? (
                       <Input
                         id="expirationDate"
                         name="expirationDate"
                         placeholder="MM/YYYY"
                         value={newCard.expirationDate}
                         onChange={handleInputChange}
                         className={`${
                           validation.expiration.showValidation
                             ? validation.expiration.isValid
                               ? 'border-green-500 focus:border-green-500'
                               : 'border-red-500 focus:border-red-500'
                             : ''
                         }`}
                       />
                     ) : (
                       <Input
                         id="expirationDate"
                         name="expirationDate"
                         type="date"
                         value={newCard.expirationDate}
                         onChange={handleInputChange}
                         required={newCard.hasExpiration}
                       />
                     )}
                     {validation.expiration.showValidation && newCard.isNetworkCard && (
                       <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                         {validation.expiration.isValid ? (
                           <Check className="h-4 w-4 text-green-500" />
                         ) : (
                           <X className="h-4 w-4 text-red-500" />
                         )}
                       </div>
                     )}
                   </div>
                 </div>
               )}

               <div className="flex justify-end gap-2 mt-6">
                 <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                   Cancel
                 </Button>
                 <Button type="submit">Add Card</Button>
               </div>
             </form>
           </DialogContent>
         </Dialog>
       </div>
       <div className="divide-y">
         {filteredCards.map(card => (
           <div key={card.id} className="p-4 hover:bg-gray-50">
             {cardToSpend?.id === card.id && (
               <Alert className="mb-4" variant="default">
                 <AlertCircle className="h-4 w-4" />
                 <AlertDescription className="flex items-center justify-between">
                   <span>Are you sure you want to mark this card as spent?</span>
                   <div className="space-x-2">
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={() => setCardToSpend(null)}
                     >
                       Cancel
                     </Button>
                     <Button 
                       size="sm"
                       onClick={confirmCardSpent}
                     >
                       Confirm
                     </Button>
                   </div>
                 </AlertDescription>
               </Alert>
             )}

             {cardToDelete?.id === card.id && (
               <Alert className="mb-4 border-red-600">
                 <AlertCircle className="h-4 w-4" />
                 <AlertDescription className="flex items-center justify-between">
                   <span>Are you sure you want to permanently delete this card?</span>
                   <div className="space-x-2">
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={() => setCardToDelete(null)}
                     >
                       Cancel
                     </Button>
                     <Button 
                       variant="destructive"
                       size="sm"
                       onClick={() => handleDeleteCard(card.id)}
                     >
                       Delete
                     </Button>
                   </div>
                 </AlertDescription>
               </Alert>
             )}

             <div className="flex justify-between items-start">
               <div>
                 <h3 className="font-medium">{card.merchant}</h3>
                 {card.cardNumber && (
                   <p className="text-sm text-gray-500">
                     Card: ••••{card.cardNumber.slice(-4)}
                   </p>
                 )}
                 <p className="text-sm font-medium mt-1">
                   ${formatCurrency(card.balance)}
                 </p>
                 <p className="text-sm text-gray-500 mt-1">
                   {card.status === 'active' 
                     ? `Added on ${formatDate(card.dateAdded)}`
                     : `Marked spent on ${formatDate(card.dateSpent!)}`
                   }
                 </p>
               </div>
               <div className="text-right">
                 <div className="flex space-x-2 mb-2">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={() => {
                       setViewingCard(card);
                       setShowCardModal(true);
                     }}
                   >
                     View Card
                   </Button>
                   {card.status === 'active' && (
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => handleCardSpent(card)}
                     >
                       Mark Spent
                     </Button>
                   )}
                   <Button 
                     variant="ghost" 
                     size="sm"
                     onClick={() => setCardToDelete(card)}
                   >
                     <Trash2 className="h-4 w-4 text-red-500" />
                   </Button>
                 </div>
                 {card.expirationDate && (
                   <p className="text-sm text-gray-500">
                     Expires: {formatDisplayDate(card.expirationDate)}
                   </p>
                 )}
               </div>
             </div>
           </div>
         ))}
       </div>
     </div>

     <Dialog open={showCardModal} onOpenChange={setShowCardModal}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle>Card Details</DialogTitle>
         </DialogHeader>
         {viewingCard && (
           <div className="bg-gray-50 p-6 rounded-lg space-y-4">
             <div className="text-2xl font-bold">{viewingCard.merchant}</div>
             <div className="space-y-2">
               <div className="text-sm text-gray-500">Card Number</div>
               <div className="font-mono">{viewingCard.cardNumber || 'Not provided'}</div>
             </div>
             <div className="space-y-2">
               <div className="text-sm text-gray-500">
                 {viewingCard.isNetworkCard ? 'CVV' : 'PIN'}
               </div>
               <div className="font-mono">{viewingCard.pin || 'Not provided'}</div>
             </div>
             <div className="space-y-2">
               <div className="text-sm text-gray-500">Balance</div>
               <div className="text-xl">${formatCurrency(viewingCard.balance)}</div>
             </div>
             {viewingCard.expirationDate && (
               <div className="space-y-2">
                 <div className="text-sm text-gray-500">Expires</div>
                 <div>{formatDisplayDate(viewingCard.expirationDate)}</div>
               </div>
             )}
             <div className="space-y-2">
               <div className="text-sm text-gray-500">
                 {viewingCard.status === 'active' ? 'Added' : 'Marked Spent'}
               </div>
               <div>
                 {viewingCard.status === 'active'
                   ? formatDate(viewingCard.dateAdded)
                   : formatDate(viewingCard.dateSpent!)
                 }
               </div>
             </div>
           </div>
         )}
       </DialogContent>
     </Dialog>
   </div>
 );
}