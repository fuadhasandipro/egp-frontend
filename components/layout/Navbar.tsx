'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow">
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-xl font-bold">
          EGP System
        </Link>
        {isAuthenticated && (
          <Link href="/dashboard" className="text-sm hover:underline">
            Dashboard
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4 text-sm">
        {isAuthenticated && user ? (
          <>
            <span>
              {user.profile?.fullName || user.email}{' '}
              <span className="text-blue-200">({role})</span>
            </span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-white text-blue-600 font-medium px-3 py-1 rounded text-sm hover:bg-gray-100 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};
