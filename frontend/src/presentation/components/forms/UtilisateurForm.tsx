import { useState } from 'react';
import { Modal, FormField, FormFooter, inputClass } from '../shared/Modal';
import { useUtilisateurStore } from '../../../application/store/utilisateurStore';

export function UtilisateurForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ajouter = useUtilisateurStore((s) => s.ajouter);
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('+237 6');
  const [role, setRole] = useState<'admin' | 'agent' | 'client'>('client');
  const [statut, setStatut] = useState<'actif' | 'suspendu'>('actif');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await ajouter({ prenom, nom, email, telephone, role, statut });
      onClose();
      setPrenom(''); setNom(''); setEmail(''); setTelephone('+237 6');
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} titre="Nouvel utilisateur" sous_titre="Ajouter un admin ou un client" size="md">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Prénom" required><input className={inputClass} value={prenom} onChange={(e) => setPrenom(e.target.value)} required /></FormField>
          <FormField label="Nom" required><input className={inputClass} value={nom} onChange={(e) => setNom(e.target.value)} required /></FormField>
          <FormField label="Email" required><input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="prenom.nom@immopro.cm" /></FormField>
          <FormField label="Téléphone" required><input className={inputClass} value={telephone} onChange={(e) => setTelephone(e.target.value)} required /></FormField>
          <FormField label="Rôle" required>
            <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as 'admin' | 'agent' | 'client')}>
              <option value="client">Client</option>
              <option value="admin">Administrateur</option>
            </select>
          </FormField>
          <FormField label="Statut" required>
            <select className={inputClass} value={statut} onChange={(e) => setStatut(e.target.value as 'actif' | 'suspendu')}>
              <option value="actif">Actif</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </FormField>
        </div>

        {error && <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md p-2">{error}</div>}
        <FormFooter onCancel={onClose} loading={loading} />
      </form>
    </Modal>
  );
}
