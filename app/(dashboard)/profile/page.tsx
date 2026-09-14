'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/axios';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/api/profile');
        setProfileData(response.data.data);
      } catch (err: any) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading profile...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!profileData) {
    return <div className="p-4 text-gray-500">No profile data found.</div>;
  }

  return (
    <div className="max-w-2xl bg-white shadow-sm rounded border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Account Details</h3>
          <div className="mt-2 space-y-2 text-sm">
            <p><span className="font-medium text-gray-700">Email:</span> {profileData.email}</p>
            <p><span className="font-medium text-gray-700">Status:</span> {profileData.status}</p>
            <p>
              <span className="font-medium text-gray-700">Role:</span>{' '}
              <span className="capitalize bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-semibold">
                {profileData.role?.name || 'Unknown'}
              </span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase">Personal Info</h3>
          <div className="mt-2 space-y-2 text-sm">
            <p><span className="font-medium text-gray-700">Full Name:</span> {profileData.profile?.fullName || 'N/A'}</p>
            <p><span className="font-medium text-gray-700">Designation:</span> {profileData.profile?.designation || 'N/A'}</p>
            <p><span className="font-medium text-gray-700">Phone:</span> {profileData.profile?.phone || 'N/A'}</p>
            <p><span className="font-medium text-gray-700">NID:</span> {profileData.profile?.nid || 'N/A'}</p>
          </div>
        </div>
      </div>

      {profileData.institution && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Institution Details</h3>
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h4 className="font-bold text-gray-800 text-lg mb-1">{profileData.institution.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <p>Type: {profileData.institution.type}</p>
              <p>EIIN: {profileData.institution.eiin}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
