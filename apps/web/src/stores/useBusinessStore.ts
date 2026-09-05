import { create } from 'zustand';
import type { Business, BusinessMember } from '@autoagent/shared';

interface BusinessState {
  activeBusiness: Business | null;
  businesses: Business[];
  members: BusinessMember[];
  isLoading: boolean;
  setActiveBusiness: (business: Business) => void;
  setBusinesses: (businesses: Business[]) => void;
  setMembers: (members: BusinessMember[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  /** Format monetary values using active business currency (ISO 4217) */
  formatCurrency: (amount: number) => string;
}

export const useBusinessStore = create<BusinessState>((set, get) => ({
  activeBusiness: null,
  businesses: [],
  members: [],
  isLoading: false,

  setActiveBusiness: (business) => set({ activeBusiness: business }),
  setBusinesses: (businesses) => {
    set({ businesses });
    const currentActive = get().activeBusiness;
    const firstBusiness = businesses[0];
    if (!currentActive && firstBusiness) {
      set({ activeBusiness: firstBusiness });
    }
  },
  setMembers: (members) => set({ members }),
  setIsLoading: (isLoading) => set({ isLoading }),

  formatCurrency: (amount: number) => {
    const active = get().activeBusiness;
    const currency = active?.currency ?? 'NGN';

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  },
}));
