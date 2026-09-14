'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/axios';

export default function CreateOfficerPage() {
  const [email, setEmail] = useState('');
  const [roleName, setRoleName] = useState('to');
  const [institutionId, setInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await apiClient.get('/api/institutions', { params: { limit: 100 } });
        const data = response.data?.data?.items || response.data?.data || [];
        setInstitutions(data);
      } catch (err) {
        console.error('Failed to load institutions', err);
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload: any = { email, roleName };
      if (institutionId.trim()) {
        payload.institutionId = institutionId.trim();
      }

      await apiClient.post('/api/admin/officers', payload);
      setSuccess('Officer created successfully! An email has been sent to them with their temporary password.');
      setEmail('');
      setInstitutionId('');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create officer';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl bg-white shadow-sm rounded border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Create New Officer</h1>
      <p className="text-sm text-gray-500 mb-6 border-b pb-4">
        Only Administrators can create new regional officers (TO/ATO).
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-200 rounded text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Officer Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-blue-500"
            placeholder="e.g. officer@egp.gov"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="to">TO (Thana Education Officer)</option>
            <option value="ato">ATO (Assistant Thana Education Officer)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign to Institution (Optional)
          </label>
          <select
            value={institutionId}
            onChange={(e) => setInstitutionId(e.target.value)}
            disabled={loadingInstitutions}
            className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-blue-500 bg-white disabled:opacity-50"
          >
            <option value="">-- None (Manage Entire Region) --</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name} ({inst.eiin})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">Leave as "None" if the officer manages an entire region instead of a single school.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm transition mt-2 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Officer'}
        </button>
      </form>
    </div>
  );
}
