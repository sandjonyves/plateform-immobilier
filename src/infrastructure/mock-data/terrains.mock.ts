import { Terrain } from '../../domains/terrain/entities/Terrain';
import { Borne } from '../../domains/terrain/value-objects/Borne';
import { StatutTerrain } from '../../domains/terrain/value-objects/StatutTerrain';

const make = (id: string, titre: string, ville: string, quartier: string, prix: number,
  statut: StatutTerrain, lat: number, lng: number, jours: number): Terrain => {
  const bornes = [
    new Borne(lat, lng),
    new Borne(lat + 0.0008, lng + 0.0009),
    new Borne(lat + 0.0002, lng + 0.0015),
    new Borne(lat - 0.0006, lng + 0.0008),
  ];
  return Terrain.creer({
    id, titre, bornes, statut, prix, ville, quartier,
    description: `Terrain bien situé à ${quartier}, ${ville}.`,
    titre_foncier: `TF-${id}-2024`, agent_id: 'agent-1',
    photos: [], documents: [],
    date_ajout: new Date(Date.now() - jours * 86400000).toISOString(),
  });
};

export const terrainsMock: Terrain[] = [
  make('t1', 'Terrain Bastos Nord', 'Yaoundé', 'Bastos', 85_000_000, StatutTerrain.DISPONIBLE, 3.8895, 11.5174, 2),
  make('t2', 'Parcelle Nlongkak', 'Yaoundé', 'Nlongkak', 42_000_000, StatutTerrain.EN_NEGOCIATION, 3.8770, 11.5180, 5),
  make('t3', 'Terrain Melen Vue', 'Yaoundé', 'Melen', 28_500_000, StatutTerrain.DISPONIBLE, 3.8550, 11.4950, 8),
  make('t4', 'Lot Bonapriso', 'Douala', 'Bonapriso', 120_000_000, StatutTerrain.VENDU, 4.0411, 9.7090, 12),
  make('t5', 'Parcelle Akwa', 'Douala', 'Akwa', 65_000_000, StatutTerrain.DISPONIBLE, 4.0511, 9.7194, 16),
  make('t6', 'Terrain Bafoussam Centre', 'Bafoussam', 'Centre', 18_000_000, StatutTerrain.DISPONIBLE, 5.4781, 10.4167, 21),
  make('t7', 'Lot Odza', 'Yaoundé', 'Odza', 22_000_000, StatutTerrain.ARCHIVE, 3.8210, 11.5300, 40),
];
