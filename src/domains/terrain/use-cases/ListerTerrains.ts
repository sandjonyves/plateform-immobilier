import { ITerrainRepository } from '../repositories/ITerrainRepository';
import { Terrain } from '../entities/Terrain';
export class ListerTerrains {
  constructor(private readonly repo: ITerrainRepository) {}
  async execute(): Promise<Terrain[]> { return this.repo.findAll(); }
}
