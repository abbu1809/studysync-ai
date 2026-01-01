import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiRefreshCw, FiBook } from 'react-icons/fi';
import { studyPlanService, assignmentService } from '../services';
import { toast } from 'react-toastify';
import { format, addDays } from 'date-fns';

const StudyPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [generateForm, setGenerateForm] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    includeAssignments: [],
    excludeDays: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, assignmentsData] = await Promise.all([
        studyPlanService.getAll(),
        assignmentService.getAll({ status: 'pending,in-progress' })
      ]);

      setPlans(plansData.plans || []);
      if (plansData.plans?.length > 0) {
        setCurrentPlan(plansData.plans[0]);
      }
      setAssignments(assignmentsData.assignments || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    
    try {
      setGenerating(true);
      const data = await studyPlanService.generate({
        ...generateForm,
        excludeDays: generateForm.excludeDays.map(Number)
      });

      toast.success('Study plan generated successfully!');
      setShowGenerateModal(false);
      setCurrentPlan(data.plan);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleSessionComplete = async (planId, sessionId) => {
    try {
      await studyPlanService.updateSession(planId, sessionId, { completed: true });
      toast.success('Session marked complete!');
      loadData();
    } catch (error) {
      toast.error('Failed to update session');
    }
  };

  const handleRebalance = async (planId) => {
    try {
      await studyPlanService.rebalance(planId);
      toast.success('Plan rebalanced successfully!');
      loadData();
    } catch (error) {
      toast.error('Failed to rebalance plan');
    }
  };

  const toggleDay = (day) => {
    setGenerateForm(prev => ({
      ...prev,
      excludeDays: prev.excludeDays.includes(day)
        ? prev.excludeDays.filter(d => d !== day)
        : [...prev.excludeDays, day]
    }));
  };

  const toggleAssignment = (assignmentId) => {
    setGenerateForm(prev => ({
      ...prev,
      includeAssignments: prev.includeAssignments.includes(assignmentId)
        ? prev.includeAssignments.filter(id => id !== assignmentId)
        : [...prev.includeAssignments, assignmentId]
    }));
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Study Planner</h1>
          <p className="text-gray-600">AI-powered personalized study schedule</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiCalendar /> Generate New Plan
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading study plans...</p>
        </div>
      ) : !currentPlan ? (
        <div className="card p-12 text-center">
          <FiCalendar className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No study plan yet</h3>
          <p className="text-gray-600 mb-4">Generate your first AI-powered study plan</p>
          <button onClick={() => setShowGenerateModal(true)} className="btn-primary">
            Create Study Plan
          </button>
        </div>
      ) : (
        <div>
          {/* Plan Header */}
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  {format(new Date(currentPlan.startDate), 'MMM dd')} - {format(new Date(currentPlan.endDate), 'MMM dd, yyyy')}
                </h2>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span>Total Sessions: {currentPlan.totalSessions || 0}</span>
                  <span>Completed: {currentPlan.completedSessions || 0}</span>
                  <span>Total Hours: {currentPlan.totalHours || 0}h</span>
                </div>
              </div>
              <button
                onClick={() => handleRebalance(currentPlan.id)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                <FiRefreshCw /> Rebalance
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{Math.round((currentPlan.completedSessions || 0) / (currentPlan.totalSessions || 1) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${(currentPlan.completedSessions || 0) / (currentPlan.totalSessions || 1) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-6">
            {currentPlan.schedule?.map((day, dayIndex) => (
              <div key={dayIndex} className="card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FiCalendar className="text-2xl text-indigo-600" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {format(new Date(day.date), 'EEEE, MMM dd')}
                    </h3>
                    <p className="text-sm text-gray-600">{day.sessions?.length || 0} sessions</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {day.sessions?.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        session.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FiClock className="text-gray-500" />
                            <span className="font-medium">
                              {session.startTime} - {session.endTime}
                            </span>
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                              {session.type}
                            </span>
                          </div>
                          
                          <div className="ml-6">
                            <h4 className="font-semibold text-lg mb-1">{session.subject}</h4>
                            <p className="text-gray-600 text-sm mb-2">{session.topic}</p>
                            {session.notes && (
                              <p className="text-xs text-gray-500 italic">{session.notes}</p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleSessionComplete(currentPlan.id, session.id)}
                          disabled={session.completed}
                          className={`p-2 rounded-lg ${
                            session.completed
                              ? 'text-green-600 bg-green-100'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                        >
                          <FiCheckCircle className="text-2xl" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {(!day.sessions || day.sessions.length === 0) && (
                    <p className="text-center text-gray-500 py-4">No sessions scheduled</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Plan Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Generate Study Plan</h2>

              <form onSubmit={handleGeneratePlan} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={generateForm.startDate}
                      onChange={(e) => setGenerateForm({ ...generateForm, startDate: e.target.value })}
                      required
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Date *</label>
                    <input
                      type="date"
                      value={generateForm.endDate}
                      onChange={(e) => setGenerateForm({ ...generateForm, endDate: e.target.value })}
                      required
                      min={generateForm.startDate}
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3">Exclude Days</label>
                  <div className="flex gap-2">
                    {days.map((day, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          generateForm.excludeDays.includes(idx)
                            ? 'bg-red-50 border-red-300 text-red-700'
                            : 'bg-white border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {assignments.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-3">Include Assignments</label>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {assignments.map((assignment) => (
                        <label key={assignment.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={generateForm.includeAssignments.includes(assignment.id)}
                            onChange={() => toggleAssignment(assignment.id)}
                            className="w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{assignment.title}</p>
                            <p className="text-sm text-gray-600">{assignment.subject} • Due: {format(new Date(assignment.dueDate), 'MMM dd')}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={generating} className="btn-primary flex-1">
                    {generating ? 'Generating...' : 'Generate Plan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
