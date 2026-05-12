import { create } from 'zustand';
import { maisonsMock, type MaisonPlain } from '../../infrastructure/mock-data/maisons.mock';

interface MaisonStore { maisons: MaisonPlain[]; charger: () => Promise<void>; }
export const useMaisonStore = create<MaisonStore>((set) => ({
  maisons: [],
  charger: async () => set({ maisons: maisonsMock }),
}));
