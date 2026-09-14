'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';

const rows = [
  { date: '15 Sep 2026', in: '08:41 AM', out: '—', status: 'Present' },
  { date: '14 Sep 2026', in: '08:36 AM', out: '04:12 PM', status: 'Present' },
  { date: '13 Sep 2026', in: '08:58 AM', out: '04:05 PM', status: 'Late' },
];

export default function AttendancePage() {
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [attendanceRows, setAttendanceRows] = useState(rows);

  useEffect(() => {
    apiClient.get('/api/attendance?page=1&limit=10&sortBy=date&order=DESC').then((response) => {
      const items = response.data?.data?.items;
      if (Array.isArray(items)) setAttendanceRows(items.map((item: { date: string; status: string }) => ({ date: item.date, in: 'Recorded', out: '—', status: item.status })));
    }).catch(() => undefined);
  }, []);

  async function checkIn() {
    setLoading(true);
    const sendCheckIn = async (lat: number, lng: number) => { try { await apiClient.post('/api/attendance/check-in', { lat, lng }); setMessage('Attendance checked in successfully.'); setCheckedIn(true); } catch { setMessage('Check-in failed. Make sure you are within your institution and try again.'); } finally { setLoading(false); } };
    if (!navigator.geolocation) return sendCheckIn(23.8103, 90.4125);
    navigator.geolocation.getCurrentPosition((position) => sendCheckIn(position.coords.latitude, position.coords.longitude), () => { setMessage('Location permission is required for attendance check-in.'); setLoading(false); });
  }

  return <div className="space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Member 2 · Attendance</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Attendance</h1><p className="mt-2 text-sm text-gray-500">Record your daily presence and review recent attendance history.</p></div>
    <div className="grid gap-6 xl:grid-cols-[.75fr_1.5fr]">
      <section className="rounded-2xl border border-white bg-white/80 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Today · 15 September 2026</p>
        <h2 className="mt-3 text-xl font-bold">Good morning</h2>
        <div className="my-6 grid place-items-center rounded-2xl bg-emerald-50 py-8"><div className={`grid h-24 w-24 place-items-center rounded-full border-8 ${checkedIn ? 'border-emerald-200 text-emerald-600' : 'border-white text-emerald-700'} bg-white text-3xl shadow-sm`}>{checkedIn ? '✓' : '↗'}</div><p className="mt-4 text-sm font-semibold">{checkedIn ? 'Checked in' : 'Not checked in'}</p></div>
        <button onClick={checkIn} disabled={checkedIn || loading} className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-gray-300">{loading ? 'Checking…' : checkedIn ? 'Attendance recorded' : 'Check in now'}</button>
        {message && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{message}</p>}
      </section>
      <section className="rounded-2xl border border-white bg-white/80 p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Recent records</p><h2 className="mt-1 text-xl font-bold">Attendance log</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm"><thead className="border-b text-xs text-gray-400"><tr><th className="pb-3">Date</th><th className="pb-3">Check in</th><th className="pb-3">Check out</th><th className="pb-3">Status</th></tr></thead><tbody>{attendanceRows.map(row => <tr key={row.date} className="border-b last:border-0"><td className="py-4 font-medium">{row.date}</td><td className="py-4 text-gray-500">{row.in}</td><td className="py-4 text-gray-500">{row.out}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === 'Late' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{row.status}</span></td></tr>)}</tbody></table></div></section>
    </div>
  </div>;
}
