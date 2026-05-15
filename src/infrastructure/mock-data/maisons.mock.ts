export type StatutMaison = 'disponible' | 'loue' | 'vendu' | 'en_travaux' | 'archive';
export type TypeMaison = 'villa' | 'appartement' | 'duplex' | 'studio' | 'bureau';

export interface MaisonPlain {
  id: string; titre: string; type: TypeMaison; statut: StatutMaison;
  prix: number; ville: string; quartier: string; description: string;
  surface_m2: number; surface_terrain_m2?: number;
  chambres: number; salles_de_bain: number; etages: number;
  localisation: { latitude: number; longitude: number };
  titre_foncier?: string; date_ajout: string;
  photos: string[]; videos: string[]; documents: string[]; agent_id: string;
}

const m = (id: string, titre: string, type: TypeMaison, statut: StatutMaison, ville: string,
  quartier: string, prix: number, ch: number, sdb: number, surf: number, jours: number, lat: number, lng: number): MaisonPlain => ({
  id, titre, type, statut, ville, quartier, prix, chambres: ch, salles_de_bain: sdb,
  surface_m2: surf, etages: 1, description: `${type} à ${quartier}.`,
  localisation: { latitude: lat, longitude: lng },
  date_ajout: new Date(Date.now() - jours * 86400000).toISOString(),
  photos: [], documents: [], agent_id: 'agent-1',
});

export const maisonsMock: MaisonPlain[] = [
  m('m1', 'Villa moderne Bastos', 'villa', 'disponible', 'Yaoundé', 'Bastos', 350_000_000, 5, 4, 420, 1, 3.889, 11.517),
  m('m2', 'Appartement Nlongkak', 'appartement', 'loue', 'Yaoundé', 'Nlongkak', 450_000, 3, 2, 110, 4, 3.877, 11.518),
  m('m3', 'Duplex Bonapriso', 'duplex', 'disponible', 'Douala', 'Bonapriso', 180_000_000, 4, 3, 280, 6, 4.041, 9.709),
  m('m4', 'Studio Akwa', 'studio', 'disponible', 'Douala', 'Akwa', 250_000, 1, 1, 38, 9, 4.051, 9.719),
  m('m5', 'Bureau centre-ville', 'bureau', 'en_travaux', 'Yaoundé', 'Centre', 95_000_000, 0, 2, 220, 14, 3.866, 11.516),
  m('m6', 'Villa Bafoussam', 'villa', 'vendu', 'Bafoussam', 'Centre', 75_000_000, 4, 3, 310, 22, 5.478, 10.417),
];
