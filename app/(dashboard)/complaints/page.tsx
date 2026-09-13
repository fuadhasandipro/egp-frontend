'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ticketsService } from '@/services/tickets.service';
import { extractErrorMessage } from '@/lib/utils';
import {
  Complaint,
  ComplaintAttachment,
  SeverityLevel,
  ComplaintStatus,
} from '@/types';

export default function ComplaintsPage() {
  const { role } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Create Complaint Modal state
  const [isCreating, setIsCreating] = useState(false);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('Medium');
  const [submitting, setSubmitting] = useState(false);

  // Attachments Modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [attachments, setAttachments] = useState<ComplaintAttachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [newFileUrl, setNewFileUrl] = useState('');
  const [addingAttachment, setAddingAttachment] = useState(false);

  const isTeacherOrHead = role === 'teacher' || role === 'head_teacher';
  const isHeadTeacher = role === 'head_teacher';

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ticketsService.findAllComplaints({
        page,
        limit,
        search: search.trim() || undefined,
        severity: (severityFilter as SeverityLevel) || undefined,
        status: (statusFilter as ComplaintStatus) || undefined,
      });

      if (res && res.items) {
        setComplaints(res.items);
        setTotal(res.total || 0);
      } else if (Array.isArray(res)) {
        setComplaints(res);
        setTotal((res as any).length);
      } else {
        setComplaints([]);
        setTotal(0);
      }
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to load complaints'));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, severityFilter, statusFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await ticketsService.createComplaint({
        description,
        severity,
      });
      setSuccessMsg('Complaint created successfully!');
      setIsCreating(false);
      setDescription('');
      setSeverity('Medium');
      fetchComplaints();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to create complaint'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEscalate = async (id: string) => {
    if (!window.confirm('Are you sure you want to escalate this complaint to the Thana Officer? An email notification will be sent.')) {
      return;
    }

    setError(null);
    try {
      await ticketsService.escalateComplaint(id);
      setSuccessMsg('Complaint escalated to Officer successfully!');
      fetchComplaints();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to escalate complaint'));
    }
  };

  const openAttachmentsModal = async (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setLoadingAttachments(true);
    setAttachments([]);
    setNewFileUrl('');
    try {
      const data = await ticketsService.findAttachments(complaint.id);
      setAttachments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(extractErrorMessage(err, 'Failed to fetch attachments for this complaint'));
    } finally {
      setLoadingAttachments(false);
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !newFileUrl.trim()) return;

    setAddingAttachment(true);
    try {
      const created = await ticketsService.addAttachment(selectedComplaint.id, {
        fileUrl: newFileUrl.trim(),
      });
      setAttachments((prev) => [...prev, created]);
      setNewFileUrl('');
      setSuccessMsg('Attachment added successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(extractErrorMessage(err, 'Failed to add attachment'));
    } finally {
      setAddingAttachment(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-300';
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Escalated':
        return 'bg-purple-100 text-purple-800 border border-purple-300 font-semibold';
      case 'Open':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'Resolved':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Complaints Management</h1>
          <p className="text-sm text-gray-500">
            Submit, view, and escalate institution complaints & attached files
          </p>
        </div>
        {isTeacherOrHead && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition shadow-sm"
          >
            {isCreating ? 'Cancel' : '+ File Complaint'}
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

      {/* Form: Create Complaint */}
      {isCreating && (
        <form onSubmit={handleCreateComplaint} className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-base font-semibold text-gray-800 border-b pb-2">File New Complaint</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the complaint in detail..."
                className="w-full border border-gray-300 rounded-md p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
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
              {submitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      )}

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-md border border-gray-200">
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Search complaint description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Escalated">Escalated</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-12 text-center text-gray-500 text-sm">Loading complaints...</div>
      ) : complaints.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">No complaints found.</div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold text-xs border-b">
              <tr>
                <th className="p-3">Institution</th>
                <th className="p-3">Description</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created At</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {complaints.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">
                    {c.institution?.name || 'N/A'}
                  </td>
                  <td className="p-3 max-w-xs truncate text-gray-700" title={c.description}>
                    {c.description}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getSeverityBadge(c.severity)}`}>
                      {c.severity}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 text-xs">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => openAttachmentsModal(c)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded border border-gray-300 font-medium"
                    >
                      📎 Attachments
                    </button>
                    {isHeadTeacher && c.status !== 'Escalated' && (
                      <button
                        onClick={() => handleEscalate(c.id)}
                        className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1.5 rounded font-medium transition"
                      >
                        ⚡ Escalate
                      </button>
                    )}
                  </td>
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
            Showing Page {page} of {totalPages} ({total} total complaints)
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

      {/* Attachments Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">
                Complaint Attachments
              </h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Complaint ID: <span className="font-mono text-gray-700">{selectedComplaint.id}</span>
            </p>

            {loadingAttachments ? (
              <div className="py-6 text-center text-sm text-gray-500">Loading attachments...</div>
            ) : attachments.length === 0 ? (
              <div className="py-4 text-center text-sm text-gray-400 border border-dashed rounded-md">
                No attachments uploaded yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex justify-between items-center p-2.5 bg-gray-50 border rounded text-xs"
                  >
                    <a
                      href={att.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate max-w-xs font-medium"
                    >
                      {att.fileUrl}
                    </a>
                    <span className="text-gray-400 text-[10px]">
                      {att.createdAt ? new Date(att.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {isTeacherOrHead && (
              <form onSubmit={handleAddAttachment} className="pt-2 border-t space-y-3">
                <label className="block text-xs font-semibold text-gray-700">Add New Attachment (File URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/photo.jpg"
                    value={newFileUrl}
                    onChange={(e) => setNewFileUrl(e.target.value)}
                    className="flex-1 border rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={addingAttachment}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium disabled:opacity-50"
                  >
                    {addingAttachment ? 'Adding...' : 'Add Link'}
                  </button>
                </div>
              </form>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-1.5 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
