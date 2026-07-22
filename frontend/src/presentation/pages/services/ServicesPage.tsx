import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Trash2, Pencil, Briefcase } from 'lucide-react';
import { PageHeader } from '../../components/shared/PageHeader';
import { Modal, FormField, FormFooter, inputClass, textareaClass } from '../../components/shared/Modal';
import { useServiceStore } from '../../../application/store/serviceStore';
import { SERVICE_ICON_OPTIONS, resolveServiceIcon, type Service } from '../../../infrastructure/data/services';

const catLabels: Record<string, string> = {
  audit: 'Audit & expertise',
  vente: 'Vente',
  gestion: 'Gestion',
};

export function ServicesPage() {
  const { services, charger, ajouter, modifier, supprimer, loading } = useServiceStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Service | null>(null);

  useEffect(() => { void charger(true); }, [charger]);

  const filtered = useMemo(
    () =>
      services.filter(
        (s) =>
          q === '' ||
          s.titre.toLowerCase().includes(q.toLowerCase()) ||
          s.description.toLowerCase().includes(q.toLowerCase()),
      ),
    [services, q],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Services"
        sous_titre="Catalogue dynamique des offres commerciales (visible côté client)"
        actions={
          <button
            type="button"
            onClick={() => { setEdit(null); setOpen(true); }}
            className="h-9 px-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5"
          >
            <Plus size={15} /> Nouveau service
          </button>
        }
      />

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un service…"
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b border-border bg-secondary/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Service</th>
                <th className="text-left px-4 py-3 font-medium">Catégorie</th>
                <th className="text-left px-4 py-3 font-medium">Ordre</th>
                <th className="text-left px-4 py-3 font-medium">Statut</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => {
                const Icon = resolveServiceIcon(s.icon);
                return (
                  <tr key={s.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="font-medium">{s.titre}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-md">{s.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{catLabels[s.categorie] ?? s.categorie}</td>
                    <td className="px-4 py-3 tabular-nums">{s.ordre}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${s.actif ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {s.actif ? 'Actif' : 'Inactif'}
                        </span>
                        {s.phare && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Phare</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Modifier"
                          onClick={() => { setEdit(s); setOpen(true); }}
                          className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          title="Supprimer"
                          onClick={async () => {
                            if (!confirm(`Supprimer « ${s.titre} » ?`)) return;
                            try { await supprimer(s.id); }
                            catch (e) { alert((e as Error).message); }
                          }}
                          className="h-7 w-7 rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    <Briefcase size={20} className="mx-auto mb-2 opacity-40" />
                    Aucun service.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ServiceForm
        open={open}
        service={edit}
        onClose={() => { setOpen(false); setEdit(null); }}
        onCreate={ajouter}
        onUpdate={modifier}
      />
    </div>
  );
}

function ServiceForm({
  open,
  service,
  onClose,
  onCreate,
  onUpdate,
}: {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onCreate: (input: {
    titre: string;
    description: string;
    details: string[];
    prix_indicatif?: string;
    icon?: string;
    categorie: string;
    ordre?: number;
    actif?: boolean;
    phare?: boolean;
  }) => Promise<void>;
  onUpdate: (
    id: string,
    input: {
      titre: string;
      description: string;
      details: string[];
      prix_indicatif: string;
      icon: string;
      categorie: string;
      ordre: number;
      actif: boolean;
      phare: boolean;
    },
  ) => Promise<void>;
}) {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [detailsText, setDetailsText] = useState('');
  const [prix, setPrix] = useState('');
  const [icon, setIcon] = useState('Briefcase');
  const [categorie, setCategorie] = useState<'audit' | 'vente' | 'gestion'>('audit');
  const [ordre, setOrdre] = useState('0');
  const [actif, setActif] = useState(true);
  const [phare, setPhare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (service) {
      setTitre(service.titre);
      setDescription(service.description);
      setDetailsText(service.details.join('\n'));
      setPrix(service.prixIndicatif ?? '');
      setIcon(service.icon);
      setCategorie(service.categorie);
      setOrdre(String(service.ordre));
      setActif(service.actif);
      setPhare(service.phare);
    } else {
      setTitre('');
      setDescription('');
      setDetailsText('');
      setPrix('');
      setIcon('Briefcase');
      setCategorie('audit');
      setOrdre('0');
      setActif(true);
      setPhare(false);
    }
    setError(null);
  }, [open, service]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = {
      titre,
      description,
      details: detailsText.split('\n').map((l) => l.trim()).filter(Boolean),
      prix_indicatif: prix,
      icon,
      categorie,
      ordre: parseInt(ordre, 10) || 0,
      actif,
      phare,
    };
    try {
      if (service) await onUpdate(service.id, payload);
      else await onCreate(payload);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      titre={service ? 'Modifier le service' : 'Nouveau service'}
      sous_titre="Ces informations apparaissent sur le site client"
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Titre" required>
            <input className={inputClass} value={titre} onChange={(e) => setTitre(e.target.value)} required />
          </FormField>
          <FormField label="Catégorie" required>
            <select className={inputClass} value={categorie} onChange={(e) => setCategorie(e.target.value as typeof categorie)}>
              <option value="audit">Audit & expertise</option>
              <option value="vente">Vente</option>
              <option value="gestion">Gestion & accompagnement</option>
            </select>
          </FormField>
          <FormField label="Icône">
            <select className={inputClass} value={icon} onChange={(e) => setIcon(e.target.value)}>
              {SERVICE_ICON_OPTIONS.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Ordre d'affichage">
            <input type="number" className={inputClass} value={ordre} onChange={(e) => setOrdre(e.target.value)} />
          </FormField>
          <FormField label="Prix indicatif">
            <input className={inputClass} value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="À partir de … XAF" />
          </FormField>
        </div>
        <FormField label="Description" required>
          <textarea rows={3} className={textareaClass} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </FormField>
        <FormField label="Points clés (un par ligne)">
          <textarea rows={4} className={textareaClass} value={detailsText} onChange={(e) => setDetailsText(e.target.value)} />
        </FormField>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} />
            Actif (visible client)
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={phare} onChange={(e) => setPhare(e.target.checked)} />
            Mettre en avant (accueil)
          </label>
        </div>
        {error && <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md p-2">{error}</div>}
        <FormFooter onCancel={onClose} loading={loading} />
      </form>
    </Modal>
  );
}
