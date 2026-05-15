import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Mail, Phone, Shield, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUtilisateurStore } from '../../../application/store/utilisateurStore';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { KpiCard } from '../../components/shared/KpiCard';
import { UtilisateurForm } from '../../components/forms/UtilisateurForm';

const roleColors: Record<string, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  agent: 'bg-info/10 text-info border-info/20',
  client: 'bg-secondary text-foreground border-border',
};

const roleLabels: Record<string, string> = { admin: 'Administrateur', agent: 'Agent', client: 'Client' };

export function UtilisateursPage() {
  const { utilisateurs, charger } = useUtilisateurStore();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('tous');
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => { charger(); }, [charger]);

  const filtered = useMemo(() => utilisateurs.filter(u =>
    (role === 'tous' || u.role === role) &&
    (q === '' || `${u.prenom} ${u.nom}`.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
  ), [utilisateurs, q, role]);

  const kpi = useMemo(() => ({
    total: utilisateurs.length,
    agents: utilisateurs.filter(u => u.role === 'agent').length,
    clients: utilisateurs.filter(u => u.role === 'client').length,
    actifs: utilisateurs.filter(u => u.statut === 'actif').length,
  }), [utilisateurs]);

  return (
    <>
    <div className="space-y-6">
      <PageHeader
        titre="Utilisateurs"
        sous_titre="Administrateurs, agents et clients"
        actions={
          <button onClick={() => setOpenForm(true)} className="h-9 px-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5">
            <Plus size={15} /> Inviter un utilisateur
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Utilisateurs" value={kpi.total.toString()} delta={3.4} accent="primary" />
        <KpiCard label="Agents" value={kpi.agents.toString()} delta={2.0} accent="info" />
        <KpiCard label="Clients" value={kpi.clients.toString()} delta={5.8} accent="success" />
        <KpiCard label="Comptes actifs" value={kpi.actifs.toString()} delta={1.2} accent="warning" />
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un utilisateur…"
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40" />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className="h-9 px-3 text-sm rounded-lg border border-border bg-background">
            <option value="tous">Tous rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="agent">Agents</option>
            <option value="client">Clients</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left font-medium px-4 py-3">Utilisateur</th>
                <th className="text-left font-medium px-4 py-3">Contact</th>
                <th className="text-left font-medium px-4 py-3">Rôle</th>
                <th className="text-left font-medium px-4 py-3">Statut</th>
                <th className="text-left font-medium px-4 py-3">Inscription</th>
                <th className="text-left font-medium px-4 py-3">Dernière connexion</th>
                <th className="text-right font-medium px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground text-xs font-semibold">
                        {u.prenom[0]}{u.nom[0]}
                      </div>
                      <div>
                        <div className="font-medium">{u.prenom} {u.nom}</div>
                        <div className="text-xs text-muted-foreground">ID : {u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs"><Mail size={12} className="text-muted-foreground" />{u.email}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5"><Phone size={12} />{u.telephone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${roleColors[u.role]}`}>
                      <Shield size={11} /> {roleLabels[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge statut={u.statut} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(u.date_inscription), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(u.derniere_connexion), 'dd/MM/yyyy', { locale: fr })}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center ml-auto">
                      <MoreHorizontal size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">Aucun utilisateur.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <UtilisateurForm open={openForm} onClose={() => setOpenForm(false)} />
    </>
  );
}
