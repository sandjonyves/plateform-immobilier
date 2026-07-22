import { create } from 'zustand';
import type { VentePlain } from '../../infrastructure/mock-data/ventes.mock';
import { createVenteApi, fetchVentes } from '../../infrastructure/api/resources';

export interface NouvelleVenteInput {
  type: 'vente';
  bien_id: string;
  bien_type: 'terrain' | 'maison';
  client_id: string;
  agent_id: string;
  montant: number;
  statut: 'en_attente' | 'confirmee' | 'annulee';
}

interface VenteStore {
  ventes: VentePlain[];
  loading: boolean;
  error: string | null;
  charger: () => Promise<void>;
  ajouter: (input: NouvelleVenteInput) => Promise<void>;
}

export const useVenteStore = create<VenteStore>((set, get) => ({
  ventes: [],
  loading: false,
  error: null,
  charger: async () => {
    set({ loading: true, error: null });
    try {
      const ventes = await fetchVentes();
      set({ ventes, loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  ajouter: async (input) => {
    if (input.montant <= 0) throw new Error('Le montant doit être positif.');
    await createVenteApi({
      type: input.type,
      bien_id: input.bien_id,
      bien_type: input.bien_type,
      client_id: input.client_id,
      montant: input.montant,
      statut: input.statut,
    });
    await get().charger();
  },
}));
