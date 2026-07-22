import { create } from 'zustand';
import { fetchVilles } from '../../infrastructure/api/resources';

export interface VilleOption {
  id: string;
  nom: string;
  region: string;
}

interface VilleStore {
  villes: VilleOption[];
  loading: boolean;
  charger: () => Promise<void>;
}

export const useVilleStore = create<VilleStore>((set, get) => ({
  villes: [],
  loading: false,
  charger: async () => {
    if (get().villes.length > 0) return;
    set({ loading: true });
    try {
      const villes = await fetchVilles();
      set({ villes, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
