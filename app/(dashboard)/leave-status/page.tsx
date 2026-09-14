'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';

export default function LeaveStatusPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiClient.get('/api/leave-requests').then(res => { const data = res.data?.data; setRequests(Array.isArray(data) ? data : data?.items || []); }).finally(() => setLoading(false)); }, []);
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Teacher portal</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Leave status</h1><p className="mt-2 text-sm text-gray-500">Your leave request status updates here after the head teacher reviews it.</p></div><Link href="/leave-requests" className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">Submit new leave</Link></div><section className="rounded-2xl border border-white bg-white/80 p-6 shadow-sm"><div className="space-y-3">{loading && <p className="text-sm text-gray-500">Loading requests…</p>}{requests.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4"><div><p className="font-semibold">{item.reason}</p><p className="mt-1 text-xs text-gray-500">{item.startDate} → {item.endDate}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : item.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{item.status}</span></div>)}{!loading && requests.length === 0 && <p className="py-8 text-center text-sm text-gray-500">No leave requests yet.</p>}</div></section></div>;
}
