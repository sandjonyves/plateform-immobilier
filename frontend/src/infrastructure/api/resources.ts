import { apiListAll, apiRequest } from './client';
import type { MaisonPlain, StatutMaison, TypeMaison } from '../mock-data/maisons.mock';
import type { UtilisateurPlain } from '../mock-data/utilisateurs.mock';
import type { VentePlain } from '../mock-data/ventes.mock';
import type { Evenement, TypeEvenement } from '../../application/store/agendaStore';
import type { TerrainPlain } from '../../domains/terrain/entities/Terrain';
import type { StatutTerrain } from '../../domains/terrain/value-objects/StatutTerrain';

function num(v: unknown): number {
  return typeof v === 'number' ? v : Number(v);
}

export async function fetchTerrains(): Promise<TerrainPlain[]> {
  const rows = await apiListAll<Record<string, unknown>>('/terrains/', { auth: false });
  return rows.map((t) => ({
    id: String(t.id),
    titre: String(t.titre),
    bornes: (t.bornes as { latitude: number; longitude: number }[]) ?? [],
    surface_m2: num(t.surface_m2),
    statut: t.statut as StatutTerrain,
    prix: num(t.prix),
    ville: String(t.ville),
    quartier: String(t.quartier),
    description: String(t.description ?? ''),
    titre_foncier: String(t.titre_foncier ?? ''),
    agent_id: String(t.agent_id ?? t.created_by_id ?? ''),
    photos: (t.photos as string[]) ?? [],
    documents: (t.documents as string[]) ?? [],
    date_ajout: String(t.date_ajout),
  }));
}

export async function createTerrainApi(input: {
  titre: string;
  bornes: { latitude: number; longitude: number }[];
  statut: string;
  prix: number;
  ville: string;
  quartier: string;
  description: string;
  titre_foncier: string;
}): Promise<TerrainPlain> {
  const t = await apiRequest<Record<string, unknown>>('/terrains/', {
    method: 'POST',
    body: { ...input, photos: [], videos: [], documents: [] },
  });
  return {
    id: String(t.id),
    titre: String(t.titre),
    bornes: (t.bornes as { latitude: number; longitude: number }[]) ?? [],
    surface_m2: num(t.surface_m2),
    statut: t.statut as StatutTerrain,
    prix: num(t.prix),
    ville: String(t.ville),
    quartier: String(t.quartier),
    description: String(t.description ?? ''),
    titre_foncier: String(t.titre_foncier ?? ''),
    agent_id: String(t.agent_id ?? ''),
    photos: (t.photos as string[]) ?? [],
    documents: (t.documents as string[]) ?? [],
    date_ajout: String(t.date_ajout),
  };
}

export async function fetchMaisons(): Promise<MaisonPlain[]> {
  const rows = await apiListAll<Record<string, unknown>>('/maisons/', { auth: false });
  return rows.map((m) => ({
    id: String(m.id),
    titre: String(m.titre),
    type: m.type as TypeMaison,
    statut: m.statut as StatutMaison,
    prix: num(m.prix),
    ville: String(m.ville),
    quartier: String(m.quartier),
    description: String(m.description ?? ''),
    surface_m2: num(m.surface_m2),
    surface_terrain_m2: m.surface_terrain_m2 != null ? num(m.surface_terrain_m2) : undefined,
    chambres: num(m.chambres),
    salles_de_bain: num(m.salles_de_bain),
    etages: num(m.etages),
    localisation: (m.localisation as { latitude: number; longitude: number }) ?? {
      latitude: num(m.latitude),
      longitude: num(m.longitude),
    },
    titre_foncier: m.titre_foncier ? String(m.titre_foncier) : undefined,
    date_ajout: String(m.date_ajout),
    photos: (m.photos as string[]) ?? [],
    videos: (m.videos as string[]) ?? [],
    documents: (m.documents as string[]) ?? [],
    agent_id: String(m.agent_id ?? m.created_by_id ?? ''),
  }));
}

