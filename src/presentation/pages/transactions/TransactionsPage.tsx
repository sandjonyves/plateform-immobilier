import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Receipt, ArrowUpRight, ArrowDownRight, FileDown } from 'lucide-react';
import { format } from 'date-fns';
import { useTransactionStore } from '../../../application/store/transactionStore';
import { useUtilisateurStore } from '../../../application/store/utilisateurStore';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { KpiCard } from '../../components/shared/KpiCard';
import { TransactionForm } from '../../components/forms/TransactionForm';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

export function TransactionsPage() {
  const { transactions, charger } = useTransactionStore();
  const { utilisateurs, charger: chargerU } = useUtilisateurStore();
  const [q, setQ] = useState('');
  const [type, setType] = useState('tous');
  const [statut, setStatut] = useState('tous');
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => { charger(); chargerU(); }, [charger, chargerU]);

  const userMap = useMemo(() => new Map(utilisateurs.map(u => [u.id, `${u.prenom} ${u.nom}`])), [utilisateurs]);

  const filtered = useMemo(() => transactions.filter(t =>
    (type === 'tous' || t.type === type) &&
    (statut === 'tous' || t.statut === statut) &&
    (q === '' || t.id.toLowerCase().includes(q.toLowerCase()) || t.bien_id.toLowerCase().includes(q.toLowerCase())),
  ), [transactions, q, type, statut]);

  const kpi = useMemo(() => {
    const conf = transactions.filter(t => t.statut === 'confirmee');
    return {
      total: transactions.length,
      ventes: conf.filter(t => t.type === 'vente').reduce((s, t) => s + t.montant, 0),
      locations: conf.filter(t => t.type === 'location').reduce((s, t) => s + t.montant, 0),
      attente: transactions.filter(t => t.statut === 'en_attente').length,
    };
  }, [transactions]);

  return (
    <>
    <div className="space-y-6">
      <PageHeader
        titre="Transactions"
        sous_titre="Suivi des ventes et locations"
        actions={
          <>
            <button className="h-9 px-3 text-sm font-medium rounded-lg border border-border bg-card hover:bg-secondary flex items-center gap-1.5">
              <FileDown size={15} /> Exporter
            </button>
            <button onClick={() => setOpenForm(true)} className="h-9 px-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5">
              <Plus size={15} /> Nouvelle transaction
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Transactions" value={kpi.total.toString()} delta={4.6} accent="primary" />
        <KpiCard label="Ventes confirmées" value={xaf(kpi.ventes)} delta={12.5} accent="success" />
        <KpiCard label="Loyers confirmés" value={xaf(kpi.locations)} delta={3.8} accent="info" />
        <KpiCard label="En attente" value={kpi.attente.toString()} delta={-1.4} accent="warning" />
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par référence…"
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40" />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 px-3 text-sm rounded-lg border border-border bg-background">
            <option value="tous">Tous types</option>
            <option value="vente">Ventes</option>
            <option value="location">Locations</option>
          </select>
          <select value={statut} onChange={(e) => setStatut(e.target.value)} className="h-9 px-3 text-sm rounded-lg border border-border bg-background">
            <option value="tous">Tous statuts</option>
            <option value="en_attente">En attente</option>
            <option value="confirmee">Confirmée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left font-medium px-4 py-3">Référence</th>
                <th className="text-left font-medium px-4 py-3">Type</th>
                <th className="text-left font-medium px-4 py-3">Bien</th>
                <th className="text-left font-medium px-4 py-3">Client</th>
                <th className="text-left font-medium px-4 py-3">Agent</th>
                <th className="text-right font-medium px-4 py-3">Montant</th>
                <th className="text-left font-medium px-4 py-3">Statut</th>
                <th className="text-left font-medium px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs">{t.id.toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${
                      t.type === 'vente' ? 'bg-success/10 text-success border-success/20' : 'bg-info/10 text-info border-info/20'
                    }`}>
                      {t.type === 'vente' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {t.type === 'vente' ? 'Vente' : 'Location'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Receipt size={14} className="text-muted-foreground" />
                      <div>
                        <div className="text-xs">{t.bien_type === 'terrain' ? 'Terrain' : 'Maison'}</div>
                        <div className="text-xs text-muted-foreground font-mono">{t.bien_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{userMap.get(t.client_id) ?? t.client_id}</td>
                  <td className="px-4 py-3 text-xs">{userMap.get(t.agent_id) ?? t.agent_id}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{xaf(t.montant)}</td>
                  <td className="px-4 py-3"><StatusBadge statut={t.statut} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(t.date_transaction), 'dd/MM/yyyy')}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">Aucune transaction.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <TransactionForm open={openForm} onClose={() => setOpenForm(false)} />
    </>
  );
}
