import { create } from 'zustand';
import { createEvenementApi, fetchEvenements } from '../../infrastructure/api/resources';

export type TypeEvenement = 'visite' | 'signature' | 'reunion';

export interface Evenement {
  id: string;
  titre: string;
  type: TypeEvenement;
  date: string;
  heure: string;
  lieu: string;
  participants: string[];
}

export interface NouvelEvenementInput {
  titre: string;
  type: TypeEvenement;
  date: string;
  heure: string;
  lieu: string;
  participants: string;
}

interface AgendaStore {
  evenements: Evenement[];
  loading: boolean;
  error: string | null;
  charger: () => Promise<void>;
  ajouter: (input: NouvelEvenementInput) => Promise<void>;
}

export const useAgendaStore = create<AgendaStore>((set, get) => ({
  evenements: [],
  loading: false,
  error: null,
  charger: async () => {
    set({ loading: true, error: null });
    try {
      const evenements = await fetchEvenements();
      set({ evenements, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  ajouter: async (input) => {
    if (!input.titre.trim()) throw new Error('Le titre est obligatoire.');
    if (!input.date) throw new Error('La date est obligatoire.');
    if (!input.heure) throw new Error("L'heure est obligatoire.");
    await createEvenementApi(input);
    await get().charger();
  },
}));
