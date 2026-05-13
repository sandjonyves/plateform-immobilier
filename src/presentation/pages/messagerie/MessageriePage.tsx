import { useState } from 'react';
import { Search, Send, Paperclip, Phone, Video, MoreVertical, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '../../components/shared/PageHeader';

interface Conversation {
  id: string; nom: string; role: string; dernier: string; date: Date;
  nonLus: number; messages: { from: 'me' | 'them'; text: string; date: Date }[];
}

const now = Date.now();
const conversations: Conversation[] = [
  { id: 'c1', nom: 'Aminatou Bello', role: 'Cliente', dernier: 'Bonjour, est-ce que la villa Bastos est toujours disponible ?', date: new Date(now - 5 * 60000), nonLus: 2,
    messages: [
      { from: 'them', text: 'Bonjour Marie, j\'ai vu votre annonce.', date: new Date(now - 60 * 60000) },
      { from: 'me', text: 'Bonjour Aminatou ! Oui je peux vous renseigner.', date: new Date(now - 50 * 60000) },
      { from: 'them', text: 'Bonjour, est-ce que la villa Bastos est toujours disponible ?', date: new Date(now - 5 * 60000) },
    ] },
  { id: 'c2', nom: 'Eric Fotso', role: 'Client', dernier: 'Parfait, je signe demain à 14h.', date: new Date(now - 2 * 3600000), nonLus: 0,
    messages: [
      { from: 'me', text: 'Le notaire confirme le rendez-vous.', date: new Date(now - 3 * 3600000) },
      { from: 'them', text: 'Parfait, je signe demain à 14h.', date: new Date(now - 2 * 3600000) },
    ] },
  { id: 'c3', nom: 'Paul Mbarga', role: 'Agent', dernier: 'J\'ai uploadé les photos du duplex.', date: new Date(now - 5 * 3600000), nonLus: 1,
    messages: [
      { from: 'them', text: 'J\'ai uploadé les photos du duplex.', date: new Date(now - 5 * 3600000) },
    ] },
  { id: 'c4', nom: 'Linda Kamga', role: 'Cliente', dernier: 'Merci pour la visite hier.', date: new Date(now - 26 * 3600000), nonLus: 0,
    messages: [
      { from: 'them', text: 'Merci pour la visite hier.', date: new Date(now - 26 * 3600000) },
    ] },
  { id: 'c5', nom: 'Patrick Onana', role: 'Client', dernier: 'À quelle heure demain ?', date: new Date(now - 2 * 86400000), nonLus: 0,
    messages: [
      { from: 'them', text: 'À quelle heure demain ?', date: new Date(now - 2 * 86400000) },
    ] },
];

export function MessageriePage() {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [draft, setDraft] = useState('');
  const active = conversations.find(c => c.id === activeId)!;

  return (
    <div className="space-y-6">
      <PageHeader titre="Messagerie" sous_titre="Conversations clients et agents" />

      <div className="bg-card border border-border rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] h-[calc(100vh-220px)] min-h-[500px]">
        {/* Sidebar */}
        <aside className="border-r border-border flex flex-col">
          <div className="p-3 border-b border-border flex items-center gap-2">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input placeholder="Rechercher…" className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background" />
            </div>
            <button className="h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center">
              <Edit size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(c => (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={`w-full text-left p-3 border-b border-border hover:bg-secondary/60 transition-colors ${activeId === c.id ? 'bg-secondary/80' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                    {c.nom.split(' ').map(p => p[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{c.nom}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDistanceToNow(c.date, { locale: fr, addSuffix: false })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.dernier}</p>
                  </div>
                  {c.nonLus > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">{c.nonLus}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Conversation */}
        <section className="flex flex-col min-w-0">
          <div className="p-3 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground text-xs font-semibold">
              {active.nom.split(' ').map(p => p[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{active.nom}</div>
              <div className="text-xs text-muted-foreground">{active.role} · en ligne</div>
            </div>
            <button className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center"><Phone size={15} /></button>
            <button className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center"><Video size={15} /></button>
            <button className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center"><MoreVertical size={15} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gradient-to-b from-background to-secondary/30">
            {active.messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-sm shadow-sm ${
                  m.from === 'me' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-card border border-border rounded-bl-sm'
                }`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.from === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {formatDistanceToNow(m.date, { locale: fr, addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-border flex items-center gap-2">
            <button className="h-9 w-9 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground"><Paperclip size={16} /></button>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Écrire un message…"
              className="flex-1 h-9 px-3 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/40" />
            <button className="h-9 px-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 text-sm font-medium">
              <Send size={14} /> Envoyer
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
