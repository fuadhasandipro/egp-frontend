'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/api/admin/users', {
          params: { page, limit },
        });
        const dataObj = response.data.data;
        if (dataObj && dataObj.items) {
          setUsers(dataObj.items);
          setTotal(dataObj.meta?.total || 0);
        } else if (Array.isArray(dataObj)) {
          setUsers(dataObj);
        }
      } catch (err: any) {
        setError('Failed to load users list.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, limit]);

  return (
    <div className="bg-white shadow-sm rounded border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Users Directory</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded text-sm">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-gray-500">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.role?.name || '-'}</td>
                  <td className="px-4 py-3">{new Date(u.createdAt).toLocaleDateString()}</td>
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
            disabled={users.length < limit || loading}
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
