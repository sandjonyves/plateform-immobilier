import { create } from 'zustand';
import type { Service } from '../../infrastructure/data/services';
import {
  createServiceApi,
  deleteServiceApi,
  fetchServices,
  fetchServicesAdmin,
  updateServiceApi,
  type ServiceDto,
} from '../../infrastructure/api/resources';

function toService(dto: ServiceDto): Service {
  return {
    id: dto.id,
    titre: dto.titre,
    slug: dto.slug,
    description: dto.description,
    details: dto.details,
    prixIndicatif: dto.prix_indicatif || undefined,
    icon: dto.icon,
    categorie: dto.categorie,
    ordre: dto.ordre,
    actif: dto.actif,
    phare: dto.phare,
  };
}

interface ServiceStore {
  services: Service[];
  loading: boolean;
  error: string | null;
  charger: (admin?: boolean) => Promise<void>;
  ajouter: (input: Parameters<typeof createServiceApi>[0]) => Promise<void>;
  modifier: (id: string, input: Parameters<typeof updateServiceApi>[1]) => Promise<void>;
  supprimer: (id: string) => Promise<void>;
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: [],
  loading: false,
  error: null,
  charger: async (admin = false) => {
    set({ loading: true, error: null });
    try {
      const rows = admin ? await fetchServicesAdmin() : await fetchServices();
      set({ services: rows.map(toService), loading: false });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },
  ajouter: async (input) => {
    await createServiceApi(input);
    await get().charger(true);
  },
  modifier: async (id, input) => {
    await updateServiceApi(id, input);
    await get().charger(true);
  },
  supprimer: async (id) => {
    await deleteServiceApi(id);
    await get().charger(true);
  },
}));
