'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { inspectionsService } from '@/services/inspections.service';
import { extractErrorMessage } from '@/lib/utils';

export default function TrainingPage() {
  const { role } = useAuth();
  const [userId, setUserId] = useState('');
  const [trainingId, setTrainingId] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const canAssign = role === 'admin' || role === 'officer';

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !trainingId.trim() || !completionDate) return;

    setSubmitting(true);
    setError(null);
    try {
      await inspectionsService.assignTraining({
        userId: userId.trim(),
        trainingId: trainingId.trim(),
        completionDate,
      });
      setSuccessMsg('Training assigned successfully!');
      setUserId('');
      setTrainingId('');
      setCompletionDate('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to assign training'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Training Assignment</h1>
        <p className="text-sm text-gray-500">
          Assign a completed training program to a teacher
        </p>
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

      {!canAssign ? (
        <div className="py-12 text-center text-gray-500 text-sm">
          You do not have permission to assign trainings. Only <span className="font-semibold">admin</span> and{' '}
          <span className="font-semibold">officer</span> roles can access this feature.
        </div>
      ) : (
        <form onSubmit={handleAssign} className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4 max-w-xl">
          <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Assign Training</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher (User) ID</label>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Teacher's user UUID"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Training Program ID</label>
            <input
              type="text"
              required
              value={trainingId}
              onChange={(e) => setTrainingId(e.target.value)}
              placeholder="Training program UUID"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
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
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Assign Training'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
