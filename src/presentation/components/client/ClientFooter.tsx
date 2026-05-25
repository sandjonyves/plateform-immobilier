import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export function ClientFooter() {
  return (
    <footer className="border-t border-border bg-card/60 mt-16">
      <div className="max-w-[1400px] mx-auto px-6 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <Building2 size={16} />
            </div>
            <span className="font-display text-lg font-bold">ImmoPro</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            La plateforme immobilière de référence au Cameroun. Terrains et maisons vérifiés, visualisation 3D.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Explorer</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Terrains à vendre</li>
            <li>Maisons à acheter</li>
            <li>Maisons à louer</li>
            <li>Carte interactive</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Société</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>À propos</li>
            <li>Nos agents</li>
            <li>Carrières</li>
            <li>Mentions légales</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><MapPin size={14}/> Yaoundé, Cameroun</li>
            <li className="flex items-center gap-2"><Phone size={14}/> +237 6 90 00 00 00</li>
            <li className="flex items-center gap-2"><Mail size={14}/> contact@immopro.cm</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ImmoPro. Tous droits réservés.
      </div>
    </footer>
  );
}
