import React, { useEffect, useState } from 'react';
import { userService, assignmentService, habitService } from '../services';
import { FiFileText, FiCheckSquare, FiClock, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data with individual error handling
      const [statsData, assignmentsData, insightsData] = await Promise.allSettled([
        userService.getStats().catch(err => ({ stats: { documentsUploaded: 0, assignmentsCompleted: 0, totalStudyTime: 0, streakDays: 0 } })),
        assignmentService.getAll({ status: 'pending' }).catch(err => ({ assignments: [] })),
        habitService.getInsights().catch(err => ({ insights: [] }))
      ]);

      // Safely extract stats with fallback
      const extractedStats = statsData.status === 'fulfilled' && statsData.value?.stats 
        ? statsData.value.stats 
        : { documentsUploaded: 0, assignmentsCompleted: 0, totalStudyTime: 0, streakDays: 0 };
      
      // Safely extract assignments with fallback
      const extractedAssignments = assignmentsData.status === 'fulfilled' && Array.isArray(assignmentsData.value?.assignments)
        ? assignmentsData.value.assignments.slice(0, 5)
        : [];
      
      // Safely extract insights with fallback - ensure it's always an array
      const extractedInsights = insightsData.status === 'fulfilled' && Array.isArray(insightsData.value?.insights)
        ? insightsData.value.insights
        : [];

      setStats(extractedStats);
      setAssignments(extractedAssignments);
      setInsights(extractedInsights);
    } catch (error) {
      console.error('Dashboard error:', error);
      // Set default values instead of showing error
      setStats({ documentsUploaded: 0, assignmentsCompleted: 0, totalStudyTime: 0, streakDays: 0 });
      setAssignments([]);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FiFileText}
          label="Documents"
          value={stats?.documentsUploaded || 0}
          color="blue"
        />
        <StatCard
          icon={FiCheckSquare}
          label="Completed"
          value={stats?.assignmentsCompleted || 0}
          color="green"
        />
        <StatCard
          icon={FiClock}
          label="Study Hours"
          value={Math.round((stats?.totalStudyTime || 0) / 60)}
          color="purple"
        />
        <StatCard
          icon={FiTrendingUp}
          label="Chat Messages"
          value={stats?.chatMessages || 0}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Assignments
          </h2>
          {assignments.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No pending assignments</p>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {assignment.subject}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded ${getPriorityColor(assignment.priority)}`}>
                      {assignment.priority}
                    </span>
                    <span className="text-gray-500">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Study Insights
          </h2>
          {insights.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              Start studying to get personalized insights
            </p>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${getInsightColor(insight.type)}`}
                >
                  <p className="text-sm">{insight.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const getPriorityColor = (priority) => {
  const colors = {
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
  };
  return colors[priority] || colors.medium;
};

const getInsightColor = (type) => {
  const colors = {
    positive: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
    suggestion: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    info: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
  };
  return colors[type] || colors.info;
};

export default Dashboard;
