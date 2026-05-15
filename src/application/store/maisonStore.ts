import { create } from 'zustand';
import { maisonsMock, type MaisonPlain, type StatutMaison, type TypeMaison } from '../../infrastructure/mock-data/maisons.mock';

export interface NouvelleMaisonInput {
  titre: string;
  type: TypeMaison;
  statut: StatutMaison;
  prix: number;
  ville: string;
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
  charger: () => Promise<void>;
  ajouter: (input: NouvelleMaisonInput) => Promise<void>;
}

let store: MaisonPlain[] = [...maisonsMock];

export const useMaisonStore = create<MaisonStore>((set) => ({
  maisons: [],
  charger: async () => set({ maisons: store }),
  ajouter: async (input) => {
    if (input.prix <= 0) throw new Error('Le prix doit être positif.');
    if (input.surface_m2 <= 0) throw new Error('La surface doit être positive.');
    if (!input.titre.trim()) throw new Error('Le titre est obligatoire.');
    const m: MaisonPlain = {
      id: 'm' + Date.now(),
      titre: input.titre,
      type: input.type,
      statut: input.statut,
      prix: input.prix,
      ville: input.ville,
      quartier: input.quartier,
      description: input.description,
      surface_m2: input.surface_m2,
      chambres: input.chambres,
      salles_de_bain: input.salles_de_bain,
      etages: input.etages,
      localisation: { latitude: input.latitude, longitude: input.longitude },
      titre_foncier: input.titre_foncier,
      date_ajout: new Date().toISOString(),
      photos: input.photos,
      videos: input.videos,
      documents: [],
      agent_id: 'agent-1',
    };
    store = [m, ...store];
    set({ maisons: store });
  },
}));
