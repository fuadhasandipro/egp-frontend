'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('uno@egp.gov');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testAccounts = [
    { label: 'Admin', email: 'admin@egp.gov' },
    { label: 'TO (Officer)', email: 'to@egp.gov' },
    { label: 'ATO (Asst. Officer)', email: 'ato@egp.gov' },
    { label: 'Head Teacher', email: 'headteacher@egp.gov' },
    { label: 'Teacher', email: 'teacher@egp.gov' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded border border-gray-300 shadow-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          EGP Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded text-sm focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium text-sm transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">
            Quick Fill Test Accounts:
          </p>
          <div className="flex flex-wrap gap-2">
            {testAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setEmail(acc.email);
                  setPassword('ChangeMe123!');
                }}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-2 py-1 rounded"
              >
                {acc.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Password: <span className="font-mono font-bold">ChangeMe123!</span>
          </p>
        </div>
      </div>
    </div>
  );
}
