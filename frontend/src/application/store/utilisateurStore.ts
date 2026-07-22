import { create } from 'zustand';
import type { UtilisateurPlain } from '../../infrastructure/mock-data/utilisateurs.mock';
import { createUtilisateurApi, fetchUtilisateurs } from '../../infrastructure/api/resources';

export interface NouvelUtilisateurInput {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: 'admin' | 'agent' | 'client';
  statut: 'actif' | 'suspendu';
}

interface UtilisateurStore {
  utilisateurs: UtilisateurPlain[];
  loading: boolean;
  error: string | null;
  charger: () => Promise<void>;
  ajouter: (input: NouvelUtilisateurInput) => Promise<void>;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useUtilisateurStore = create<UtilisateurStore>((set, get) => ({
  utilisateurs: [],
  loading: false,
  error: null,
  charger: async () => {
    set({ loading: true, error: null });
    try {
      const utilisateurs = await fetchUtilisateurs();
      set({ utilisateurs, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  ajouter: async (input) => {
    if (!input.prenom.trim() || !input.nom.trim()) throw new Error('Nom et prénom obligatoires.');
    if (!emailRegex.test(input.email)) throw new Error('Email invalide.');
    // Backend : admin | client uniquement (agent → admin)
    const role = input.role === 'client' ? 'client' : 'admin';
    await createUtilisateurApi({
      prenom: input.prenom,
      nom: input.nom,
      email: input.email,
      telephone: input.telephone,
      role,
      statut: input.statut,
    });
    await get().charger();
  },
}));
