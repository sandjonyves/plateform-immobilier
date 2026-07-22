import { useEffect, useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalIcon, MapPin, Users, FileSignature } from 'lucide-react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PageHeader } from '../../components/shared/PageHeader';
import { EvenementForm } from '../../components/forms/EvenementForm';
import { useAgendaStore, type TypeEvenement } from '../../../application/store/agendaStore';

type EvtType = TypeEvenement;

const today = new Date();

const typeStyle: Record<EvtType, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  visite: { bg: 'bg-info/15 text-info border-info/30', text: 'text-info', icon: <MapPin size={12} />, label: 'Visite' },
  signature: { bg: 'bg-success/15 text-success border-success/30', text: 'text-success', icon: <FileSignature size={12} />, label: 'Signature' },
  reunion: { bg: 'bg-warning/15 text-warning border-warning/30', text: 'text-warning', icon: <Users size={12} />, label: 'Réunion' },
};

export function AgendaPage() {
  const { evenements, charger } = useAgendaStore();
  const [cursor, setCursor] = useState(today);
  const [selected, setSelected] = useState(today);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => { charger(); }, [charger]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, typeof evenements>();
    evenements.forEach(e => {
      const arr = map.get(e.date) ?? [];
      arr.push(e); map.set(e.date, arr);
    });
    return map;
  }, [evenements]);

  const dayEvents = eventsByDay.get(format(selected, 'yyyy-MM-dd')) ?? [];

  return (
    <>
    <div className="space-y-6">
      <PageHeader
        titre="Agenda"
        sous_titre="Visites, signatures et réunions"
        actions={
          <button onClick={() => setOpenForm(true)} className="h-9 px-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5">
            <Plus size={15} /> Nouvel événement
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold capitalize">{format(cursor, 'MMMM yyyy', { locale: fr })}</h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setCursor(today)} className="h-8 px-3 text-xs rounded-md border border-border hover:bg-secondary">Aujourd'hui</button>
              <button onClick={() => setCursor(addMonths(cursor, -1))} className="h-8 w-8 rounded-md border border-border hover:bg-secondary flex items-center justify-center"><ChevronLeft size={14} /></button>
              <button onClick={() => setCursor(addMonths(cursor, 1))} className="h-8 w-8 rounded-md border border-border hover:bg-secondary flex items-center justify-center"><ChevronRight size={14} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} className="text-center py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const k = format(d, 'yyyy-MM-dd');
              const evts = eventsByDay.get(k) ?? [];
              const inMonth = isSameMonth(d, cursor);
              const isSel = isSameDay(d, selected);
              const isToday = isSameDay(d, today);
              return (
                <button key={k} onClick={() => setSelected(d)}
                  className={`relative aspect-square rounded-lg p-1.5 text-left transition-colors border ${
                    isSel ? 'border-primary bg-primary/5' :
                    isToday ? 'border-primary/40 bg-primary/5' :
                    'border-transparent hover:bg-secondary/60'
                  } ${!inMonth ? 'opacity-40' : ''}`}>
                  <div className={`text-xs font-medium ${isToday ? 'text-primary' : ''}`}>{format(d, 'd')}</div>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {evts.slice(0, 3).map(e => (
                      <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${
                        e.type === 'visite' ? 'bg-info' : e.type === 'signature' ? 'bg-success' : 'bg-warning'
                      }`} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <CalIcon size={16} className="text-primary" />
            <h3 className="font-display font-semibold capitalize">{format(selected, 'EEEE d MMMM', { locale: fr })}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{dayEvents.length} événement(s)</p>

          <div className="space-y-3">
            {dayEvents.map(e => {
              const s = typeStyle[e.type];
              return (
                <div key={e.id} className="border border-border rounded-lg p-3 hover:bg-secondary/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="font-medium text-sm">{e.titre}</div>
                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-medium px-1.5 py-0.5 rounded border ${s.bg}`}>{s.icon}{s.label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>🕒 {e.heure}</div>
                    <div className="flex items-center gap-1"><MapPin size={11} /> {e.lieu}</div>
                    <div className="flex items-center gap-1"><Users size={11} /> {e.participants.join(', ')}</div>
                  </div>
                </div>
              );
            })}
            {dayEvents.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">Aucun événement ce jour.</div>
            )}
          </div>
        </div>
      </div>
    </div>
    <EvenementForm open={openForm} onClose={() => setOpenForm(false)} defaultDate={format(selected, 'yyyy-MM-dd')} />
    </>
  );
}
