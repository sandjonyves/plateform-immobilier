import { create } from 'zustand';
import { Terrain } from '../../domains/terrain/entities/Terrain';
import { Borne } from '../../domains/terrain/value-objects/Borne';
import { StatutTerrain } from '../../domains/terrain/value-objects/StatutTerrain';
import { ListerTerrains } from '../../domains/terrain/use-cases/ListerTerrains';
import { AjouterTerrain } from '../../domains/terrain/use-cases/AjouterTerrain';
import { InMemoryTerrainRepository } from '../../infrastructure/repositories/InMemoryTerrainRepository';

const repo = new InMemoryTerrainRepository();
const lister = new ListerTerrains(repo);
const ajouter = new AjouterTerrain(repo);

type TerrainPlain = ReturnType<Terrain['toPlainObject']>;

export interface NouveauTerrainInput {
  titre: string;
  bornes: { latitude: number; longitude: number }[];
  statut: StatutTerrain;
  prix: number;
  ville: string;
  quartier: string;
  description: string;
  titre_foncier: string;
}

interface TerrainStore {
  terrains: TerrainPlain[];
  loading: boolean;
  error: string | null;
  charger: () => Promise<void>;
  ajouter: (input: NouveauTerrainInput) => Promise<void>;
}

export const useTerrainStore = create<TerrainStore>((set, get) => ({
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
  ajouter: async (input) => {
    const terrain = Terrain.creer({
      id: 't' + Date.now(),
      titre: input.titre,
      bornes: input.bornes.map(b => new Borne(b.latitude, b.longitude)),
      statut: input.statut,
      prix: input.prix,
      ville: input.ville,
      quartier: input.quartier,
      description: input.description,
      titre_foncier: input.titre_foncier,
      agent_id: 'agent-1',
      photos: [],
      documents: [],
    });
    await ajouter.execute(terrain);
    await get().charger();
  },
}));
