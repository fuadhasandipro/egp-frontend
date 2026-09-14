'use client';

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/axios';

type Leave = { id: string; reason: string; startDate: string; endDate: string; status: string; user?: { email?: string; profile?: { fullName?: string } } };
type EventItem = { id: string; date: string; eventName: string; isHoliday: boolean };

function daysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }

export default function CalendarPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    Promise.all([apiClient.get('/api/leave-requests?calendar=true'), apiClient.get(`/api/calendar?month=${monthKey}`)])
      .then(([leaveResponse, calendarResponse]) => {
        const leaveData = leaveResponse.data?.data;
        const calendarData = calendarResponse.data?.data;
        setLeaves(Array.isArray(leaveData) ? leaveData : leaveData?.items || []);
        setEvents(Array.isArray(calendarData) ? calendarData : []);
      }).catch(() => undefined);
  }, [month, year]);

  const monthDays = useMemo(() => Array.from({ length: daysInMonth(year, month) }, (_, index) => index + 1), [month, year]);
  const changeMonth = (offset: number) => { const next = new Date(year, month + offset, 1); setMonth(next.getMonth()); setYear(next.getFullYear()); };
  const dateKey = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const leavesOn = (date: string) => leaves.filter(leave => leave.startDate <= date && leave.endDate >= date);
  const eventOn = (date: string) => events.filter(event => event.date === date);

  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Attendance & leave</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Calendar</h1><p className="mt-2 text-sm text-gray-500">View monthly leave schedules and official academic calendar events.</p></div><div className="flex items-center gap-2"><button onClick={() => changeMonth(-1)} className="rounded-lg border bg-white px-3 py-2 text-sm">←</button><span className="min-w-32 text-center text-sm font-semibold">{new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span><button onClick={() => changeMonth(1)} className="rounded-lg border bg-white px-3 py-2 text-sm">→</button></div></div><section className="rounded-2xl border border-white bg-white/80 p-5 shadow-sm"><div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-gray-400">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{day}</div>)}{Array.from({ length: new Date(year, month, 1).getDay() }).map((_, index) => <div key={`empty-${index}`} />)}{monthDays.map(day => { const key = dateKey(day); const dayLeaves = leavesOn(key); const dayEvents = eventOn(key); return <div key={key} className={`min-h-24 rounded-xl border p-2 text-left ${dayLeaves.length || dayEvents.length ? 'border-emerald-200 bg-emerald-50/60' : 'border-gray-100 bg-white'}`}><p className="text-xs font-bold text-gray-700">{day}</p>{dayEvents.map(event => <p key={event.id} className="mt-2 truncate rounded bg-blue-100 px-1.5 py-1 text-[10px] font-semibold text-blue-700">{event.eventName}</p>)}{dayLeaves.map(leave => <p key={leave.id} className={`mt-1 truncate rounded px-1.5 py-1 text-[10px] font-semibold ${leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`} title={leave.reason}>{leave.user?.profile?.fullName || leave.user?.email || 'Staff leave'} · {leave.status}</p>)}</div>; })}</div></section><div className="flex flex-wrap gap-3 text-xs text-gray-500"><span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Approved leave</span><span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Pending leave</span><span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Academic event</span></div></div>;
}
