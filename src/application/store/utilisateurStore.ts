import { create } from 'zustand';
import { utilisateursMock, type UtilisateurPlain } from '../../infrastructure/mock-data/utilisateurs.mock';

export interface NouvelUtilisateurInput {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: 'admin' | 'agent' | 'client';
  statut: 'actif' | 'suspendu';
}

let store: UtilisateurPlain[] = [...utilisateursMock];

interface UtilisateurStore {
  utilisateurs: UtilisateurPlain[];
  charger: () => Promise<void>;
  ajouter: (input: NouvelUtilisateurInput) => Promise<void>;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useUtilisateurStore = create<UtilisateurStore>((set) => ({
  utilisateurs: [],
  charger: async () => set({ utilisateurs: store }),
  ajouter: async (input) => {
    if (!input.prenom.trim() || !input.nom.trim()) throw new Error('Nom et prénom obligatoires.');
    if (!emailRegex.test(input.email)) throw new Error('Email invalide.');
    if (store.some(u => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error('Cet email existe déjà.');
    }
    const u: UtilisateurPlain = {
      id: input.role + '-' + Date.now(),
      ...input,
      date_inscription: new Date().toISOString(),
      derniere_connexion: new Date().toISOString(),
    };
    store = [u, ...store];
    set({ utilisateurs: store });
  },
}));
