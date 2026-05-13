import { useState } from 'react';
import { FileText, Upload, Search, Download, Trash2, FileSignature, FileCheck, FileImage } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader } from '../../components/shared/PageHeader';
import { KpiCard } from '../../components/shared/KpiCard';

type DocType = 'contrat' | 'titre_foncier' | 'permis' | 'photo' | 'autre';

interface Doc {
  id: string; nom: string; type: DocType; taille_kb: number; bien_associe: string;
  date_ajout: string; ajoute_par: string;
}

const docsMock: Doc[] = [
  { id: 'd1', nom: 'Contrat_vente_Bonapriso.pdf', type: 'contrat', taille_kb: 412, bien_associe: 'Lot Bonapriso', date_ajout: new Date(Date.now() - 1 * 86400000).toISOString(), ajoute_par: 'Marie Ngono' },
  { id: 'd2', nom: 'TF-Bastos-2024.pdf', type: 'titre_foncier', taille_kb: 1280, bien_associe: 'Terrain Bastos Nord', date_ajout: new Date(Date.now() - 3 * 86400000).toISOString(), ajoute_par: 'Jean Tchoumi' },
  { id: 'd3', nom: 'Permis_construire_Akwa.pdf', type: 'permis', taille_kb: 870, bien_associe: 'Studio Akwa', date_ajout: new Date(Date.now() - 5 * 86400000).toISOString(), ajoute_par: 'Paul Mbarga' },
  { id: 'd4', nom: 'Photos_villa_Bastos.zip', type: 'photo', taille_kb: 8420, bien_associe: 'Villa moderne Bastos', date_ajout: new Date(Date.now() - 7 * 86400000).toISOString(), ajoute_par: 'Marie Ngono' },
  { id: 'd5', nom: 'Contrat_location_Nlongkak.pdf', type: 'contrat', taille_kb: 320, bien_associe: 'Appartement Nlongkak', date_ajout: new Date(Date.now() - 12 * 86400000).toISOString(), ajoute_par: 'Sophie Eyenga' },
  { id: 'd6', nom: 'Plan_cadastral_Melen.pdf', type: 'autre', taille_kb: 540, bien_associe: 'Terrain Melen Vue', date_ajout: new Date(Date.now() - 18 * 86400000).toISOString(), ajoute_par: 'Marie Ngono' },
  { id: 'd7', nom: 'TF-Bonapriso-2023.pdf', type: 'titre_foncier', taille_kb: 1102, bien_associe: 'Lot Bonapriso', date_ajout: new Date(Date.now() - 30 * 86400000).toISOString(), ajoute_par: 'Jean Tchoumi' },
];

const typeMeta: Record<DocType, { label: string; icon: React.ReactNode; bg: string }> = {
  contrat: { label: 'Contrat', icon: <FileSignature size={14} />, bg: 'bg-primary/10 text-primary' },
  titre_foncier: { label: 'Titre foncier', icon: <FileCheck size={14} />, bg: 'bg-success/10 text-success' },
  permis: { label: 'Permis', icon: <FileText size={14} />, bg: 'bg-warning/10 text-warning' },
  photo: { label: 'Photos', icon: <FileImage size={14} />, bg: 'bg-info/10 text-info' },
  autre: { label: 'Autre', icon: <FileText size={14} />, bg: 'bg-muted text-muted-foreground' },
};

const fmtSize = (kb: number) => kb >= 1024 ? `${(kb / 1024).toFixed(1)} Mo` : `${kb} Ko`;

export function DocumentsPage() {
  const [q, setQ] = useState('');
  const [type, setType] = useState<string>('tous');

  const filtered = docsMock.filter(d =>
    (type === 'tous' || d.type === type) &&
    (q === '' || d.nom.toLowerCase().includes(q.toLowerCase()) || d.bien_associe.toLowerCase().includes(q.toLowerCase())),
  );

  const totalSize = docsMock.reduce((s, d) => s + d.taille_kb, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        titre="Documents"
        sous_titre="Contrats, titres fonciers, permis et pièces"
        actions={
          <button className="h-9 px-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5">
            <Upload size={15} /> Importer
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Documents" value={docsMock.length.toString()} delta={4.0} accent="primary" />
        <KpiCard label="Contrats actifs" value={docsMock.filter(d => d.type === 'contrat').length.toString()} delta={2.5} accent="success" />
        <KpiCard label="Titres fonciers" value={docsMock.filter(d => d.type === 'titre_foncier').length.toString()} delta={1.0} accent="info" />
        <KpiCard label="Espace utilisé" value={fmtSize(totalSize)} delta={6.7} accent="warning" />
      </div>

      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un document…"
              className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background" />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 px-3 text-sm rounded-lg border border-border bg-background">
            <option value="tous">Tous types</option>
            <option value="contrat">Contrats</option>
            <option value="titre_foncier">Titres fonciers</option>
            <option value="permis">Permis</option>
            <option value="photo">Photos</option>
            <option value="autre">Autres</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left font-medium px-4 py-3">Document</th>
                <th className="text-left font-medium px-4 py-3">Type</th>
                <th className="text-left font-medium px-4 py-3">Bien associé</th>
                <th className="text-right font-medium px-4 py-3">Taille</th>
                <th className="text-left font-medium px-4 py-3">Ajouté par</th>
                <th className="text-left font-medium px-4 py-3">Date</th>
                <th className="text-right font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => {
                const meta = typeMeta[d.type];
                return (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center ${meta.bg}`}>{meta.icon}</div>
                        <div className="font-medium">{d.nom}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${meta.bg}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs">{d.bien_associe}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-xs text-muted-foreground">{fmtSize(d.taille_kb)}</td>
                    <td className="px-4 py-3 text-xs">{d.ajoute_par}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(d.date_ajout), 'dd/MM/yyyy')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center" title="Télécharger"><Download size={14} /></button>
                        <button className="h-7 w-7 rounded-md hover:bg-secondary flex items-center justify-center text-danger" title="Supprimer"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">Aucun document.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
