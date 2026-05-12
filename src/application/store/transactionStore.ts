import { create } from 'zustand';
import { transactionsMock, type TransactionPlain } from '../../infrastructure/mock-data/transactions.mock';

interface TransactionStore { transactions: TransactionPlain[]; charger: () => Promise<void>; }
export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  charger: async () => set({ transactions: transactionsMock }),
}));
