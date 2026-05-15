import { create } from 'zustand';

export type TypeEvenement = 'visite' | 'signature' | 'reunion';

export interface Evenement {
  id: string;
  titre: string;
  type: TypeEvenement;
  date: string; // ISO yyyy-MM-dd
  heure: string; // HH:mm
  lieu: string;
  participants: string[];
}

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);

let store: Evenement[] = [
  { id: 'e1', titre: 'Visite Villa Bastos', type: 'visite', date: iso(today), heure: '10:00', lieu: 'Bastos, Yaoundé', participants: ['Marie N.', 'A. Bello'] },
  { id: 'e2', titre: 'Signature Lot Bonapriso', type: 'signature', date: iso(today), heure: '14:30', lieu: 'Cabinet notaire, Douala', participants: ['Paul M.', 'E. Fotso'] },
  { id: 'e3', titre: 'Réunion équipe agents', type: 'reunion', date: iso(new Date(today.getTime() + 86400000)), heure: '09:00', lieu: 'Bureau principal', participants: ['Jean T.', 'Marie N.'] },
  { id: 'e4', titre: 'Visite Duplex Bonapriso', type: 'visite', date: iso(new Date(today.getTime() + 2 * 86400000)), heure: '11:00', lieu: 'Bonapriso, Douala', participants: ['Sophie E.'] },
  { id: 'e5', titre: 'Signature Parcelle Akwa', type: 'signature', date: iso(new Date(today.getTime() + 4 * 86400000)), heure: '15:00', lieu: 'Akwa, Douala', participants: ['Paul M.'] },
];

export interface NouvelEvenementInput {
  titre: string;
  type: TypeEvenement;
  date: string;
  heure: string;
  lieu: string;
  participants: string;
}

interface AgendaStore {
  evenements: Evenement[];
  charger: () => Promise<void>;
  ajouter: (input: NouvelEvenementInput) => Promise<void>;
}

export const useAgendaStore = create<AgendaStore>((set) => ({
  evenements: [],
  charger: async () => set({ evenements: store }),
  ajouter: async (input) => {
    if (!input.titre.trim()) throw new Error('Le titre est obligatoire.');
    if (!input.date) throw new Error('La date est obligatoire.');
    if (!input.heure) throw new Error("L'heure est obligatoire.");
    const e: Evenement = {
      id: 'e' + Date.now(),
      titre: input.titre,
      type: input.type,
      date: input.date,
      heure: input.heure,
      lieu: input.lieu,
      participants: input.participants.split(',').map(s => s.trim()).filter(Boolean),
    };
    store = [...store, e];
    set({ evenements: store });
  },
}));
