import { Link } from '@tanstack/react-router';
import { MapPin, Maximize2, Heart, BedDouble, Bath } from 'lucide-react';
import { StatusBadge } from '../shared/StatusBadge';

const xaf = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

interface BaseProps {
  id: string;
  titre: string;
  ville: string;
  quartier: string;
  prix: number;
  statut: string;
  surface_m2: number;
  cover?: string;
  badge?: string;
}

interface TerrainCardProps extends BaseProps {
  type: 'terrain';
}
interface MaisonCardProps extends BaseProps {
  type: 'maison';
  typeMaison: string;
  chambres: number;
  salles_de_bain: number;
}

export function PropertyCard(props: TerrainCardProps | MaisonCardProps) {
  const href = props.type === 'terrain'
    ? `/client/terrains/${props.id}`
    : `/client/maisons/${props.id}`;

  return (
    <Link
      to={href}
      className="group block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-accent via-muted to-secondary overflow-hidden">
        {props.cover ? (
          <img src={props.cover} alt={props.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 font-display text-5xl">
            {props.type === 'terrain' ? '◰' : '⌂'}
          </div>
        )}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <StatusBadge statut={props.statut} />
          {props.badge && (
            <span className="text-[10px] font-semibold uppercase tracking-wide bg-primary text-primary-foreground px-2 py-1 rounded">
              {props.badge}
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background"
        >
          <Heart size={15} className="text-foreground/70" />
        </button>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight line-clamp-1">{props.titre}</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={12} /> {props.quartier}, {props.ville}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
          <span className="inline-flex items-center gap-1"><Maximize2 size={12}/> {props.surface_m2.toLocaleString('fr-FR')} m²</span>
          {props.type === 'maison' && (
            <>
              <span className="inline-flex items-center gap-1"><BedDouble size={12}/> {props.chambres}</span>
              <span className="inline-flex items-center gap-1"><Bath size={12}/> {props.salles_de_bain}</span>
            </>
          )}
        </div>
        <div className="pt-2 flex items-baseline justify-between">
          <span className="font-display text-lg font-bold text-primary">{xaf(props.prix)}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {props.type === 'terrain' ? 'Terrain' : (props as MaisonCardProps).typeMaison}
          </span>
        </div>
      </div>
    </Link>
  );
}
