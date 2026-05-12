import { create } from 'zustand';
import { Terrain } from '../../domains/terrain/entities/Terrain';
import { ListerTerrains } from '../../domains/terrain/use-cases/ListerTerrains';
import { InMemoryTerrainRepository } from '../../infrastructure/repositories/InMemoryTerrainRepository';

const repo = new InMemoryTerrainRepository();
const lister = new ListerTerrains(repo);

type TerrainPlain = ReturnType<Terrain['toPlainObject']>;

interface TerrainStore {
  terrains: TerrainPlain[];
  loading: boolean;
  error: string | null;
  charger: () => Promise<void>;
}

export const useTerrainStore = create<TerrainStore>((set) => ({
  terrains: [], loading: false, error: null,
  charger: async () => {
    set({ loading: true, error: null });
    try {
      const terrains = await lister.execute();
      set({ terrains: terrains.map(t => t.toPlainObject()), loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
}));
