'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { role } = useAuth();


  const canAccess = (allowedRoles: string[]) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 p-4 min-h-screen shrink-0">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Navigation
      </h2>
      <ul className="space-y-1">
        <li>
          <Link
            href="/dashboard"
            className={`block px-3 py-2 rounded text-sm ${
              pathname === '/dashboard' || pathname === '/'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            href="/profile"
            className={`block px-3 py-2 rounded text-sm ${
              pathname === '/profile'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Profile
          </Link>
        </li>

        {canAccess(['admin']) && (
          <>
            <li>
              <Link
                href="/admin/officers"
                className={`block px-3 py-2 rounded text-sm ${
                  pathname === '/admin/officers'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Create Officer
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className={`block px-3 py-2 rounded text-sm ${
                  pathname === '/admin/users'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Users List
              </Link>
            </li>
          </>
        )}

        {canAccess(['admin', 'to', 'ato', 'head_teacher']) && (
          <li>
            <Link
              href="/institutions"
              className={`block px-3 py-2 rounded text-sm ${
                pathname === '/institutions'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Institutions
            </Link>
          </li>
        )}

        <li className="pt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Tickets & Assets
        </li>
        
        {canAccess(['admin', 'to', 'ato', 'head_teacher', 'teacher']) && (
          <li>
            <Link
              href="/complaints"
              className={`block px-3 py-2 rounded text-sm ${
                pathname === '/complaints'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Complaints
            </Link>
          </li>
        )}

        <li className="pt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Attendance & Notices
        </li>

        {canAccess(['admin', 'to', 'ato', 'head_teacher', 'teacher']) && (
          <>
            <li>
              <Link href="/attendance" className={`block px-3 py-2 rounded text-sm ${pathname === '/attendance' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                Attendance
              </Link>
            </li>
            {canAccess(['teacher']) && <li>
              <Link href="/leave-status" className={`block px-3 py-2 rounded text-sm ${pathname === '/leave-status' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                Leave Status
              </Link>
            </li>}
            <li>
              <Link href="/notices-board" className={`block px-3 py-2 rounded text-sm ${pathname === '/notices-board' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                Notices
              </Link>
            </li>
            {canAccess(['admin', 'to', 'ato', 'head_teacher']) && <li>
              <Link href="/notices-create" className={`block px-3 py-2 rounded text-sm ${pathname === '/notices-create' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                Create Notice
              </Link>
            </li>}
            <li>
              <Link href="/calendar" className={`block px-3 py-2 rounded text-sm ${pathname === '/calendar' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                Calendar
              </Link>
            </li>
            {canAccess(['admin', 'head_teacher']) && <li>
              <Link href="/leave-approval" className={`block px-3 py-2 rounded text-sm ${pathname === '/leave-approval' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}>
                Leave Approval
              </Link>
            </li>}
          </>
        )}

        {canAccess(['admin', 'to', 'ato', 'head_teacher']) && (
          <>
            <li>
              <Link
                href="/assets"
                className={`block px-3 py-2 rounded text-sm ${
                  pathname === '/assets'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                School Assets
              </Link>
            </li>
            <li>
              <Link
                href="/infrastructure"
                className={`block px-3 py-2 rounded text-sm ${
                  pathname === '/infrastructure'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Infra Requests
              </Link>
            </li>
          </>
        )}

        <li className="pt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Inspections & Academics
        </li>

        {canAccess(['admin', 'to', 'ato', 'head_teacher']) && (
          <li>
            <Link
              href="/inspections"
              className={`block px-3 py-2 rounded text-sm ${
                pathname === '/inspections'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Inspections
            </Link>
          </li>
        )}

        {canAccess(['admin', 'head_teacher']) && (
          <li>
            <Link
              href="/student-stats"
              className={`block px-3 py-2 rounded text-sm ${
                pathname === '/student-stats'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Student Stats
            </Link>
          </li>
        )}

        {canAccess(['admin', 'to', 'ato', 'teacher']) && (
          <li>
            <Link
              href="/training"
              className={`block px-3 py-2 rounded text-sm ${
                pathname === '/training'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Training
            </Link>
          </li>
        )}
      </ul>
    </aside>
  );
};
