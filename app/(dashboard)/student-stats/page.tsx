'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { inspectionsService } from '@/services/inspections.service';
import { extractErrorMessage } from '@/lib/utils';
import { StudentStatistic } from '@/types';

export default function StudentStatsPage() {
  const { role } = useAuth();
  const [stats, setStats] = useState<StudentStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create modal state
  const [isCreating, setIsCreating] = useState(false);
  const [institutionId, setInstitutionId] = useState('');
  const [academicYear, setAcademicYear] = useState('2026');
  const [totalBoys, setTotalBoys] = useState<number>(0);
  const [totalGirls, setTotalGirls] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [editingStat, setEditingStat] = useState<StudentStatistic | null>(null);
  const [editYear, setEditYear] = useState('');
  const [editBoys, setEditBoys] = useState<number>(0);
  const [editGirls, setEditGirls] = useState<number>(0);
  const [updating, setUpdating] = useState(false);

  const isHeadTeacher = role === 'head_teacher';

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inspectionsService.findAllStudentStats();
      setStats(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to load student statistics'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCreateStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId.trim() || !academicYear.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await inspectionsService.createStudentStat({
        institutionId: institutionId.trim(),
        academicYear: academicYear.trim(),
        totalBoys,
        totalGirls,
      });
      setSuccessMsg('Student statistic added successfully!');
      setIsCreating(false);
      setInstitutionId('');
      setAcademicYear('2026');
      setTotalBoys(0);
      setTotalGirls(0);
      fetchStats();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to create student statistic'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (stat: StudentStatistic) => {
    setEditingStat(stat);
    setEditYear(stat.academicYear);
    setEditBoys(stat.totalBoys);
    setEditGirls(stat.totalGirls);
  };

  const handleUpdateStat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStat) return;

    setUpdating(true);
    setError(null);
    try {
      await inspectionsService.updateStudentStat(editingStat.id, {
        academicYear: editYear.trim(),
        totalBoys: editBoys,
        totalGirls: editGirls,
      });
      setSuccessMsg('Student statistic updated successfully!');
      setEditingStat(null);
      fetchStats();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to update student statistic'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteStat = async (id: string, year: string) => {
    if (!window.confirm(`Are you sure you want to delete the statistic for academic year "${year}"?`)) {
      return;
    }

    setError(null);
    try {
      await inspectionsService.removeStudentStat(id);
      setSuccessMsg('Student statistic deleted successfully!');
      fetchStats();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to delete student statistic'));
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Student Statistics</h1>
          <p className="text-sm text-gray-500">
            Track enrollment numbers by academic year
          </p>
        </div>
        {isHeadTeacher && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition shadow-sm"
          >
            {isCreating ? 'Cancel' : '+ Add Statistic'}
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

      {/* Add Statistic Form */}
      {isCreating && (
        <form onSubmit={handleCreateStat} className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Add Student Statistic</h3>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 2026"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Boys</label>
              <input
                type="number"
                required
                min={0}
                value={totalBoys}
                onChange={(e) => setTotalBoys(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Girls</label>
              <input
                type="number"
                required
                min={0}
                value={totalGirls}
                onChange={(e) => setTotalGirls(Number(e.target.value))}
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
              {submitting ? 'Adding...' : 'Save Statistic'}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-gray-500 text-sm">Loading student statistics...</div>
      ) : stats.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">No student statistics recorded yet.</div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs border-b">
              <tr>
                <th className="p-3">Institution</th>
                <th className="p-3">Academic Year</th>
                <th className="p-3">Boys</th>
                <th className="p-3">Girls</th>
                <th className="p-3">Total</th>
                {isHeadTeacher && <th className="p-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">
                    {s.institution?.name || s.institutionId}
                  </td>
                  <td className="p-3 text-gray-700">{s.academicYear}</td>
                  <td className="p-3 text-gray-700">{s.totalBoys}</td>
                  <td className="p-3 text-gray-700">{s.totalGirls}</td>
                  <td className="p-3 font-semibold text-gray-800">{s.totalBoys + s.totalGirls}</td>
                  {isHeadTeacher && (
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded border border-gray-300 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStat(s.id, s.academicYear)}
                        className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded border border-red-200 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingStat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">Edit Student Statistic</h3>
              <button
                onClick={() => setEditingStat(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateStat} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  required
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Boys</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editBoys}
                    onChange={(e) => setEditBoys(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Girls</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editGirls}
                    onChange={(e) => setEditGirls(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingStat(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Update Statistic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
