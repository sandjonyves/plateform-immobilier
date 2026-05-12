import { create } from 'zustand';
import { utilisateursMock, type UtilisateurPlain } from '../../infrastructure/mock-data/utilisateurs.mock';

interface UtilisateurStore { utilisateurs: UtilisateurPlain[]; charger: () => Promise<void>; }
export const useUtilisateurStore = create<UtilisateurStore>((set) => ({
  utilisateurs: [],
  charger: async () => set({ utilisateurs: utilisateursMock }),
}));
