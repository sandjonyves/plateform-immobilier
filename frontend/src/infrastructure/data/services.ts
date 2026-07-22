/**
 * Types + mapping d’icônes Lucide pour les services API.
 * Plus de catalogue statique — les données viennent de /api/v1/services/.
 */
import {
  Banknote,
  Briefcase,
  Compass,
  FileCheck2,
  FileSearch,
  HardHat,
  Home,
  Map,
  Ruler,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export type ServiceCategorie = 'audit' | 'vente' | 'gestion';

export interface Service {
  id: string;
  titre: string;
  slug: string;
  description: string;
  details: string[];
  prixIndicatif?: string;
  icon: string;
  categorie: ServiceCategorie;
  ordre: number;
  actif: boolean;
  phare: boolean;
}

const ICON_MAP: Record<string, LucideIcon> = {
  FileSearch,
  ShieldCheck,
  Map,
  Home,
  Ruler,
  FileCheck2,
  Compass,
  HardHat,
  Banknote,
  Briefcase,
};

export function resolveServiceIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Briefcase;
}

export const SERVICE_ICON_OPTIONS = Object.keys(ICON_MAP);
