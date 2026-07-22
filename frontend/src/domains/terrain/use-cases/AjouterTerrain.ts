import { ITerrainRepository } from '../repositories/ITerrainRepository';
import { Terrain } from '../entities/Terrain';
export class AjouterTerrain {
  constructor(private readonly repo: ITerrainRepository) {}
  async execute(terrain: Terrain): Promise<void> { await this.repo.save(terrain); }
}
