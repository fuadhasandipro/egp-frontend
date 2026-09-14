'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { inspectionsService } from '@/services/inspections.service';
import { extractErrorMessage } from '@/lib/utils';
import { TeacherOption, TeacherTraining, TrainingProgram } from '@/types';

/** The API returns `profile: null` for the seeded users, so email is the reliable label. */
function teacherLabel(teacher: TeacherOption): string {
  return teacher.profile?.fullName ? `${teacher.profile.fullName} (${teacher.email})` : teacher.email;
}

function formatDate(value: string): string {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
}

export default function TrainingPage() {
  const { role } = useAuth();

  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [records, setRecords] = useState<TeacherTraining[]>([]);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState('');
  const [trainingId, setTrainingId] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canAssign = role === 'admin' || role === 'to' || role === 'ato';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Only admin/officer may list teachers, so non-privileged roles skip that call.
      const [programList, recordList, teacherList] = await Promise.all([
        inspectionsService.findTrainingPrograms(),
        inspectionsService.findTrainingRecords(),
        canAssign ? inspectionsService.findTeacherOptions() : Promise.resolve<TeacherOption[]>([]),
      ]);
      setPrograms(programList || []);
      setRecords(recordList || []);
      setTeachers(teacherList || []);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to load training data'));
    } finally {
      setLoading(false);
    }
  }, [canAssign]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !trainingId || !completionDate) return;

    setSubmitting(true);
    setError(null);
    try {
      await inspectionsService.assignTraining({ userId, trainingId, completionDate });
      setSuccessMsg('Training assigned successfully!');
      setUserId('');
      setTrainingId('');
      setCompletionDate('');
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to assign training'));
    } finally {
      setSubmitting(false);
    }
  };

  const summary = useMemo(() => {
    const uniqueTeachers = new Set(records.map((r) => r.userId)).size;
    return {
      programs: programs.length,
      records: records.length,
      teachersTrained: uniqueTeachers,
    };
  }, [programs, records]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Training</h1>
        <p className="text-sm text-gray-500">
          Assign completed training programs to teachers and review the training history
        </p>
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Training Programs</p>
          <p className="text-3xl font-bold text-blue-600">{summary.programs}</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Trainings Completed</p>
          <p className="text-3xl font-bold text-emerald-600">{summary.records}</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Teachers Trained</p>
          <p className="text-3xl font-bold text-amber-600">{summary.teachersTrained}</p>
        </div>
      </div>

      {/* Assign form */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        {!canAssign ? (
          <div className="py-8 text-center text-gray-500 text-sm">
            You do not have permission to assign trainings. Only{' '}
            <span className="font-semibold">admin</span> and <span className="font-semibold">officer</span>{' '}
            roles can access this feature.
          </div>
        ) : (
          <form onSubmit={handleAssign} className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4 max-w-xl">
            <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Assign Training</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
              <select
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">
                  {teachers.length ? 'Select a teacher' : 'No teachers available'}
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacherLabel(teacher)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Training Program</label>
              <select
                required
                value={trainingId}
                onChange={(e) => setTrainingId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">
                  {programs.length ? 'Select a program' : 'No programs available'}
                </option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title} — {program.duration} ({program.organizer})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
              <input
                type="date"
                required
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting || !teachers.length || !programs.length}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Assigning...' : 'Assign Training'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Training records */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Training Records</h3>

        {loading ? (
          <div className="py-10 text-center text-gray-500 text-sm">Loading training records...</div>
        ) : records.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">No training records yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4 font-medium">Teacher</th>
                  <th className="py-2 pr-4 font-medium">Program</th>
                  <th className="py-2 pr-4 font-medium">Duration</th>
                  <th className="py-2 pr-4 font-medium">Organizer</th>
                  <th className="py-2 pr-4 font-medium">Completed</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-800">{record.user?.email || '—'}</td>
                    <td className="py-2 pr-4 text-gray-800">{record.training?.title || '—'}</td>
                    <td className="py-2 pr-4 text-gray-600">{record.training?.duration || '—'}</td>
                    <td className="py-2 pr-4 text-gray-600">{record.training?.organizer || '—'}</td>
                    <td className="py-2 pr-4 text-gray-600">{formatDate(record.completionDate)}</td>
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
