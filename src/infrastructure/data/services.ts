import { FileSearch, Home, Map, Ruler, FileCheck2, Compass, Building, Banknote, HardHat, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Service {
  id: string;
  titre: string;
  description: string;
  details: string[];
  prixIndicatif?: string;
  icon: LucideIcon;
  categorie: 'audit' | 'vente' | 'gestion';
}

export const services: Service[] = [
  {
    id: 'audit-foncier',
    titre: 'Audit foncier complet',
    description: "Vérification approfondie du titre foncier, des bornes et de l'historique du terrain.",
    details: ['Vérification titre foncier', 'Contrôle bornage GPS', 'Historique cadastral', 'Rapport détaillé sous 72h'],
    prixIndicatif: 'À partir de 150 000 XAF',
    icon: FileSearch, categorie: 'audit',
  },
  {
    id: 'audit-immobilier',
    titre: 'Audit technique immobilier',
    description: 'Évaluation structurelle et estimation de la valeur réelle de votre bien.',
    details: ['Diagnostic structurel', 'Estimation marché', 'Conformité réglementaire', 'Recommandations travaux'],
    prixIndicatif: 'À partir de 250 000 XAF',
    icon: ShieldCheck, categorie: 'audit',
  },
  {
    id: 'vente-terrain',
    titre: 'Vente de terrains',
    description: 'Catalogue de terrains bornés, titrés et vérifiés à Yaoundé, Douala et au-delà.',
    details: ['Terrains titrés', 'Visualisation 3D Cesium', 'Accompagnement notarial', 'Financement possible'],
    icon: Map, categorie: 'vente',
  },
  {
    id: 'vente-maison',
    titre: 'Vente de maisons',
    description: 'Villas, duplex, appartements et bureaux soigneusement sélectionnés.',
    details: ['Visite guidée', 'Photos & vidéos HD', 'Négociation incluse', 'Suivi des actes'],
    icon: Home, categorie: 'vente',
  },
  {
    id: 'bornage',
    titre: 'Bornage GPS de précision',
    description: 'Délimitation précise de votre parcelle par nos géomètres agréés.',
    details: ['Géomètre assermenté', 'Coordonnées GPS', 'Plan parcellaire', 'PV de bornage'],
    prixIndicatif: 'À partir de 200 000 XAF',
    icon: Ruler, categorie: 'audit',
  },
  {
    id: 'titre-foncier',
    titre: 'Établissement de titre foncier',
    description: "Accompagnement complet pour l'obtention de votre titre foncier.",
    details: ['Dossier complet', 'Suivi administratif', 'Représentation', 'Délais maîtrisés'],
    icon: FileCheck2, categorie: 'gestion',
  },
  {
    id: 'lotissement',
    titre: 'Lotissement & viabilisation',
    description: 'Découpage parcellaire et études de viabilisation de vos terrains.',
    details: ['Plan de lotissement', 'Études techniques', 'Viabilisation', 'Commercialisation'],
    icon: Compass, categorie: 'gestion',
  },
  {
    id: 'construction',
    titre: 'Suivi de construction',
    description: 'Maîtrise d\'œuvre et suivi de chantier de A à Z.',
    details: ['Plans architecturaux', 'Coordination chantier', 'Contrôle qualité', 'Réception travaux'],
    icon: HardHat, categorie: 'gestion',
  },
  {
    id: 'gestion-locative',
    titre: 'Gestion locative',
    description: 'Gestion complète de vos biens en location.',
    details: ['Recherche locataires', 'Encaissement loyers', 'Entretien biens', 'Reporting mensuel'],
    icon: Building, categorie: 'gestion',
  },
  {
    id: 'financement',
    titre: 'Conseil en financement',
    description: 'Accompagnement pour vos crédits immobiliers et plans de financement.',
    details: ['Étude de capacité', 'Comparaison banques', 'Constitution dossier', 'Négociation taux'],
    icon: Banknote, categorie: 'gestion',
  },
];
