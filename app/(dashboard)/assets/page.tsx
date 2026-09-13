'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ticketsService } from '@/services/tickets.service';
import { extractErrorMessage } from '@/lib/utils';
import { Asset, AssetCondition } from '@/types';

export default function AssetsPage() {
  const { role } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add Asset Modal state
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [condition, setCondition] = useState<AssetCondition>('Good');
  const [submitting, setSubmitting] = useState(false);

  // Edit Asset Modal state
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editName, setEditName] = useState('');
  const [editCondition, setEditCondition] = useState<AssetCondition>('Good');
  const [updating, setUpdating] = useState(false);

  const isHeadTeacher = role === 'head_teacher';

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ticketsService.findAllAssets();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to load assets'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await ticketsService.createAsset({ name: name.trim(), condition });
      setSuccessMsg('Asset added successfully!');
      setIsCreating(false);
      setName('');
      setCondition('Good');
      fetchAssets();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to create asset'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setEditName(asset.name);
    setEditCondition(asset.condition || 'Good');
  };

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !editName.trim()) return;

    setUpdating(true);
    setError(null);
    try {
      await ticketsService.updateAsset(editingAsset.id, {
        name: editName.trim(),
        condition: editCondition,
      });
      setSuccessMsg('Asset updated successfully!');
      setEditingAsset(null);
      fetchAssets();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to update asset'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAsset = async (id: string, assetName: string) => {
    if (!window.confirm(`Are you sure you want to delete asset "${assetName}"?`)) {
      return;
    }

    setError(null);
    try {
      await ticketsService.removeAsset(id);
      setSuccessMsg('Asset deleted successfully!');
      fetchAssets();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to delete asset'));
    }
  };

  const getConditionBadge = (cond: string) => {
    switch (cond) {
      case 'Good':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'Needs Repair':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'Damaged':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">School Assets</h1>
          <p className="text-sm text-gray-500">
            Manage infrastructure assets (benches, computers, chairs, fans)
          </p>
        </div>
        {isHeadTeacher && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition shadow-sm"
          >
            {isCreating ? 'Cancel' : '+ Add Asset'}
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

      {/* Add Asset Form */}
      {isCreating && (
        <form onSubmit={handleCreateAsset} className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-base font-semibold text-gray-800 border-b pb-2">Add New Asset</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Science Lab Computer, Wooden Bench"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Good">Good</option>
                <option value="Needs Repair">Needs Repair</option>
                <option value="Damaged">Damaged</option>
              </select>
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
              {submitting ? 'Adding...' : 'Save Asset'}
            </button>
          </div>
        </form>
      )}

      {/* Assets Table */}
      {loading ? (
        <div className="py-12 text-center text-gray-500 text-sm">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">No assets registered yet.</div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs border-b">
              <tr>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Institution</th>
                <th className="p-3">Condition</th>
                <th className="p-3">Registered Date</th>
                {isHeadTeacher && <th className="p-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">{asset.name}</td>
                  <td className="p-3 text-gray-600">{asset.institution?.name || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getConditionBadge(asset.condition)}`}>
                      {asset.condition}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">
                    {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  {isHeadTeacher && (
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(asset)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded border border-gray-300 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id, asset.name)}
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

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">Edit Asset</h3>
              <button
                onClick={() => setEditingAsset(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateAsset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value as AssetCondition)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Good">Good</option>
                  <option value="Needs Repair">Needs Repair</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Update Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
