'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { inspectionsService } from '@/services/inspections.service';
import { extractErrorMessage } from '@/lib/utils';
import { Inspection } from '@/types';

export default function InspectionsPage() {
  const { role } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Create Inspection Modal state
  const [isCreating, setIsCreating] = useState(false);
  const [institutionId, setInstitutionId] = useState('');
  const [score, setScore] = useState<number>(80);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOfficer = role === 'officer';

  const fetchInspections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inspectionsService.findAllInspections({ page, limit });

      if (res && res.items) {
        setInspections(res.items);
        setTotal(res.meta?.total || 0);
      } else {
        setInspections([]);
        setTotal(0);
      }
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to load inspections'));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await inspectionsService.createInspection({
        institutionId: institutionId.trim(),
        score,
        notes: notes.trim() || undefined,
      });
      setSuccessMsg('Inspection recorded successfully!');
      setIsCreating(false);
      setInstitutionId('');
      setScore(80);
      setNotes('');
      fetchInspections();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to create inspection'));
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const getScoreBadge = (s: number) => {
    if (s >= 80) return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    if (s >= 50) return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    return 'bg-red-100 text-red-800 border border-red-300';
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Institution Inspections</h1>
          <p className="text-sm text-gray-500">
            Record and review institution inspection scores
          </p>
        </div>
        {isOfficer && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition shadow-sm"
          >
            {isCreating ? 'Cancel' : '+ New Inspection'}
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

      {/* Form: Create Inspection */}
      {isCreating && (
        <form onSubmit={handleCreateInspection} className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Record New Inspection</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution ID</label>
              <input
                type="text"
                required
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                placeholder="Institution UUID"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-100)</label>
              <input
                type="number"
                required
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations about the institution..."
              className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
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
              {submitting ? 'Submitting...' : 'Save Inspection'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-gray-500 text-sm">Loading inspections...</div>
      ) : inspections.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">No inspections found.</div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs border-b">
              <tr>
                <th className="p-3">Institution</th>
                <th className="p-3">Score</th>
                <th className="p-3">Notes</th>
                <th className="p-3">Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inspections.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">
                    {i.institution?.name || i.institutionId}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getScoreBadge(i.score)}`}>
                      {i.score}
                    </span>
                  </td>
                  <td className="p-3 max-w-xs truncate text-gray-700" title={i.notes}>
                    {i.notes || '—'}
                  </td>
                  <td className="p-3 text-gray-600">{i.inspector?.email || i.inspectorId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-gray-500">
            Showing Page {page} of {totalPages} ({total} total inspections)
          </span>
          <div className="space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 bg-gray-100 border text-xs rounded disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-100 border text-xs rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
