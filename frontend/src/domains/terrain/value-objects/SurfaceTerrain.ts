import { Borne } from './Borne';

export class SurfaceTerrain {
  private constructor(public readonly valeur: number) {}
  static calculerDepuisBornes(bornes: Borne[]): SurfaceTerrain {
    const R = 6371000;
    let area = 0;
    const n = bornes.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const xi = bornes[i].longitude * Math.PI / 180 * Math.cos(bornes[i].latitude * Math.PI / 180) * R;
      const yi = bornes[i].latitude * Math.PI / 180 * R;
      const xj = bornes[j].longitude * Math.PI / 180 * Math.cos(bornes[j].latitude * Math.PI / 180) * R;
      const yj = bornes[j].latitude * Math.PI / 180 * R;
      area += xi * yj - xj * yi;
    }
    return new SurfaceTerrain(Math.round(Math.abs(area / 2)));
  }
}
