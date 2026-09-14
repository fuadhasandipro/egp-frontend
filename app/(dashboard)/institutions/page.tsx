'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEiin, setNewEiin] = useState('');
  const [newType, setNewType] = useState('School');
  const [newLat, setNewLat] = useState('23.8103');
  const [newLng, setNewLng] = useState('90.4125');

  const fetchInstitutions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/api/institutions', {
        params: { page, limit },
      });
      const dataObj = response.data.data;
      if (dataObj && dataObj.items) {
        setInstitutions(dataObj.items);
        setTotal(dataObj.meta?.total || 0);
      } else if (Array.isArray(dataObj)) {
        setInstitutions(dataObj);
      }
    } catch (err: any) {
      setError('Failed to load institutions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [page, limit]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/institutions', {
        name: newName,
        eiin: newEiin,
        type: newType,
        latitude: parseFloat(newLat),
        longitude: parseFloat(newLng)
      });
      setIsCreating(false);
      setNewName('');
      setNewEiin('');
      fetchInstitutions();
    } catch (err: any) {
      alert('Error creating institution: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="bg-white shadow-sm rounded border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h1 className="text-2xl font-bold text-gray-800">Institutions</h1>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm transition"
        >
          {isCreating ? 'Cancel' : 'Add Institution'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded text-sm">
          {error}
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} className="mb-8 bg-gray-50 p-4 rounded border border-gray-200 space-y-4">
          <h3 className="font-semibold text-gray-700">Create New Institution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" placeholder="Institution Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">EIIN</label>
              <input required value={newEiin} onChange={e => setNewEiin(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" placeholder="Unique EIIN" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full border px-3 py-2 rounded text-sm">
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="Madrasa">Madrasa</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input required type="number" step="any" value={newLat} onChange={e => setNewLat(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input required type="number" step="any" value={newLng} onChange={e => setNewLng(e.target.value)} className="w-full border px-3 py-2 rounded text-sm" />
              </div>
            </div>
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium text-sm transition">
            Save
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">EIIN</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : institutions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No institutions found.</td>
              </tr>
            ) : (
              institutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{inst.name}</td>
                  <td className="px-4 py-3">{inst.eiin}</td>
                  <td className="px-4 py-3">{inst.type}</td>
                  <td className="px-4 py-3 text-xs">
                    Lat: {inst.latitude}<br />Lng: {inst.longitude}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing page {page} {total > 0 && `(Total items: ${total})`}
        </div>
        <div className="flex gap-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            disabled={institutions.length < limit || loading}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
