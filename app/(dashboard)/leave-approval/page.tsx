'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

export default function LeaveApprovalPage() {
  const { role } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const load = () => apiClient.get('/api/leave-requests').then(res => { const data = res.data?.data; setRequests(Array.isArray(data) ? data : data?.items || []); }).catch(() => setMessage('Could not load leave requests.'));
  useEffect(() => { load(); }, []);
  async function updateStatus(id: string, status: 'Approved' | 'Rejected') { try { await apiClient.patch(`/api/leave-requests/${id}/status`, { status }); setMessage(`Request ${status.toLowerCase()} successfully.`); load(); } catch { setMessage('Only the head teacher can approve or reject requests.'); } }
  if (role !== 'head_teacher' && role !== 'admin') return <div className="rounded-2xl bg-white p-6 shadow-sm"><h1 className="text-xl font-bold">Leave approval</h1><p className="mt-2 text-sm text-gray-500">This page is available to the head teacher.</p></div>;
  return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Head teacher approval</p><h1 className="mt-2 text-3xl font-bold text-gray-900">Leave approvals</h1><p className="mt-2 text-sm text-gray-500">Review leave requests from staff in your institution.</p></div><section className="rounded-2xl border border-white bg-white/80 p-6 shadow-sm"><div className="space-y-3">{requests.filter(item => item.status === 'Pending').map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4"><div><p className="font-semibold">{item.user?.profile?.fullName || item.user?.email || 'Staff member'}</p><p className="mt-1 text-sm text-gray-500">{item.startDate} → {item.endDate}</p><p className="mt-1 text-sm text-gray-600">{item.reason}</p></div><div className="flex gap-2"><button onClick={() => updateStatus(item.id, 'Approved')} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white">Approve</button><button onClick={() => updateStatus(item.id, 'Rejected')} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">Reject</button></div></div>)}{!requests.some(item => item.status === 'Pending') && <p className="py-8 text-center text-sm text-gray-500">No pending leave requests.</p>}</div>{message && <p className="mt-4 text-xs text-gray-500">{message}</p>}</section></div>;
}
