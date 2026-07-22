import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Modal, FormField, FormFooter, inputClass, textareaClass } from '../shared/Modal';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { StatutTerrain } from '../../../domains/terrain/value-objects/StatutTerrain';
import { Borne } from '../../../domains/terrain/value-objects/Borne';
import { SurfaceTerrain } from '../../../domains/terrain/value-objects/SurfaceTerrain';

interface BorneInput { latitude: string; longitude: string; }

export function TerrainForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ajouter = useTerrainStore((s) => s.ajouter);
  const [titre, setTitre] = useState('');
  const [ville, setVille] = useState('Yaoundé');
  const [quartier, setQuartier] = useState('');
  const [prix, setPrix] = useState('');
  const [statut, setStatut] = useState<StatutTerrain>(StatutTerrain.DISPONIBLE);
  const [tf, setTf] = useState('');
  const [description, setDescription] = useState('');
  const [bornes, setBornes] = useState<BorneInput[]>([
    { latitude: '3.8895', longitude: '11.5174' },
    { latitude: '3.8903', longitude: '11.5183' },
    { latitude: '3.8897', longitude: '11.5189' },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setTitre(''); setQuartier(''); setPrix(''); setTf(''); setDescription('');
    setBornes([{ latitude: '3.8895', longitude: '11.5174' }, { latitude: '3.8903', longitude: '11.5183' }, { latitude: '3.8897', longitude: '11.5189' }]);
    setError(null);
  };

  const surface = (() => {
    try {
      const bs = bornes.map(b => new Borne(parseFloat(b.latitude), parseFloat(b.longitude)));
      if (bs.length < 3 || bs.some(b => isNaN(b.latitude) || isNaN(b.longitude))) return null;
      return SurfaceTerrain.calculerDepuisBornes(bs).valeur;
    } catch { return null; }
  })();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const parsed = bornes.map(b => ({ latitude: parseFloat(b.latitude), longitude: parseFloat(b.longitude) }));
      if (parsed.some(b => isNaN(b.latitude) || isNaN(b.longitude))) throw new Error('Coordonnées invalides.');
      await ajouter({
        titre, ville, quartier,
        prix: parseFloat(prix), statut,
        titre_foncier: tf, description,
        bornes: parsed,
      });
      reset(); onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} titre="Nouveau terrain" sous_titre="Saisir les bornes GPS pour calcul automatique de la surface" size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Titre" required>
            <input className={inputClass} value={titre} onChange={(e) => setTitre(e.target.value)} required placeholder="Ex. Terrain Bastos Nord" />
          </FormField>
          <FormField label="Titre foncier" required>
            <input className={inputClass} value={tf} onChange={(e) => setTf(e.target.value)} required placeholder="TF-XXXX-2025" />
          </FormField>
          <FormField label="Ville" required>
            <input className={inputClass} value={ville} onChange={(e) => setVille(e.target.value)} required />
          </FormField>
          <FormField label="Quartier" required>
            <input className={inputClass} value={quartier} onChange={(e) => setQuartier(e.target.value)} required placeholder="Ex. Bastos" />
          </FormField>
          <FormField label="Prix (XAF)" required>
            <input type="number" min="0" className={inputClass} value={prix} onChange={(e) => setPrix(e.target.value)} required />
          </FormField>
          <FormField label="Statut" required>
            <select className={inputClass} value={statut} onChange={(e) => setStatut(e.target.value as StatutTerrain)}>
              <option value={StatutTerrain.DISPONIBLE}>Disponible</option>
              <option value={StatutTerrain.EN_NEGOCIATION}>En négociation</option>
              <option value={StatutTerrain.VENDU}>Vendu</option>
              <option value={StatutTerrain.ARCHIVE}>Archivé</option>
            </select>
          </FormField>
        </div>

        <FormField label="Description">
          <textarea rows={3} className={textareaClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>

        <div className="border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold">Bornes GPS du polygone</h4>
              <p className="text-[11px] text-muted-foreground">Minimum 3 bornes — surface calculée automatiquement (Shoelace)</p>
            </div>
            <button type="button" onClick={() => setBornes([...bornes, { latitude: '', longitude: '' }])}
              className="h-8 px-2 text-xs rounded-md border border-border hover:bg-secondary flex items-center gap-1">
              <Plus size={13} /> Borne
            </button>
          </div>
          <div className="space-y-2">
            {bornes.map((b, i) => (
              <div key={i} className="grid grid-cols-[28px_1fr_1fr_32px] gap-2 items-center">
                <span className="text-xs font-mono text-muted-foreground text-center">B{i + 1}</span>
                <input type="number" step="0.000001" placeholder="Latitude" className={inputClass}
                  value={b.latitude} onChange={(e) => { const v = [...bornes]; v[i] = { ...v[i], latitude: e.target.value }; setBornes(v); }} />
                <input type="number" step="0.000001" placeholder="Longitude" className={inputClass}
                  value={b.longitude} onChange={(e) => { const v = [...bornes]; v[i] = { ...v[i], longitude: e.target.value }; setBornes(v); }} />
                <button type="button" disabled={bornes.length <= 3}
                  onClick={() => setBornes(bornes.filter((_, j) => j !== i))}
                  className="h-9 w-8 rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger disabled:opacity-30 flex items-center justify-center">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
            <span className="text-muted-foreground">Bornes : <strong className="text-foreground">{bornes.length}</strong></span>
            <span className="text-muted-foreground">Surface calculée : <strong className="text-primary tabular-nums">
              {surface !== null ? surface.toLocaleString('fr-FR') + ' m²' : '—'}
            </strong></span>
          </div>
        </div>

        {error && <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md p-2">{error}</div>}
        <FormFooter onCancel={onClose} loading={loading} />
      </form>
    </Modal>
  );
}
