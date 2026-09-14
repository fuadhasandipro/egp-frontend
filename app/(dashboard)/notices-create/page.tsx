'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import apiClient from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

export default function CreateNoticePage() {
  const { role } = useAuth();
  const [form, setForm] = useState({ title: '', content: '' });
  const [message, setMessage] = useState('');
  const allowed = ['admin', 'to', 'ato', 'head_teacher'].includes(role || '');
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.title || !form.content) return setMessage('Enter a title and notice details.');
    try { await apiClient.post('/api/notices', form); setMessage('Notice published successfully.'); setForm({ title: '', content: '' }); }
    catch (error: any) { const apiMessage = error.response?.data?.message; const safeMessage = Array.isArray(apiMessage) ? apiMessage.join(', ') : typeof apiMessage === 'object' && apiMessage !== null ? apiMessage.message || JSON.stringify(apiMessage) : apiMessage; setMessage(String(safeMessage || 'Notice could not be published. Check your institution assignment.')); }
  }
  if (!allowed) return <div className="rounded-2xl bg-white p-6 shadow-sm"><h1 className="text-xl font-bold">Create notice</h1><p className="mt-2 text-sm text-gray-500">Only Admin, TO, ATO, and Head Teacher accounts can publish notices.</p></div>;
  const audience = role === 'admin' ? 'Everyone' : role === 'head_teacher' ? 'Teachers' : role === 'ato' ? 'Head Teachers' : 'ATO, Head Teachers, and Teachers';
  return <div className="space-y-6"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Communication</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Create notice</h1><p className="mt-2 text-sm text-gray-500">Your role determines who receives this notice.</p></div><Link href="/notices-board" className="text-sm font-semibold text-emerald-700">← Notice board</Link></div><form onSubmit={submit} className="max-w-2xl rounded-2xl border border-white bg-white/80 p-6 shadow-sm"><label className="block text-sm font-medium">Title<input className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label><label className="mt-4 block text-sm font-medium">Notice details<textarea className="mt-1 min-h-40 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></label><p className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">Audience: {audience}</p><button className="mt-5 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">Publish notice</button>{message && <p className="mt-3 text-xs text-gray-500">{message}</p>}</form></div>;
}
