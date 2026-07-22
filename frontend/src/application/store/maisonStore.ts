import { create } from 'zustand';
import {
  type MaisonPlain,
  type StatutMaison,
  type TypeMaison,
} from '../../infrastructure/mock-data/maisons.mock';
import { createMaisonApi, fetchMaisons, archiverMaisonApi } from '../../infrastructure/api/resources';

export interface NouvelleMaisonInput {
  titre: string;
  type: TypeMaison;
  statut: StatutMaison;
  prix: number;
  ville_id: string;
  quartier: string;
  description: string;
  surface_m2: number;
  chambres: number;
  salles_de_bain: number;
  etages: number;
  latitude: number;
  longitude: number;
  titre_foncier?: string;
  photos: string[];
  videos: string[];
}

interface MaisonStore {
  maisons: MaisonPlain[];
  loading: boolean;
  error: string | null;
  charger: () => Promise<void>;
  ajouter: (input: NouvelleMaisonInput) => Promise<void>;
  archiver: (id: string) => Promise<void>;
}

export const useMaisonStore = create<MaisonStore>((set, get) => ({
  maisons: [],
  loading: false,
  error: null,
  charger: async () => {
    set({ loading: true, error: null });
    try {
      const maisons = await fetchMaisons();
      set({ maisons, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  ajouter: async (input) => {
    if (input.prix <= 0) throw new Error('Le prix doit être positif.');
    if (input.surface_m2 <= 0) throw new Error('La surface doit être positive.');
    if (!input.titre.trim()) throw new Error('Le titre est obligatoire.');
    await createMaisonApi(input);
    await get().charger();
  },
  archiver: async (id) => {
    await archiverMaisonApi(id);
    await get().charger();
  },
}));
