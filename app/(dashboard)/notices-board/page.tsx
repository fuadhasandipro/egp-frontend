'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';

export default function NoticeBoardPage() {
  const [notices, setNotices] = useState<any[]>([]);
  useEffect(() => { apiClient.get('/api/notices?page=1&limit=20&sortBy=createdAt&order=DESC').then(res => { const data = res.data?.data?.items; if (Array.isArray(data)) setNotices(data); }).catch(() => undefined); }, []);
  return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Education updates</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Notice board</h1><p className="mt-2 text-sm text-gray-500">Notices published by the TO, ATO, head teacher, or administration.</p></div><section className="rounded-2xl border border-white bg-white/80 p-6 shadow-sm"><div className="space-y-4">{notices.map(notice => <article key={notice.id} className="rounded-xl border border-gray-100 bg-white p-4"><h2 className="font-semibold text-gray-900">{notice.title}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{notice.content}</p><p className="mt-3 text-xs text-gray-400">Published {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : 'recently'} · Given by <span className="font-semibold text-gray-700">{notice.createdBy?.profile?.fullName || notice.createdBy?.email || 'Education office'}</span>{notice.createdBy?.role?.name ? ` (${notice.createdBy.role.name.replace('_', ' ')})` : ''}</p></article>)}{notices.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No notices available.</p>}</div></section></div>;
}
