import { useState } from 'react';
import { User, Bell, Palette, Shield, Globe, Save, Moon, Sun } from 'lucide-react';
import { useUiStore } from '../../../application/store/uiStore';
import { PageHeader } from '../../components/shared/PageHeader';

const sections = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'apparence', label: 'Apparence', icon: Palette },
  { id: 'securite', label: 'Sécurité', icon: Shield },
  { id: 'preferences', label: 'Préférences', icon: Globe },
] as const;

export function ParametresPage() {
  const [active, setActive] = useState<typeof sections[number]['id']>('profil');
  const dark = useUiStore(s => s.darkMode);
  const toggleDark = useUiStore(s => s.toggleDark);

  return (
    <div className="space-y-6">
      <PageHeader titre="Paramètres" sous_titre="Profil, notifications, sécurité et préférences" />

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        <aside className="bg-card border border-border rounded-xl p-2 h-fit">
          {sections.map(s => {
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
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-display font-bold text-lg">JT</div>
                <div>
                  <button className="h-8 px-3 text-xs rounded-md border border-border hover:bg-secondary">Changer la photo</button>
                  <p className="text-xs text-muted-foreground mt-1">JPG ou PNG, max 2 Mo</p>
                </div>
              </div>
              <Grid>
                <Field label="Prénom" defaultValue="Jean" />
                <Field label="Nom" defaultValue="Tchoumi" />
                <Field label="Email" type="email" defaultValue="jean.tchoumi@immopro.cm" />
                <Field label="Téléphone" defaultValue="+237 699 123 456" />
                <Field label="Rôle" defaultValue="Administrateur" disabled />
                <Field label="Ville" defaultValue="Yaoundé" />
              </Grid>
              <SaveBar />
            </>
          )}

          {active === 'notifications' && (
            <>
              <Header titre="Notifications" desc="Choisissez ce que vous souhaitez recevoir" />
              <div className="space-y-3">
                {[
                  ['Nouvelles transactions', 'Alerte à chaque vente ou location'],
                  ['Messages clients', 'Notification dès un nouveau message'],
                  ['Rappels d\'agenda', 'Visites et signatures à venir'],
                  ['Rapports hebdomadaires', 'Synthèse envoyée chaque lundi'],
                  ['Promotions partenaires', 'Offres et nouveautés ImmoPro'],
                ].map(([t, d], i) => (
                  <Toggle key={i} titre={t} desc={d} defaultChecked={i < 3} />
                ))}
              </div>
              <SaveBar />
            </>
          )}

          {active === 'apparence' && (
            <>
              <Header titre="Apparence" desc="Thème et densité d'affichage" />
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    {dark ? <Moon size={18} /> : <Sun size={18} />}
                    <div>
                      <div className="font-medium text-sm">Mode sombre</div>
                      <div className="text-xs text-muted-foreground">Bascule l'interface en thème sombre</div>
                    </div>
                  </div>
                  <button onClick={toggleDark} className={`relative w-11 h-6 rounded-full transition-colors ${dark ? 'bg-primary' : 'bg-muted'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${dark ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div>
                  <label className="text-sm font-medium">Couleur d'accent</label>
                  <div className="flex gap-2 mt-2">
                    {['var(--primary)', 'var(--success)', 'var(--info)', 'var(--warning)', 'var(--danger)'].map((c, i) => (
                      <button key={i} className="w-9 h-9 rounded-lg border-2 border-transparent hover:border-foreground/40 transition-colors" style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <SaveBar />
            </>
          )}

          {active === 'securite' && (
            <>
              <Header titre="Sécurité" desc="Mot de passe et authentification" />
              <Grid>
                <Field label="Mot de passe actuel" type="password" />
                <Field label="Nouveau mot de passe" type="password" />
                <Field label="Confirmer le nouveau mot de passe" type="password" full />
              </Grid>
              <Toggle titre="Authentification à deux facteurs" desc="Sécurisez votre compte avec un code OTP" />
              <Toggle titre="Sessions de confiance" desc="Mémoriser ce navigateur 30 jours" defaultChecked />
              <SaveBar />
            </>
          )}

          {active === 'preferences' && (
            <>
              <Header titre="Préférences" desc="Langue, devise et format" />
              <Grid>
                <SelectField label="Langue" options={['Français', 'English']} />
                <SelectField label="Devise" options={['XAF (Francs CFA)', 'EUR', 'USD']} />
                <SelectField label="Format de date" options={['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd']} />
                <SelectField label="Fuseau horaire" options={['Africa/Douala (UTC+1)', 'Africa/Lagos (UTC+1)']} />
              </Grid>
              <SaveBar />
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

function Field({ label, type = 'text', defaultValue, disabled, full }: { label: string; type?: string; defaultValue?: string; disabled?: boolean; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input type={type} defaultValue={defaultValue} disabled={disabled}
        className="mt-1 w-full h-10 px-3 text-sm rounded-lg border border-border bg-background disabled:bg-secondary disabled:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40" />
    </div>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select className="mt-1 w-full h-10 px-3 text-sm rounded-lg border border-border bg-background">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Toggle({ titre, desc, defaultChecked }: { titre: string; desc: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
      <div>
        <div className="font-medium text-sm">{titre}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <button onClick={() => setOn(!on)} className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-primary' : 'bg-muted'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

function SaveBar() {
  return (
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
      <button className="h-9 px-3 text-sm rounded-lg border border-border hover:bg-secondary">Annuler</button>
      <button className="h-9 px-4 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5">
        <Save size={14} /> Enregistrer
      </button>
    </div>
  );
}
