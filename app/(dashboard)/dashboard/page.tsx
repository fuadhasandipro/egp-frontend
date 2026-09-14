'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import apiClient from '@/lib/axios';

export default function DashboardPage() {
  const { user, role } = useAuth();
  
  const [stats, setStats] = useState({
    institutions: 0,
    users: 0,
    inspections: 0,
    complaints: 0,
  });
  
  const [chartAttendanceData, setChartAttendanceData] = useState<any[]>([]);
  const [chartComplaintsData, setChartComplaintsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const fetchTotal = async (url: string) => {
          try {
            const res = await apiClient.get(url, { params: { limit: 1 } });
            return res.data?.data?.meta?.total || res.data?.meta?.total || (Array.isArray(res.data?.data) ? res.data.data.length : 0);
          } catch (e) {
            return 0;
          }
        };

        const [institutions, users, inspections, complaintsCount] = await Promise.all([
          fetchTotal('/api/institutions'),
          fetchTotal('/api/admin/users'),
          fetchTotal('/api/inspections'),
          fetchTotal('/api/tickets/complaints')
        ]);

        setStats({ institutions, users, inspections, complaints: complaintsCount });

        // Fetch time-series / aggregation data for charts
        try {
          const attRes = await apiClient.get('/api/attendance', { params: { limit: 100 } });
          const attendanceData = attRes.data?.data?.items || attRes.data?.data || [];
          
          const attByDate: Record<string, any> = {};
          attendanceData.forEach((log: any) => {
            const d = log.date;
            if (!attByDate[d]) attByDate[d] = { name: d, present: 0, absent: 0, late: 0 };
            if (log.status === 'Present') attByDate[d].present += 1;
            else if (log.status === 'Absent') attByDate[d].absent += 1;
            else if (log.status === 'Late') attByDate[d].late += 1;
          });
          
          const sortedAtt = Object.values(attByDate)
            .sort((a: any, b: any) => a.name.localeCompare(b.name))
            .slice(-7);
            
          setChartAttendanceData(sortedAtt);
        } catch (e) {
          console.error("Failed to fetch attendance for charts", e);
        }

        try {
          const compRes = await apiClient.get('/api/tickets/complaints', { params: { limit: 100 } });
          const complaintsData = compRes.data?.data?.items || compRes.data?.data || [];
          
          const compByStatus: Record<string, any> = { 'Open': 0, 'In Progress': 0, 'Resolved': 0 };
          complaintsData.forEach((c: any) => {
            if (compByStatus[c.status] !== undefined) {
              compByStatus[c.status] += 1;
            } else {
              compByStatus[c.status] = 1;
            }
          });
          
          setChartComplaintsData([
            { name: 'Open', count: compByStatus['Open'] || 0, fill: '#EF4444' },
            { name: 'In Progress', count: compByStatus['In Progress'] || 0, fill: '#F59E0B' },
            { name: 'Resolved', count: compByStatus['Resolved'] || 0, fill: '#10B981' },
          ]);
        } catch (e) {
          console.error("Failed to fetch complaints for charts", e);
        }

      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchDashboardData();
    }
  }, [role]);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, <span className="font-semibold text-blue-600">{user?.profile?.fullName || user?.email || 'User'}</span>!
          You are logged in as a <span className="font-semibold capitalize text-gray-800">{role?.replace('_', ' ') || 'user'}</span>.
        </p>
      </div>

      {loading ? (
        <div className="p-4 bg-gray-50 text-gray-500 rounded border border-gray-200">
          Loading stats...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {role === 'admin' && (
              <>
                <StatCard title="Total Schools" value={stats.institutions} icon={Users} color="bg-blue-500" />
                <StatCard title="Active Users" value={stats.users} icon={CheckCircle} color="bg-green-500" />
                <StatCard title="Total Inspections" value={stats.inspections} icon={FileText} color="bg-purple-500" />
                <StatCard title="Complaints" value={stats.complaints} icon={AlertTriangle} color="bg-red-500" />
              </>
            )}

            {role === 'officer' && (
              <>
                <StatCard title="Schools in Region" value={stats.institutions} icon={Users} color="bg-blue-500" />
                <StatCard title="Inspections" value={stats.inspections} icon={FileText} color="bg-yellow-500" />
                <StatCard title="Complaints" value={stats.complaints} icon={AlertTriangle} color="bg-red-500" />
              </>
            )}

            {role === 'head_teacher' && (
              <>
                <StatCard title="Complaints" value={stats.complaints} icon={AlertTriangle} color="bg-red-500" />
                <StatCard title="Inspections" value={stats.inspections} icon={FileText} color="bg-purple-500" />
              </>
            )}

            {role === 'teacher' && (
              <>
                <StatCard title="My Complaints" value={stats.complaints} icon={AlertTriangle} color="bg-blue-500" />
              </>
            )}

            {!role && (
              <div className="col-span-full p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200">
                No specific stats available.
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Attendance (Last 7 Days)</h2>
              <div className="h-72">
                {chartAttendanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartAttendanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} name="Present" />
                      <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} name="Absent" />
                      <Line type="monotone" dataKey="late" stroke="#F59E0B" strokeWidth={2} name="Late" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No attendance data</div>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Complaints Overview</h2>
              <div className="h-72">
                {chartComplaintsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartComplaintsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Complaints" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No complaints data</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
