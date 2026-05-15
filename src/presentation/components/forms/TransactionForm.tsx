import { useEffect, useState } from 'react';
import { Modal, FormField, FormFooter, inputClass } from '../shared/Modal';
import { useTransactionStore } from '../../../application/store/transactionStore';
import { useTerrainStore } from '../../../application/store/terrainStore';
import { useMaisonStore } from '../../../application/store/maisonStore';
import { useUtilisateurStore } from '../../../application/store/utilisateurStore';

export function TransactionForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ajouter = useTransactionStore((s) => s.ajouter);
  const { terrains, charger: cT } = useTerrainStore();
  const { maisons, charger: cM } = useMaisonStore();
  const { utilisateurs, charger: cU } = useUtilisateurStore();

  useEffect(() => { if (open) { cT(); cM(); cU(); } }, [open, cT, cM, cU]);

  const [type, setType] = useState<'vente' | 'location'>('vente');
  const [bienType, setBienType] = useState<'terrain' | 'maison'>('terrain');
  const [bienId, setBienId] = useState('');
  const [clientId, setClientId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [montant, setMontant] = useState('');
  const [statut, setStatut] = useState<'en_attente' | 'confirmee' | 'annulee'>('en_attente');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const biens = bienType === 'terrain' ? terrains : maisons;
  const clients = utilisateurs.filter(u => u.role === 'client');
  const agents = utilisateurs.filter(u => u.role === 'agent');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      if (!bienId) throw new Error('Sélectionnez un bien.');
      if (!clientId) throw new Error('Sélectionnez un client.');
      if (!agentId) throw new Error('Sélectionnez un agent.');
      await ajouter({
        type, bien_id: bienId, bien_type: bienType,
        client_id: clientId, agent_id: agentId,
        montant: parseFloat(montant), statut,
      });
      onClose();
      setBienId(''); setClientId(''); setAgentId(''); setMontant('');
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} titre="Nouvelle transaction" sous_titre="Vente ou location d'un bien" size="md">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Type d'opération" required>
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as 'vente' | 'location')}>
              <option value="vente">Vente</option>
              <option value="location">Location</option>
            </select>
          </FormField>
          <FormField label="Type de bien" required>
            <select className={inputClass} value={bienType} onChange={(e) => { setBienType(e.target.value as 'terrain' | 'maison'); setBienId(''); }}>
              <option value="terrain">Terrain</option>
              <option value="maison">Maison</option>
            </select>
          </FormField>
        </div>

        <FormField label="Bien concerné" required>
          <select className={inputClass} value={bienId} onChange={(e) => setBienId(e.target.value)} required>
            <option value="">— Sélectionner —</option>
            {biens.map(b => <option key={b.id} value={b.id}>{b.titre} · {b.quartier}</option>)}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Client" required>
            <select className={inputClass} value={clientId} onChange={(e) => setClientId(e.target.value)} required>
              <option value="">— Sélectionner —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
            </select>
          </FormField>
          <FormField label="Agent" required>
            <select className={inputClass} value={agentId} onChange={(e) => setAgentId(e.target.value)} required>
              <option value="">— Sélectionner —</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.prenom} {a.nom}</option>)}
            </select>
          </FormField>
          <FormField label="Montant (XAF)" required>
            <input type="number" min="0" className={inputClass} value={montant} onChange={(e) => setMontant(e.target.value)} required />
          </FormField>
          <FormField label="Statut" required>
            <select className={inputClass} value={statut} onChange={(e) => setStatut(e.target.value as 'en_attente' | 'confirmee' | 'annulee')}>
              <option value="en_attente">En attente</option>
              <option value="confirmee">Confirmée</option>
              <option value="annulee">Annulée</option>
            </select>
          </FormField>
        </div>

        {error && <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md p-2">{error}</div>}
        <FormFooter onCancel={onClose} loading={loading} />
      </form>
    </Modal>
  );
}
