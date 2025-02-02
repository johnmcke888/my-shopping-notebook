// src/types/cards.ts

export type CardType = 'personal' | 'business';
export type CreditFrequency = 'annual' | 'semi-annual' | 'monthly';

export interface CardCredit {
  name: string;
  amount: number;
  frequency: CreditFrequency;
  used?: number;
  lastUsed?: Date;
  details?: string;
}

export interface AnnualBenefit {
  type: 'free_night' | 'points' | 'companion_fare' | 'pqp_boost';
  description: string;
  spendRequirement?: number;
  pointsAmount?: number;
}

export interface CreditCard {
  id: string;
  type: CardType;
  issuer: string;
  name: string;
  credits: CardCredit[];
  annualBenefits: AnnualBenefit[];
  annualFee?: number;
  nextFeeDate?: Date;
}

// Example of the data structure:
export interface UserCard extends CreditCard {
  dateAdded: Date;
  creditTracking: {
    creditId: string;
    usageHistory: {
      date: Date;
      amount: number;
    }[];
  }[];
}