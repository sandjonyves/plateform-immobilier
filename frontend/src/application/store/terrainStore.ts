import { create } from 'zustand';
import type { StatutTerrain } from '../../domains/terrain/value-objects/StatutTerrain';
import type { TerrainPlain } from '../../domains/terrain/entities/Terrain';
import { archiverTerrainApi, createTerrainApi, fetchTerrains } from '../../infrastructure/api/resources';

export interface NouveauTerrainInput {
  titre: string;
  bornes: { latitude: number; longitude: number }[];
  statut: StatutTerrain;
  prix: number;
  ville_id: string;
  quartier: string;
  description: string;
  titre_foncier: string;
  photos?: string[];
  videos?: string[];
}

interface TerrainStore {
  terrains: TerrainPlain[];
  loading: boolean;
  error: string | null;
  charger: () => Promise<void>;
  ajouter: (input: NouveauTerrainInput) => Promise<void>;
  archiver: (id: string) => Promise<void>;
}

export const useTerrainStore = create<TerrainStore>((set, get) => ({
  terrains: [],
  loading: false,
  error: null,
  charger: async () => {
    set({ loading: true, error: null });
    try {
      const terrains = await fetchTerrains();
      set({ terrains, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  ajouter: async (input) => {
    await createTerrainApi(input);
    await get().charger();
  },
  archiver: async (id) => {
    await archiverTerrainApi(id);
    await get().charger();
  },
}));
