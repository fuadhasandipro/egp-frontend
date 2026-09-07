'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, role } = useAuth();

  return (
    <div className="bg-white p-6 rounded border border-gray-200 shadow-sm max-w-2xl">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">Dashboard</h1>
      <p className="text-gray-600">
        Welcome, {user?.profile?.fullName || user?.email || 'User'}! You are logged in as{' '}
        <span className="font-semibold text-blue-600">{role || 'user'}</span>.
      </p>
    </div>
  );
}
