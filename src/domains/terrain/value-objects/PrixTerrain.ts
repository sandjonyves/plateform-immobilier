import { DomainError } from '../../shared/errors/DomainError';

export class PrixTerrain {
  private constructor(public readonly valeur: number) {}
  static creer(valeur: number): PrixTerrain {
    if (!Number.isFinite(valeur) || valeur <= 0) throw new DomainError('Le prix doit être positif.');
    return new PrixTerrain(Math.round(valeur));
  }
}
