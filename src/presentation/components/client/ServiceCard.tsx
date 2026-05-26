import { ArrowRight, MessageCircle } from 'lucide-react';
import { type Service } from '../../../infrastructure/data/services';
import { openWhatsApp } from '../../../lib/whatsapp';

export function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;

  const handleClick = () => {
    const msg = `Bonjour ImmoPro, je suis intéressé(e) par votre service "${service.titre}".\n\n${service.description}\n\nPouvez-vous m'envoyer plus d'informations ?`;
    openWhatsApp(msg);
  };

  return (
    <button
      onClick={handleClick}
      className="group text-left w-full bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <Icon size={22} />
      </div>
      <h3 className="font-display text-lg font-bold leading-tight">{service.titre}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{service.description}</p>
      <ul className="mt-4 space-y-1.5">
        {service.details.slice(0, 3).map((d) => (
          <li key={d} className="text-xs text-foreground/70 flex items-start gap-2">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" /> {d}
          </li>
        ))}
      </ul>
      {service.prixIndicatif && (
        <p className="mt-4 text-xs font-semibold text-primary">{service.prixIndicatif}</p>
      )}
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs font-medium">
        <span className="inline-flex items-center gap-1.5 text-success">
          <MessageCircle size={14} /> Discuter sur WhatsApp
        </span>
        <ArrowRight size={14} className="text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
      </div>
    </button>
  );
}
