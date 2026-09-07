'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

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
              pathname === '/dashboard'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </Link>
        </li>
      </ul>
    </aside>
  );
};
