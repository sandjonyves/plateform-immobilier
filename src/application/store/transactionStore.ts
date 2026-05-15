import { create } from 'zustand';
import { transactionsMock, type TransactionPlain } from '../../infrastructure/mock-data/transactions.mock';

export interface NouvelleTransactionInput {
  type: 'vente' | 'location';
  bien_id: string;
  bien_type: 'terrain' | 'maison';
  client_id: string;
  agent_id: string;
  montant: number;
  statut: 'en_attente' | 'confirmee' | 'annulee';
}

let store: TransactionPlain[] = [...transactionsMock];

interface TransactionStore {
  transactions: TransactionPlain[];
  charger: () => Promise<void>;
  ajouter: (input: NouvelleTransactionInput) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  charger: async () => set({ transactions: store }),
  ajouter: async (input) => {
    if (input.montant <= 0) throw new Error('Le montant doit être positif.');
    const t: TransactionPlain = {
      id: 'tx' + Date.now(),
      ...input,
      date_transaction: new Date().toISOString(),
      documents: [],
    };
    store = [t, ...store];
    set({ transactions: store });
  },
}));
