// src/lib/credit-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CreditUsage {
  date: Date;
  amount: number;
  merchant?: string;
}

interface Credit {
  id: string;
  cardId: string;
  name: string;
  amount: number;
  frequency: 'annual' | 'monthly' | 'semi-annual';
  currentBalance: number;
  nextRefresh: Date;
  usageHistory: CreditUsage[];
}

interface CreditStore {
  credits: Record<string, Credit>;
  addCredit: (credit: Credit) => void;
  recordUsage: (creditId: string, usage: CreditUsage) => void;
  refreshCredit: (creditId: string) => void;
  getCreditsForCard: (cardId: string) => Credit[];
}

export const useCreditStore = create<CreditStore>()(
  persist(
    (set, get) => ({
      credits: {},
      
      addCredit: (credit) => {
        set((state) => ({
          credits: {
            ...state.credits,
            [credit.id]: credit
          }
        }));
      },
      
      recordUsage: (creditId, usage) => {
        set((state) => {
          const credit = state.credits[creditId];
          if (!credit) return state;

          const newBalance = credit.currentBalance - usage.amount;
          if (newBalance < 0) return state; // Prevent negative balance

          return {
            credits: {
              ...state.credits,
              [creditId]: {
                ...credit,
                currentBalance: newBalance,
                usageHistory: [usage, ...credit.usageHistory]
              }
            }
          };
        });
      },
      
      refreshCredit: (creditId) => {
        set((state) => {
          const credit = state.credits[creditId];
          if (!credit) return state;

          const now = new Date();
          let nextRefresh: Date;

          switch (credit.frequency) {
            case 'monthly':
              nextRefresh = new Date(now);
              nextRefresh.setMonth(nextRefresh.getMonth() + 1);
              break;
            case 'semi-annual':
              nextRefresh = new Date(now);
              nextRefresh.setMonth(nextRefresh.getMonth() + 6);
              break;
            case 'annual':
              nextRefresh = new Date(now);
              nextRefresh.setFullYear(nextRefresh.getFullYear() + 1);
              break;
          }

          return {
            credits: {
              ...state.credits,
              [creditId]: {
                ...credit,
                currentBalance: credit.amount,
                nextRefresh
              }
            }
          };
        });
      },
      
      getCreditsForCard: (cardId) => {
        const allCredits = Object.values(get().credits);
        return allCredits.filter(credit => credit.cardId === cardId);
      }
    }),
    {
      name: 'credit-storage'
    }
  )
);

// Helper functions for credit management
export const checkCreditRefresh = () => {
  const store = useCreditStore.getState();
  const now = new Date();
  
  Object.values(store.credits).forEach(credit => {
    if (new Date(credit.nextRefresh) <= now) {
      store.refreshCredit(credit.id);
    }
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};