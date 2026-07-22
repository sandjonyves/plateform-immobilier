import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Building2, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../../application/hooks/useTheme';
import { useAuthStore } from '../../../application/store/authStore';
import { ThemeToggle } from '../../components/client/ThemeToggle';
import heroVideo from '@/assets/hero-services.mp4.asset.json';
import coverVilla from '@/assets/cover-villa.jpg';

type Mode = 'login' | 'signup';

export function AuthPage() {
  useTheme();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const [mode, setMode] = useState<Mode>('login');
  const [showPwd, setShowPwd] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const reset = () => { setError(null); setSuccess(null); };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Veuillez saisir une adresse e-mail valide.'); return; }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (mode === 'signup' && (!prenom.trim() || !nom.trim())) { setError('Le prénom et le nom sont obligatoires.'); return; }

    try {
      const user =
        mode === 'login'
          ? await login(email, password)
          : await register({ prenom, nom, email, telephone, password });
      setSuccess(
        mode === 'login'
          ? 'Connexion réussie ! Redirection en cours…'
          : 'Compte créé — vous êtes connecté(e). Redirection…',
      );
      // Client → accueil ; admin → espace pro
      const dest = user.role === 'admin' ? '/dashboard' : '/';
      setTimeout(() => navigate({ to: dest }), 500);
    } catch (err) {
      setError((err as Error).message || 'Échec de l’authentification.');
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* GAUCHE — Formulaire */}
      <div className="flex flex-col px-6 sm:px-10 lg:px-16 py-8 relative">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Building2 size={18} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">ImmoPro</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-10">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft size={14} /> Retour à l'accueil
          </Link>

          <h1 className="font-display text-3xl font-bold">
            {mode === 'login' ? 'Bon retour parmi nous' : 'Créez votre compte'}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {mode === 'login'
              ? 'Connectez-vous pour gérer vos favoris et vos demandes.'
              : 'Rejoignez ImmoPro pour accéder à tous nos terrains et maisons.'}
          </p>

          {/* Onglets */}
          <div className="mt-6 grid grid-cols-2 p-1 bg-secondary rounded-lg text-sm font-medium">
            <button
              onClick={() => { setMode('login'); reset(); }}
              className={`h-9 rounded-md transition-colors ${mode === 'login' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
              Connexion
            </button>
            <button
              onClick={() => { setMode('signup'); reset(); }}
              className={`h-9 rounded-md transition-colors ${mode === 'signup' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}>
              Créer un compte
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <Field icon={<User size={15} />} placeholder="Prénom" value={prenom} onChange={setPrenom} />
                <Field icon={<User size={15} />} placeholder="Nom" value={nom} onChange={setNom} />
              </div>
            )}
            {mode === 'signup' && (
              <Field icon={<Phone size={15} />} placeholder="+237 6 90 00 00 00" value={telephone} onChange={setTelephone} type="tel" />
            )}
            <Field icon={<Mail size={15} />} placeholder="Adresse e-mail" value={email} onChange={setEmail} type="email" />

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><Lock size={15} /></span>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full h-11 pl-9 pr-10 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="accent-primary" /> Se souvenir de moi
                </label>
                <button type="button" className="text-primary hover:underline">Mot de passe oublié ?</button>
              </div>
            )}

            {error && <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md p-2.5">{error}</div>}
            {success && (
              <div className="text-xs text-success bg-success/10 border border-success/20 rounded-md p-2.5 flex items-center gap-2">
                <CheckCircle2 size={14} /> {success}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
              {loading ? 'Patientez…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'} <ArrowRight size={16} />
            </button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            {mode === 'login' ? "Vous n'avez pas de compte ? " : 'Vous avez déjà un compte ? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); reset(); }}
              className="text-primary font-medium hover:underline">
              {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>

      {/* DROITE — Vidéo */}
      <div className="relative hidden lg:block overflow-hidden">
        <video
          src={heroVideo.url}
          poster={coverVilla}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-primary/40 to-info/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        <div className="relative h-full flex flex-col justify-end p-12 text-primary-foreground">
          <span className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/25 text-xs font-semibold uppercase tracking-wider">
            ImmoPro · Yaoundé, Cameroun
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight max-w-md">
            L'immobilier camerounais, en toute confiance.
          </h2>
          <p className="mt-3 text-primary-foreground/85 max-w-md">
            Terrains bornés et vérifiés, maisons d'exception et visualisation 3D — tout au même endroit.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon, placeholder, value, onChange, type = 'text',
}: { icon: React.ReactNode; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-9 pr-3 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </div>
  );
}
