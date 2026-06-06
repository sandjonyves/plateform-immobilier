import coverTerrain from '@/assets/cover-terrain.jpg';
import coverVilla from '@/assets/cover-villa.jpg';
import coverAppartement from '@/assets/cover-appartement.jpg';
import coverDuplex from '@/assets/cover-duplex.jpg';
import coverStudio from '@/assets/cover-studio.jpg';
import coverBureau from '@/assets/cover-bureau.jpg';

/** Image générale représentant tous les terrains. */
export const TERRAIN_COVER = coverTerrain;

/** Image de couverture par type de maison. */
const MAISON_COVERS: Record<string, string> = {
  villa: coverVilla,
  appartement: coverAppartement,
  duplex: coverDuplex,
  studio: coverStudio,
  bureau: coverBureau,
};

export function maisonCover(type: string, photos?: string[]): string {
  if (photos && photos.length > 0) return photos[0];
  return MAISON_COVERS[type] ?? coverVilla;
}

export function terrainCover(photos?: string[]): string {
  if (photos && photos.length > 0) return photos[0];
  return TERRAIN_COVER;
}
