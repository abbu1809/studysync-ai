import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { analyticsService, userService, assignmentService } from '../services';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FiTrendingUp, FiClock, FiAward, FiTarget, FiBookOpen, FiCheckCircle } from 'react-icons/fi';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function DashboardNew() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [stats, setStats] = useState(null);
  const [pendingAssignments, setPendingAssignments] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [analyticsRes, statsRes, assignmentsRes] = await Promise.all([
        analyticsService.getAnalytics(period),
        userService.getStats(),
        assignmentService.getAll({ status: 'pending' })
      ]);

      setAnalytics(analyticsRes.analytics);
      setStats(statsRes.stats);
      setPendingAssignments(assignmentsRes.assignments?.slice(0, 5) || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your learning progress and performance</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2 bg-white rounded-lg p-1 shadow">
          {['week', 'month', 'year'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md font-semibold capitalize transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Study Hours</p>
              <h3 className="text-3xl font-bold mt-2">{analytics.studyTime.totalHours}</h3>
              <p className="text-blue-100 text-sm mt-1">
                Avg: {analytics.studyTime.average}h/day
              </p>
            </div>
            <FiClock className="text-5xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Assignments</p>
              <h3 className="text-3xl font-bold mt-2">{analytics.assignments.total}</h3>
              <p className="text-green-100 text-sm mt-1">
                {analytics.assignments.completionRate}% completed
              </p>
            </div>
            <FiCheckCircle className="text-5xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Viva Avg Score</p>
              <h3 className="text-3xl font-bold mt-2">{analytics.viva.averageScore}%</h3>
              <p className="text-purple-100 text-sm mt-1">
                {analytics.viva.total} attempts
              </p>
            </div>
            <FiAward className="text-5xl text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Habit Completions</p>
              <h3 className="text-3xl font-bold mt-2">{analytics.habits.totalCompletions}</h3>
              <p className="text-orange-100 text-sm mt-1">
                {analytics.habits.total} active habits
              </p>
            </div>
            <FiTarget className="text-5xl text-orange-200" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Study Time Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <FiTrendingUp className="mr-2 text-blue-600" />
            Daily Study Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.studyTime.byDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hours" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <FiBookOpen className="mr-2 text-green-600" />
            Subject Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.studyTime.bySubject}
                dataKey="minutes"
                nameKey="subject"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.subject}: ${entry.percentage}%`}
              >
                {analytics.studyTime.bySubject.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Status */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Assignment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Pending', count: analytics.assignments.byStatus.pending, fill: '#F59E0B' },
              { name: 'In Progress', count: analytics.assignments.byStatus['in-progress'], fill: '#3B82F6' },
              { name: 'Completed', count: analytics.assignments.byStatus.completed, fill: '#10B981' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6">
                {[0, 1, 2].map((index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Viva Performance by Topic */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Viva Performance by Topic</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.viva.byTopic}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} label={{ value: 'Score %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="avgScore" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time of Day Preference */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Study Time Preference</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.studyTime.byTimeOfDay).map(([time, count]) => (
            <div key={time} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600 capitalize">{time}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{count}</p>
              <p className="text-xs text-gray-500 mt-1">sessions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Assignments</h3>
          <div className="space-y-3">
            {pendingAssignments.map(assignment => (
              <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                  <p className="text-sm text-gray-600">{assignment.subject}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    assignment.priority === 'high' || assignment.priority === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {assignment.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardNew;
