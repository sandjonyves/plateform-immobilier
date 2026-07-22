import { Terrain } from '../entities/Terrain';
export interface ITerrainRepository {
  findAll(): Promise<Terrain[]>;
  findById(id: string): Promise<Terrain | null>;
  save(terrain: Terrain): Promise<void>;
  delete(id: string): Promise<void>;
}
