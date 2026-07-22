import { useEffect, useState } from 'react';
import { User, Palette, Shield, Globe, Save, Moon, Sun } from 'lucide-react';
import { useUiStore } from '../../../application/store/uiStore';
import { useAuthStore } from '../../../application/store/authStore';
import {
  fetchPreferencesApi,
  updatePreferencesApi,
  updateProfileApi,
  type PreferencesDto,
} from '../../../infrastructure/api/auth';
import { PageHeader } from '../../components/shared/PageHeader';

const sections = [
  { id: 'profil', label: 'Profil', icon: User },
  // Notifications désactivées v1
  { id: 'apparence', label: 'Apparence', icon: Palette },
  { id: 'securite', label: 'Sécurité', icon: Shield },
  { id: 'preferences', label: 'Préférences', icon: Globe },
] as const;

export function ParametresPage() {
  const [active, setActive] = useState<(typeof sections)[number]['id']>('profil');
  const dark = useUiStore((s) => s.darkMode);
  const toggleDark = useUiStore((s) => s.toggleDark);
  const user = useAuthStore((s) => s.user);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ville, setVille] = useState('');
  const [prefs, setPrefs] = useState<PreferencesDto | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setPrenom(user.prenom ?? '');
      setNom(user.nom ?? '');
      setTelephone(user.telephone ?? '');
      setVille(user.ville ?? '');
    }
  }, [user]);

  useEffect(() => {
    void fetchPreferencesApi()
      .then(setPrefs)
      .catch(() => { /* ignore */ });
  }, []);

  const saveProfil = async () => {
    setSaving(true); setMsg(null); setErr(null);
    try {
      await updateProfileApi({ prenom, nom, telephone, ville });
      await bootstrap();
      setMsg('Profil enregistré.');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const savePrefs = async () => {
    if (!prefs) return;
    setSaving(true); setMsg(null); setErr(null);
    try {
      const updated = await updatePreferencesApi({
        langue: prefs.langue,
        devise: prefs.devise,
        format_date: prefs.format_date,
        fuseau: prefs.fuseau,
        dark_mode: dark,
      });
      setPrefs(updated);
      setMsg('Préférences enregistrées.');
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader titre="Paramètres" sous_titre="Profil, sécurité et préférences" />

      {(msg || err) && (
        <div className={`text-xs rounded-md p-2 border ${err ? 'text-danger bg-danger/10 border-danger/20' : 'text-success bg-success/10 border-success/20'}`}>
          {err ?? msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        <aside className="bg-card border border-border rounded-xl p-2 h-fit">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active === s.id ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary/60 text-foreground/80'
                }`}>
                <Icon size={15} /> {s.label}
              </button>
            );
          })}
        </aside>

        <section className="bg-card border border-border rounded-xl p-6 space-y-6">
          {active === 'profil' && (
            <>
              <Header titre="Profil utilisateur" desc="Informations affichées dans l'application" />
              <Grid>
                <Field label="Prénom" value={prenom} onChange={setPrenom} />
                <Field label="Nom" value={nom} onChange={setNom} />
                <Field label="Email" type="email" value={user?.email ?? ''} disabled />
                <Field label="Téléphone" value={telephone} onChange={setTelephone} />
                <Field label="Rôle" value={user?.role === 'admin' ? 'Administrateur' : 'Client'} disabled />
                <Field label="Ville" value={ville} onChange={setVille} />
              </Grid>
              <SaveBar onSave={saveProfil} loading={saving} />
            </>
          )}

          {active === 'apparence' && (
            <>
              <Header titre="Apparence" desc="Thème d'affichage" />
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  {dark ? <Moon size={18} /> : <Sun size={18} />}
                  <div>
                    <div className="font-medium text-sm">Mode sombre</div>
                    <div className="text-xs text-muted-foreground">Bascule l'interface en thème sombre</div>
                  </div>
                </div>
                <button type="button" onClick={toggleDark} className={`relative w-11 h-6 rounded-full transition-colors ${dark ? 'bg-primary' : 'bg-muted'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${dark ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <SaveBar
                onSave={async () => {
                  setSaving(true); setErr(null); setMsg(null);
                  try {
                    const updated = await updatePreferencesApi({ dark_mode: dark });
                    setPrefs((p) => (p ? { ...p, ...updated } : updated));
                    setMsg('Apparence enregistrée.');
                  } catch (e) {
                    setErr((e as Error).message);
                  } finally {
                    setSaving(false);
                  }
                }}
                loading={saving}
              />
            </>
          )}

          {active === 'securite' && (
            <>
              <Header titre="Sécurité" desc="Mot de passe — bientôt disponible via API dédiée" />
              <p className="text-sm text-muted-foreground">
                Le changement de mot de passe depuis cette page sera branché dans une prochaine version.
                Utilisez temporairement l&apos;endpoint API <code className="text-xs">/auth/change-password/</code>.
              </p>
            </>
          )}

          {active === 'preferences' && prefs && (
            <>
              <Header titre="Préférences" desc="Langue, devise et format" />
              <Grid>
                <SelectField
                  label="Langue"
                  value={prefs.langue}
                  onChange={(v) => setPrefs({ ...prefs, langue: v })}
                  options={[
                    { value: 'fr', label: 'Français' },
                    { value: 'en', label: 'English' },
                  ]}
                />
                <SelectField
                  label="Devise"
                  value={prefs.devise}
                  onChange={(v) => setPrefs({ ...prefs, devise: v })}
                  options={[
                    { value: 'XAF', label: 'XAF (Francs CFA)' },
                    { value: 'EUR', label: 'EUR' },
                    { value: 'USD', label: 'USD' },
                  ]}
                />
                <SelectField
                  label="Format de date"
                  value={prefs.format_date}
                  onChange={(v) => setPrefs({ ...prefs, format_date: v })}
                  options={[
                    { value: 'DD/MM/YYYY', label: 'dd/MM/yyyy' },
                    { value: 'MM/DD/YYYY', label: 'MM/dd/yyyy' },
                    { value: 'YYYY-MM-DD', label: 'yyyy-MM-dd' },
                  ]}
                />
                <SelectField
                  label="Fuseau horaire"
                  value={prefs.fuseau}
                  onChange={(v) => setPrefs({ ...prefs, fuseau: v })}
                  options={[
                    { value: 'Africa/Douala', label: 'Africa/Douala (UTC+1)' },
                    { value: 'Africa/Lagos', label: 'Africa/Lagos (UTC+1)' },
                  ]}
                />
              </Grid>
              <SaveBar onSave={savePrefs} loading={saving} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function Header({ titre, desc }: { titre: string; desc: string }) {
  return (
    <div className="border-b border-border pb-4">
      <h3 className="font-display text-lg font-semibold">{titre}</h3>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label, type = 'text', value, onChange, disabled,
}: {
  label: string; type?: string; value: string; onChange?: (v: string) => void; disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 w-full h-10 px-3 text-sm rounded-lg border border-border bg-background disabled:bg-secondary disabled:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full h-10 px-3 text-sm rounded-lg border border-border bg-background"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SaveBar({ onSave, loading }: { onSave: () => void | Promise<void>; loading?: boolean }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
      <button
        type="button"
        disabled={loading}
        onClick={() => void onSave()}
        className="h-9 px-4 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50"
      >
        <Save size={14} /> {loading ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </div>
  );
}
