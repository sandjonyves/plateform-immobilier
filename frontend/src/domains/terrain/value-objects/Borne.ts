export class Borne {
  constructor(public readonly latitude: number, public readonly longitude: number) {
    if (latitude < -90 || latitude > 90) throw new Error('Latitude invalide.');
    if (longitude < -180 || longitude > 180) throw new Error('Longitude invalide.');
  }
  toPlainObject() { return { latitude: this.latitude, longitude: this.longitude }; }
}