export async function createMaisonApi(input: Record<string, unknown>): Promise<MaisonPlain> {
  const m = await apiRequest<Record<string, unknown>>('/maisons/', {
    method: 'POST',
    body: { ...input, documents: input.documents ?? [] },
  });
  return (await fetchMaisons()).find((x) => x.id === String(m.id)) ?? {
    id: String(m.id),
    titre: String(m.titre),
    type: m.type as TypeMaison,
    statut: m.statut as StatutMaison,
    prix: num(m.prix),
    ville: String(m.ville),
    quartier: String(m.quartier),
    description: String(m.description ?? ''),
    surface_m2: num(m.surface_m2),
    chambres: num(m.chambres),
    salles_de_bain: num(m.salles_de_bain),
    etages: num(m.etages),
    localisation: (m.localisation as { latitude: number; longitude: number }) ?? {
      latitude: num(m.latitude),
      longitude: num(m.longitude),
    },
    date_ajout: String(m.date_ajout),
    photos: (m.photos as string[]) ?? [],
    videos: (m.videos as string[]) ?? [],
    documents: [],
    agent_id: String(m.agent_id ?? ''),
  };
}

export async function fetchUtilisateurs(): Promise<UtilisateurPlain[]> {
  const rows = await apiListAll<Record<string, unknown>>('/utilisateurs/');
  return rows.map((u) => ({
    id: String(u.id),
    prenom: String(u.prenom),
    nom: String(u.nom),
    email: String(u.email),
    telephone: String(u.telephone ?? ''),
    role: (u.role === 'admin' ? 'admin' : 'client') as UtilisateurPlain['role'],
    statut: u.statut as UtilisateurPlain['statut'],
    avatar: u.avatar ? String(u.avatar) : undefined,
    date_inscription: String(u.date_inscription),
    derniere_connexion: String(u.derniere_connexion ?? u.date_inscription),
  }));
}

export async function createUtilisateurApi(input: {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  role: 'admin' | 'client';
  statut: 'actif' | 'suspendu';
  password?: string;
}): Promise<UtilisateurPlain> {
  const u = await apiRequest<Record<string, unknown>>('/utilisateurs/', {
    method: 'POST',
    body: { ...input, password: input.password || 'ChangeMe1!' },
  });
  return {
    id: String(u.id),
    prenom: String(u.prenom),
    nom: String(u.nom),
    email: String(u.email),
    telephone: String(u.telephone ?? ''),
    role: (u.role === 'admin' ? 'admin' : 'client') as UtilisateurPlain['role'],
    statut: u.statut as UtilisateurPlain['statut'],
    date_inscription: String(u.date_inscription),
    derniere_connexion: String(u.derniere_connexion ?? u.date_inscription),
  };
}

export async function fetchVentes(): Promise<VentePlain[]> {
  const rows = await apiListAll<Record<string, unknown>>('/ventes/');
  return rows.map((t) => ({
    id: String(t.id),
    type: t.type as VentePlain['type'],
    bien_id: String(t.bien_id),
    bien_type: t.bien_type as VentePlain['bien_type'],
    client_id: String(t.client_id),
    agent_id: String(t.agent_id ?? t.created_by_id ?? ''),
    montant: num(t.montant),
    statut: t.statut as VentePlain['statut'],
    date_vente: String(t.date_vente),
    documents: (t.documents as string[]) ?? [],
  }));
}

export async function createVenteApi(input: {
  type: 'vente';
  bien_id: string;
  bien_type: 'terrain' | 'maison';
  client_id: string;
  montant: number;
  statut: 'en_attente' | 'confirmee' | 'annulee';
}): Promise<VentePlain> {
  const t = await apiRequest<Record<string, unknown>>('/ventes/', {
    method: 'POST',
    body: input,
  });
  return {
    id: String(t.id),
    type: t.type as VentePlain['type'],
    bien_id: String(t.bien_id),
    bien_type: t.bien_type as VentePlain['bien_type'],
    client_id: String(t.client_id),
    agent_id: String(t.agent_id ?? t.created_by_id ?? ''),
    montant: num(t.montant),
    statut: t.statut as VentePlain['statut'],
    date_vente: String(t.date_vente),
    documents: (t.documents as string[]) ?? [],
  };
}

