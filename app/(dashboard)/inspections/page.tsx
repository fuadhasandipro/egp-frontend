'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { inspectionsService } from '@/services/inspections.service';
import { extractErrorMessage } from '@/lib/utils';
import { Inspection, InstitutionRef } from '@/types';

const scoreColor = (s: number) => (s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444');

export default function InspectionsPage() {
  const { role } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterInstitution, setFilterInstitution] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');

  const [isCreating, setIsCreating] = useState(false);
  const [institutionId, setInstitutionId] = useState('');
  const [score, setScore] = useState<number>(80);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOfficer = role === 'to' || role === 'ato';

  const fetchInspections = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inspectionsService.findAllInspections({
        page,
        limit,
        sortBy,
        order,
        institutionId: filterInstitution || undefined,
      });

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
  }, [page, limit, sortBy, order, filterInstitution]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  useEffect(() => {
    inspectionsService
      .findInstitutionOptions()
      .then(setInstitutions)
      .catch(() => setInstitutions([]));
  }, []);

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) return;

    setSubmitting(true);
    setError(null);
    try {
      await inspectionsService.createInspection({
        institutionId,
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

  const averageScore = inspections.length
    ? Math.round(inspections.reduce((sum, i) => sum + i.score, 0) / inspections.length)
    : 0;
  const passing = inspections.filter((i) => i.score >= 50).length;

  const chartData = inspections
    .slice()
    .reverse()
    .map((i, idx) => ({
      name: (i.institution?.name || 'Unknown').slice(0, 14) + ` #${idx + 1}`,
      score: i.score,
    }));

  const getScoreBadge = (s: number) => {
    if (s >= 80) return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    if (s >= 50) return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    return 'bg-red-100 text-red-800 border border-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Inspections</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Score</p>
          <p className="text-3xl font-bold mt-1" style={{ color: scoreColor(averageScore) }}>
            {averageScore}
          </p>
          <p className="text-xs text-gray-400">on this page</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Passing (≥50)</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">
            {passing}
            <span className="text-base font-normal text-gray-400"> / {inspections.length}</span>
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Institution Inspections</h1>
            <p className="text-sm text-gray-500">Record and review institution inspection scores</p>
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
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">{error}</div>
        )}

        {/* Create form */}
        {isCreating && (
          <form
            onSubmit={handleCreateInspection}
            className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4"
          >
            <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Record New Inspection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <select
                  required
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select an institution</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                      {inst.eiin ? ` (EIIN ${inst.eiin})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score: <span className="font-bold" style={{ color: scoreColor(score) }}>{score}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
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

        {/* Chart */}
        {!loading && inspections.length > 0 && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={scoreColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-md border border-gray-200">
          <select
            value={filterInstitution}
            onChange={(e) => {
              setFilterInstitution(e.target.value);
              setPage(1);
            }}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Institutions</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500"
          >
            <option value="score">Sort by Score</option>
            <option value="institutionId">Sort by Institution</option>
          </select>
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as 'ASC' | 'DESC')}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500"
          >
            <option value="DESC">Highest first</option>
            <option value="ASC">Lowest first</option>
          </select>
        </div>

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
                    <td className="p-3 font-medium text-gray-800">{i.institution?.name || i.institutionId}</td>
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
    </div>
  );
}
