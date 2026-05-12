export interface TransactionPlain {
  id: string; type: 'vente' | 'location';
  bien_id: string; bien_type: 'terrain' | 'maison';
  client_id: string; agent_id: string;
  montant: number; statut: 'en_attente' | 'confirmee' | 'annulee';
  date_transaction: string; documents: string[];
}

const tr = (id: string, type: TransactionPlain['type'], bien_id: string, bien_type: TransactionPlain['bien_type'],
  client_id: string, agent_id: string, montant: number, statut: TransactionPlain['statut'], jours: number): TransactionPlain => ({
  id, type, bien_id, bien_type, client_id, agent_id, montant, statut,
  date_transaction: new Date(Date.now() - jours * 86400000).toISOString(), documents: [],
});

export const transactionsMock: TransactionPlain[] = [
  tr('tx1', 'vente', 't4', 'terrain', 'client-1', 'agent-1', 120_000_000, 'confirmee', 3),
  tr('tx2', 'vente', 'm6', 'maison', 'client-2', 'agent-2', 75_000_000, 'confirmee', 8),
  tr('tx3', 'location', 'm2', 'maison', 'client-4', 'agent-3', 450_000, 'confirmee', 12),
  tr('tx4', 'vente', 't2', 'terrain', 'client-1', 'agent-1', 42_000_000, 'en_attente', 1),
  tr('tx5', 'vente', 't1', 'terrain', 'client-2', 'agent-2', 85_000_000, 'en_attente', 2),
  tr('tx6', 'location', 'm4', 'maison', 'client-4', 'agent-3', 250_000, 'en_attente', 0),
  tr('tx7', 'vente', 'm3', 'maison', 'client-1', 'agent-1', 180_000_000, 'annulee', 25),
];
