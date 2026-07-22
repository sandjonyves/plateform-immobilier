export interface VentePlain {
  id: string; type: 'vente';
  bien_id: string; bien_type: 'terrain' | 'maison';
  client_id: string; agent_id: string;
  montant: number; statut: 'en_attente' | 'confirmee' | 'annulee';
  date_vente: string; documents: string[];
}

const v = (id: string, type: VentePlain['type'], bien_id: string, bien_type: VentePlain['bien_type'],
  client_id: string, agent_id: string, montant: number, statut: VentePlain['statut'], jours: number): VentePlain => ({
  id, type, bien_id, bien_type, client_id, agent_id, montant, statut,
  date_vente: new Date(Date.now() - jours * 86400000).toISOString(), documents: [],
});

export const ventesMock: VentePlain[] = [
  v('tx1', 'vente', 't4', 'terrain', 'client-1', 'agent-1', 120_000_000, 'confirmee', 3),
  v('tx2', 'vente', 'm6', 'maison', 'client-2', 'agent-2', 75_000_000, 'confirmee', 8),
  v('tx3', 'vente', 'm2', 'maison', 'client-4', 'agent-3', 145_000_000, 'confirmee', 12),
  v('tx4', 'vente', 't2', 'terrain', 'client-1', 'agent-1', 42_000_000, 'en_attente', 1),
  v('tx5', 'vente', 't1', 'terrain', 'client-2', 'agent-2', 85_000_000, 'en_attente', 2),
  v('tx6', 'vente', 'm4', 'maison', 'client-4', 'agent-3', 95_000_000, 'en_attente', 0),
  v('tx7', 'vente', 'm3', 'maison', 'client-1', 'agent-1', 180_000_000, 'annulee', 25),
];