export async function fetchEvenements(): Promise<Evenement[]> {
  const rows = await apiListAll<Record<string, unknown>>('/evenements/');
  return rows.map((e) => ({
    id: String(e.id),
    titre: String(e.titre),
    type: e.type as TypeEvenement,
    date: String(e.date),
    heure: String(e.heure).slice(0, 5),
    lieu: String(e.lieu ?? ''),
    participants: Array.isArray(e.participants) ? (e.participants as string[]) : [],
  }));
}

export async function createEvenementApi(input: {
  titre: string;
  type: TypeEvenement;
  date: string;
  heure: string;
  lieu: string;
  participants: string;
}): Promise<Evenement> {
  const e = await apiRequest<Record<string, unknown>>('/evenements/', {
    method: 'POST',
    body: input,
  });
  return {
    id: String(e.id),
    titre: String(e.titre),
    type: e.type as TypeEvenement,
    date: String(e.date),
    heure: String(e.heure).slice(0, 5),
    lieu: String(e.lieu ?? ''),
    participants: Array.isArray(e.participants) ? (e.participants as string[]) : [],
  };
}

export interface DocumentDto {
  id: string;
  nom: string;
  type: 'contrat' | 'titre_foncier' | 'permis' | 'photo' | 'autre';
  taille_kb: number;
  bien_associe: string;
  date_ajout: string;
  ajoute_par: string;
  fichier_url?: string | null;
}

export async function fetchDocuments(): Promise<DocumentDto[]> {
  const rows = await apiListAll<Record<string, unknown>>('/documents/');
  return rows.map((d) => ({
    id: String(d.id),
    nom: String(d.nom),
    type: d.type as DocumentDto['type'],
    taille_kb: num(d.taille_kb),
    bien_associe: String(d.bien_associe ?? ''),
    date_ajout: String(d.date_ajout),
    ajoute_par: String(d.ajoute_par_nom ?? ''),
    fichier_url: d.fichier_url ? String(d.fichier_url) : null,
  }));
}

export async function uploadDocumentApi(input: {
  nom: string;
  type: string;
  fichier: File;
  bien_associe?: string;
}): Promise<DocumentDto> {
  const fd = new FormData();
  fd.append('nom', input.nom);
  fd.append('type', input.type);
  fd.append('fichier', input.fichier);
  fd.append('bien_type', 'aucun');
  if (input.bien_associe) fd.append('bien_associe', input.bien_associe);
  const d = await apiRequest<Record<string, unknown>>('/documents/', {
    method: 'POST',
    formData: fd,
  });
  return {
    id: String(d.id),
    nom: String(d.nom),
    type: d.type as DocumentDto['type'],
    taille_kb: num(d.taille_kb),
    bien_associe: String(d.bien_associe ?? ''),
    date_ajout: String(d.date_ajout),
    ajoute_par: String(d.ajoute_par_nom ?? ''),
    fichier_url: d.fichier_url ? String(d.fichier_url) : null,
  };
}

export async function deleteDocumentApi(id: string): Promise<void> {
  await apiRequest(`/documents/${id}/`, { method: 'DELETE' });
}

export async function fetchOverview(): Promise<Record<string, number>> {
  return apiRequest('/analytics/overview/');
}

export async function fetchRapports(): Promise<Record<string, unknown>> {
  return apiRequest('/analytics/rapports/');
}

export async function fetchCarte(): Promise<{
  terrains: unknown[];
  maisons: unknown[];
}> {
  return apiRequest('/carte/', { auth: false });
}
