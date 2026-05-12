export interface UtilisateurPlain {
  id: string; nom: string; prenom: string; email: string; telephone: string;
  role: 'admin' | 'agent' | 'client'; statut: 'actif' | 'suspendu';
  avatar?: string; date_inscription: string; derniere_connexion: string;
}

const u = (id: string, prenom: string, nom: string, role: UtilisateurPlain['role'],
  statut: UtilisateurPlain['statut'], jours: number): UtilisateurPlain => ({
  id, nom, prenom, role, statut,
  email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@immopro.cm`,
  telephone: '+237 6' + Math.floor(10000000 + Math.random() * 89999999),
  date_inscription: new Date(Date.now() - 365 * 86400000).toISOString(),
  derniere_connexion: new Date(Date.now() - jours * 86400000).toISOString(),
});

export const utilisateursMock: UtilisateurPlain[] = [
  u('agent-1', 'Marie', 'Ngono', 'agent', 'actif', 0),
  u('agent-2', 'Paul', 'Mbarga', 'agent', 'actif', 1),
  u('agent-3', 'Sophie', 'Eyenga', 'agent', 'actif', 2),
  u('admin-1', 'Jean', 'Tchoumi', 'admin', 'actif', 0),
  u('client-1', 'Aminatou', 'Bello', 'client', 'actif', 3),
  u('client-2', 'Eric', 'Fotso', 'client', 'actif', 5),
  u('client-3', 'Linda', 'Kamga', 'client', 'suspendu', 30),
  u('client-4', 'Patrick', 'Onana', 'client', 'actif', 7),
];
