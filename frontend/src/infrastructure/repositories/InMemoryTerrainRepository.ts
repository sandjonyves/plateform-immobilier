import { ITerrainRepository } from '../../domains/terrain/repositories/ITerrainRepository';
import { Terrain } from '../../domains/terrain/entities/Terrain';
import { terrainsMock } from '../mock-data/terrains.mock';

export class InMemoryTerrainRepository implements ITerrainRepository {
  private store = new Map<string, Terrain>(terrainsMock.map(t => [t.id, t]));
  async findAll() { return Array.from(this.store.values()); }
  async findById(id: string) { return this.store.get(id) ?? null; }
  async save(t: Terrain) { this.store.set(t.id, t); }
  async delete(id: string) { this.store.delete(id); }
}
