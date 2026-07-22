import { useEffect, useState } from 'react';
import { Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Modal, FormField, FormFooter, inputClass, textareaClass } from '../shared/Modal';
import { MediaUploader } from './MediaUploader';
import { useMaisonStore } from '../../../application/store/maisonStore';
import { useVilleStore } from '../../../application/store/villeStore';
import type { StatutMaison, TypeMaison } from '../../../infrastructure/mock-data/maisons.mock';

export function MaisonForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ajouter = useMaisonStore((s) => s.ajouter);
  const { villes, charger: chargerVilles } = useVilleStore();
  const [titre, setTitre] = useState('');
  const [type, setType] = useState<TypeMaison>('villa');
  const [statut, setStatut] = useState<StatutMaison>('disponible');
  const [prix, setPrix] = useState('');
  const [villeId, setVilleId] = useState('');
  const [quartier, setQuartier] = useState('');
  const [surface, setSurface] = useState('');
  const [chambres, setChambres] = useState('3');
  const [sdb, setSdb] = useState('2');
  const [etages, setEtages] = useState('1');
  const [lat, setLat] = useState('3.8895');
  const [lng, setLng] = useState('11.5174');
  const [tf, setTf] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) void chargerVilles();
  }, [open, chargerVilles]);

  useEffect(() => {
    if (!villeId && villes.length) {
      const yde = villes.find((v) => v.nom === 'Yaoundé');
      setVilleId(yde?.id ?? villes[0].id);
    }
  }, [villes, villeId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!villeId) throw new Error('Sélectionnez une ville.');
      await ajouter({
        titre,
        type,
        statut,
        prix: parseFloat(prix),
        ville_id: villeId,
        quartier,
        description,
        surface_m2: parseFloat(surface),
        chambres: parseInt(chambres) || 0,
        salles_de_bain: parseInt(sdb) || 0,
        etages: parseInt(etages) || 1,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        titre_foncier: tf || undefined,
        photos,
        videos,
      });
      onClose();
      setTitre('');
      setQuartier('');
      setPrix('');
      setSurface('');
      setTf('');
      setDescription('');
      setPhotos([]);
      setVideos([]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} titre="Nouvelle maison" sous_titre="Ajouter un bien (villa, appartement, duplex, studio, bureau)" size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Titre" required>
            <input className={inputClass} value={titre} onChange={(e) => setTitre(e.target.value)} required />
          </FormField>
          <FormField label="Titre foncier">
            <input className={inputClass} value={tf} onChange={(e) => setTf(e.target.value)} placeholder="TF-XXXX-2025" />
          </FormField>
          <FormField label="Type" required>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as TypeMaison)}>
              <option value="villa">Villa</option>
              <option value="appartement">Appartement</option>
              <option value="duplex">Duplex</option>
              <option value="studio">Studio</option>
              <option value="bureau">Bureau</option>
            </select>
          </FormField>
          <FormField label="Statut" required>
            <select className={inputClass} value={statut} onChange={(e) => setStatut(e.target.value as StatutMaison)}>
              <option value="disponible">Disponible</option>
              <option value="loue">Loué</option>
              <option value="vendu">Vendu</option>
              <option value="en_travaux">En travaux</option>
              <option value="archive">Archivé</option>
            </select>
          </FormField>
          <FormField label="Ville" required>
            <select className={inputClass} value={villeId} onChange={(e) => setVilleId(e.target.value)} required>
              <option value="">— Sélectionner —</option>
              {villes.map((v) => (
                <option key={v.id} value={v.id}>{v.nom}{v.region ? ` (${v.region})` : ''}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Quartier" required>
            <input className={inputClass} value={quartier} onChange={(e) => setQuartier(e.target.value)} required />
          </FormField>
          <FormField label="Prix (XAF)" required>
            <input type="number" min="0" className={inputClass} value={prix} onChange={(e) => setPrix(e.target.value)} required />
          </FormField>
          <FormField label="Surface (m²)" required>
            <input type="number" min="0" className={inputClass} value={surface} onChange={(e) => setSurface(e.target.value)} required />
          </FormField>
          <div className="grid grid-cols-3 gap-2 md:col-span-2">
            <FormField label="Chambres"><input type="number" min="0" className={inputClass} value={chambres} onChange={(e) => setChambres(e.target.value)} /></FormField>
            <FormField label="Salles de bain"><input type="number" min="0" className={inputClass} value={sdb} onChange={(e) => setSdb(e.target.value)} /></FormField>
            <FormField label="Étages"><input type="number" min="1" className={inputClass} value={etages} onChange={(e) => setEtages(e.target.value)} /></FormField>
          </div>
          <FormField label="Latitude" required>
            <input type="number" step="0.000001" className={inputClass} value={lat} onChange={(e) => setLat(e.target.value)} required />
          </FormField>
          <FormField label="Longitude" required>
            <input type="number" step="0.000001" className={inputClass} value={lng} onChange={(e) => setLng(e.target.value)} required />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea rows={3} className={textareaClass} value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MediaUploader label="Photos" icon={<ImageIcon size={14} />} kind="image" urls={photos} onChange={setPhotos} />
          <MediaUploader label="Vidéos" icon={<VideoIcon size={14} />} kind="video" urls={videos} onChange={setVideos} />
        </div>

        {error && <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md p-2">{error}</div>}
        <FormFooter onCancel={onClose} loading={loading} />
      </form>
    </Modal>
  );
}
