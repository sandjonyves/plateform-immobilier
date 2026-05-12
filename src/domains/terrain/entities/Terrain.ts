import { Borne } from '../value-objects/Borne';
import { SurfaceTerrain } from '../value-objects/SurfaceTerrain';
import { StatutTerrain } from '../value-objects/StatutTerrain';
import { DomainError } from '../../shared/errors/DomainError';

export interface TerrainPlain {
  id: string; titre: string;
  bornes: { latitude: number; longitude: number }[];
  surface_m2: number; statut: StatutTerrain; prix: number;
  ville: string; quartier: string; description: string;
  titre_foncier: string; agent_id: string;
  photos: string[]; documents: string[]; date_ajout: string;
}

export class Terrain {
  private constructor(
    public readonly id: string,
    public readonly titre: string,
    public readonly bornes: Borne[],
    public readonly surface_m2: SurfaceTerrain,
    public readonly statut: StatutTerrain,
    public readonly prix: number,
    public readonly ville: string,
    public readonly quartier: string,
    public readonly description: string,
    public readonly titre_foncier: string,
    public readonly agent_id: string,
    public readonly photos: string[],
    public readonly documents: string[],
    public readonly date_ajout: string,
  ) {}

  static creer(p: {
    id: string; titre: string; bornes: Borne[]; statut: StatutTerrain; prix: number;
    ville: string; quartier: string; description: string; titre_foncier: string;
    agent_id: string; photos: string[]; documents: string[]; date_ajout?: string;
  }): Terrain {
    if (p.bornes.length < 3) throw new DomainError('Un terrain doit avoir au minimum 3 bornes GPS.');
    if (p.prix <= 0) throw new DomainError('Le prix doit être positif.');
    if (!p.titre.trim()) throw new DomainError('Le titre est obligatoire.');
    const surface = SurfaceTerrain.calculerDepuisBornes(p.bornes);
    return new Terrain(p.id, p.titre, p.bornes, surface, p.statut, p.prix, p.ville,
      p.quartier, p.description, p.titre_foncier, p.agent_id, p.photos, p.documents,
      p.date_ajout ?? new Date().toISOString());
  }

  archiver(): Terrain {
    if (this.statut === StatutTerrain.ARCHIVE) throw new DomainError('Déjà archivé.');
    return new Terrain(this.id, this.titre, this.bornes, this.surface_m2, StatutTerrain.ARCHIVE,
      this.prix, this.ville, this.quartier, this.description, this.titre_foncier,
      this.agent_id, this.photos, this.documents, this.date_ajout);
  }

  toPlainObject(): TerrainPlain {
    return {
      id: this.id, titre: this.titre,
      bornes: this.bornes.map(b => b.toPlainObject()),
      surface_m2: this.surface_m2.valeur, statut: this.statut, prix: this.prix,
      ville: this.ville, quartier: this.quartier, description: this.description,
      titre_foncier: this.titre_foncier, agent_id: this.agent_id,
      photos: this.photos, documents: this.documents, date_ajout: this.date_ajout,
    };
  }
}
