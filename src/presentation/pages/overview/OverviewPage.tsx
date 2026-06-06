import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { MapPin, Plus, Home, BarChart3, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { useMaisonStore } from '../../../application/store/maisonStore';
import { useUtilisateurStore } from '../../../application/store/utilisateurStore';
import { useTransactionStore } from '../../../application/store/transactionStore';
import { KpiCard } from '../../components/shared/KpiCard';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { MaisonForm } from '../../components/forms/MaisonForm';
import { TerrainForm } from '../../components/forms/TerrainForm';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

function genSpark(seed: number, n = 14) {
  const out: number[] = [];
  let v = 50 + seed * 7;
  for (let i = 0; i < n; i++) { v += (Math.sin(i + seed) + Math.cos(i * 0.7)) * 4 + (i - n / 2) * 0.5; out.push(Math.max(10, v)); }
  return out;
}

function genActivity30(seed: number) {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return {
      jour: d.getDate() + '/' + (d.getMonth() + 1),
      annonces: Math.round(8 + Math.sin((i + seed) * 0.4) * 4 + Math.random() * 3),
      transactions: Math.round(3 + Math.cos((i + seed) * 0.3) * 2 + Math.random() * 2),
    };
  });
}

export function OverviewPage() {
  const { terrains, charger: chargerT } = useTerrainStore();
  const { maisons, charger: chargerM } = useMaisonStore();
  const { utilisateurs, charger: chargerU } = useUtilisateurStore();
  const { transactions, charger: chargerTr } = useTransactionStore();

  const navigate = useNavigate();
  const [openMaison, setOpenMaison] = useState(false);
  const [openTerrain, setOpenTerrain] = useState(false);

  useEffect(() => { chargerT(); chargerM(); chargerU(); chargerTr(); }, [chargerT, chargerM, chargerU, chargerTr]);

  const data30 = useMemo(() => genActivity30(3), []);

  const kpis = useMemo(() => {
    const biens = terrains.length + maisons.length;
    const moisCourant = new Date().getMonth();
    const revenus = transactions
      .filter(t => t.statut === 'confirmee' && new Date(t.date_transaction).getMonth() === moisCourant)
      .reduce((s, t) => s + t.montant, 0);
    const usersActifs = utilisateurs.filter(u => u.statut === 'actif').length;
    const enAttente = transactions.filter(t => t.statut === 'en_attente').length;
    return { biens, revenus, usersActifs, enAttente };
  }, [terrains, maisons, utilisateurs, transactions]);

  const repartition = useMemo(() => {
    const tDispo = terrains.filter(t => t.statut === 'disponible').length;
    const tNego = terrains.filter(t => t.statut === 'en_negociation').length;
    const tVendu = terrains.filter(t => t.statut === 'vendu').length;
    const mDispo = maisons.filter(m => m.statut === 'disponible').length;
    const mLoue = maisons.filter(m => m.statut === 'loue').length;
    const mVendu = maisons.filter(m => m.statut === 'vendu').length;
    return [
      { name: 'Terrains dispo.', value: tDispo, color: 'var(--success)' },
      { name: 'Terrains négo.', value: tNego, color: 'var(--warning)' },
      { name: 'Terrains vendus', value: tVendu, color: 'var(--danger)' },
      { name: 'Maisons dispo.', value: mDispo, color: 'var(--primary)' },
      { name: 'Maisons louées', value: mLoue, color: 'var(--info)' },
      { name: 'Maisons vendues', value: mVendu, color: 'oklch(0.55 0.04 257)' },
    ].filter(x => x.value > 0);
  }, [terrains, maisons]);

  const activite = useMemo(() => {
    const items: { id: string; auteur: string; action: string; date: string; type: string }[] = [];
    terrains.slice(0, 4).forEach(t => items.push({ id: 't-' + t.id, auteur: 'Marie N.', action: `Terrain ajouté : ${t.titre}`, date: t.date_ajout, type: 'terrain' }));
    maisons.slice(0, 3).forEach(m => items.push({ id: 'm-' + m.id, auteur: 'Paul M.', action: `Maison publiée : ${m.titre}`, date: m.date_ajout, type: 'maison' }));
    transactions.slice(0, 4).forEach(t => items.push({ id: 'tr-' + t.id, auteur: 'Sophie E.', action: `Transaction ${t.statut} — ${xaf(t.montant)}`, date: t.date_transaction, type: 'transaction' }));
    return items.sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 10);
  }, [terrains, maisons, transactions]);

  return (
    <>
    <div className="space-y-6">
      <PageHeader
        titre="Overview"
        sous_titre="Vue d'ensemble de votre portefeuille immobilier — Yaoundé, Cameroun"
        actions={
          <>
            <button onClick={() => navigate({ to: '/rapports' })} className="h-9 px-3 text-sm font-medium rounded-lg border border-border bg-card hover:bg-secondary transition-colors flex items-center gap-1.5">
              <BarChart3 size={15} /> Rapports
            </button>
            <button onClick={() => setOpenMaison(true)} className="h-9 px-3 text-sm font-medium rounded-lg border border-border bg-card hover:bg-secondary transition-colors flex items-center gap-1.5">
              <Home size={15} /> + Maison
            </button>
            <button onClick={() => setOpenTerrain(true)} className="h-9 px-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-1.5">
              <Plus size={15} /> Ajouter un terrain
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Biens totaux" value={kpis.biens.toString()} delta={12.4} spark={genSpark(1)} accent="primary" />
        <KpiCard label="Revenus ce mois" value={xaf(kpis.revenus)} delta={8.2} spark={genSpark(2)} accent="success" />
        <KpiCard label="Utilisateurs actifs" value={kpis.usersActifs.toString()} delta={3.1} spark={genSpark(3)} accent="info" />
        <KpiCard label="Transactions en attente" value={kpis.enAttente.toString()} delta={-2.4} spark={genSpark(4)} accent="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-semibold">Activité 30 derniers jours</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Annonces publiées et transactions traitées</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" />Annonces</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" />Transactions</span>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data30} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="jour" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="annonces" stroke="var(--primary)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="transactions" stroke="var(--success)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-display text-base font-semibold mb-1">Répartition des biens</h3>
          <p className="text-xs text-muted-foreground">Par type et statut</p>
          <div className="h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={repartition} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {repartition.map((e, i) => <Cell key={i} fill={e.color} stroke="var(--card)" strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {repartition.map((r) => (
              <div key={r.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
                <span className="text-muted-foreground truncate">{r.name}</span>
                <span className="font-medium ml-auto">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              <h3 className="font-display text-base font-semibold">Activité récente</h3>
            </div>
            <button onClick={() => navigate({ to: '/transactions' })} className="text-xs text-primary hover:underline">Tout voir</button>
          </div>
          <div className="divide-y divide-border">
            {activite.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-info/80 flex items-center justify-center text-primary-foreground text-[11px] font-semibold shrink-0">
                  {a.auteur.split(' ').map(s => s[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate"><span className="font-medium">{a.auteur}</span> — {a.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDistanceToNow(new Date(a.date), { addSuffix: true, locale: fr })}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{a.type}</span>
              </div>
            ))}
            {activite.length === 0 && <div className="p-5 text-sm text-muted-foreground">Aucune activité.</div>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-primary" />
            <h3 className="font-display text-base font-semibold">Derniers terrains</h3>
          </div>
          <div className="space-y-2.5">
            {terrains.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/60 transition-colors">
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center shrink-0">
                  <MapPin size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{t.titre}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {t.quartier}, {t.ville} · {t.surface_m2.toLocaleString('fr-FR')} m²
                  </div>
                </div>
                <StatusBadge statut={t.statut} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
