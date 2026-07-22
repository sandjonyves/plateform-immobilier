import { useState } from 'react';
import { Modal, FormField, FormFooter, inputClass } from '../shared/Modal';
import { useAgendaStore, type TypeEvenement } from '../../../application/store/agendaStore';

export function EvenementForm({ open, onClose, defaultDate }: { open: boolean; onClose: () => void; defaultDate?: string }) {
  const ajouter = useAgendaStore((s) => s.ajouter);
  const [titre, setTitre] = useState('');
  const [type, setType] = useState<TypeEvenement>('visite');
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().slice(0, 10));
  const [heure, setHeure] = useState('10:00');
  const [lieu, setLieu] = useState('');
  const [participants, setParticipants] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await ajouter({ titre, type, date, heure, lieu, participants });
      onClose();
      setTitre(''); setLieu(''); setParticipants('');
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} titre="Nouvel événement" sous_titre="Visite, signature ou réunion" size="md">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Titre" required><input className={inputClass} value={titre} onChange={(e) => setTitre(e.target.value)} required /></FormField>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Type" required>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as TypeEvenement)}>
              <option value="visite">Visite</option>
              <option value="signature">Signature</option>
              <option value="reunion">Réunion</option>
            </select>
          </FormField>
          <FormField label="Date" required><input type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} required /></FormField>
          <FormField label="Heure" required><input type="time" className={inputClass} value={heure} onChange={(e) => setHeure(e.target.value)} required /></FormField>
        </div>
        <FormField label="Lieu"><input className={inputClass} value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Ex. Bastos, Yaoundé" /></FormField>
        <FormField label="Participants" hint="Séparés par des virgules">
          <input className={inputClass} value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Marie N., A. Bello" />
        </FormField>

        {error && <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md p-2">{error}</div>}
        <FormFooter onCancel={onClose} loading={loading} />
      </form>
    </Modal>
  );
}
