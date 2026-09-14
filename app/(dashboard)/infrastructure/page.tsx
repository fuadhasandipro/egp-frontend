'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ticketsService } from '@/services/tickets.service';
import { extractErrorMessage } from '@/lib/utils';
import { InfrastructureRequest } from '@/types';

export default function InfrastructurePage() {
  const { role } = useAuth();
  const [requests, setRequests] = useState<InfrastructureRequest[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [itemType, setItemType] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isHeadTeacher = role === 'head_teacher';

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemType.trim() || quantity <= 0) return;

    setSubmitting(true);
    setError(null);
    try {
      const created = await ticketsService.createInfrastructureRequest({
        itemType: itemType.trim(),
        quantity: Number(quantity),
      });

      setRequests((prev) => [created, ...prev]);
      setSuccessMsg('Infrastructure request submitted successfully!');
      setIsCreating(false);
      setItemType('');
      setQuantity(1);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to submit infrastructure request'));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Infrastructure Requests</h1>
          <p className="text-sm text-gray-500">
            Request new furniture, benches, computers, or lab equipment for your school
          </p>
        </div>
        {isHeadTeacher && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition shadow-sm"
          >
            {isCreating ? 'Cancel' : '+ New Request'}
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-sm font-medium">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Create Form */}
      {isCreating && (
        <form onSubmit={handleCreateRequest} className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Create Infrastructure Request</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Type / Description</label>
              <input
                type="text"
                required
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                placeholder="e.g. Wooden Benches, Desktop Computers, Whiteboards"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      )}

      {/* Requests History List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Submitted Requests</h2>
        {requests.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-lg text-sm text-gray-500">
            {isHeadTeacher
              ? 'No infrastructure requests created yet. Click "+ New Request" to request items for your school.'
              : 'No infrastructure requests available.'}
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs border-b">
                <tr>
                  <th className="p-3">Item Requested</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Requested Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req, idx) => (
                  <tr key={req.id || idx} className="hover:bg-gray-50 transition">
                    <td className="p-3 font-medium text-gray-800">{req.itemType}</td>
                    <td className="p-3 font-mono text-gray-700">{req.quantity}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusBadge(req.status || 'Pending')}`}>
                        {req.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
