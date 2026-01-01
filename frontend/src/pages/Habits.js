import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { habitService } from '../services';
import { 
  FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, 
  FiTrendingUp, FiCalendar, FiTarget 
} from 'react-icons/fi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

function Habits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    goal: 1,
    category: 'study',
    icon: '📚',
    color: '#3B82F6'
  });

  const categories = [
    { value: 'study', label: 'Study', icon: '📚' },
    { value: 'exercise', label: 'Exercise', icon: '💪' },
    { value: 'health', label: 'Health', icon: '❤️' },
    { value: 'productivity', label: 'Productivity', icon: '⚡' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'general', label: 'General', icon: '✨' }
  ];

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ];

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const data = await habitService.getAll();
      setHabits(data.habits || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedHabit) {
        await habitService.update(selectedHabit.id, formData);
        toast.success('Habit updated successfully');
      } else {
        await habitService.create(formData);
        toast.success('Habit created successfully');
      }
      setShowModal(false);
      resetForm();
      loadHabits();
    } catch (error) {
      toast.error(error.message || 'Failed to save habit');
    }
  };

  const handleDelete = async () => {
    try {
      await habitService.delete(selectedHabit.id);
      toast.success('Habit deleted successfully');
      setShowDeleteModal(false);
      setSelectedHabit(null);
      loadHabits();
    } catch (error) {
      toast.error(error.message || 'Failed to delete habit');
    }
  };

  const handleToggleCompletion = async (habitId, date) => {
    const habit = habits.find(h => h.id === habitId);
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCompleted = habit.completions?.some(c => c.date === dateStr);

    try {
      if (isCompleted) {
        await habitService.uncomplete(habitId, { date: dateStr });
        toast.success('Unmarked');
      } else {
        await habitService.complete(habitId, { date: dateStr });
        toast.success('Marked as complete!');
      }
      loadHabits();
    } catch (error) {
      toast.error(error.message || 'Failed to update habit');
    }
  };

  const openEditModal = (habit) => {
    setSelectedHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      goal: habit.goal,
      category: habit.category,
      icon: habit.icon,
      color: habit.color
    });
    setShowModal(true);
  };

  const openDeleteModal = (habit) => {
    setSelectedHabit(habit);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setSelectedHabit(null);
    setFormData({
      name: '',
      description: '',
      frequency: 'daily',
      goal: 1,
      category: 'study',
      icon: '📚',
      color: '#3B82F6'
    });
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const isDateCompleted = (habit, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completions?.some(c => c.date === dateStr);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Habit Tracker</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          Add Habit
        </button>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiTarget className="mx-auto text-5xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No habits yet</h3>
          <p className="text-gray-500 mb-4">Start tracking your daily habits to build better routines</p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {habits.map(habit => (
            <div key={habit.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3">
                  <div
                    className="text-3xl p-2 rounded-lg"
                    style={{ backgroundColor: `${habit.color}20` }}
                  >
                    {habit.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
                    <p className="text-sm text-gray-500">{habit.description}</p>
                    <div className="flex items-center mt-2 space-x-4 text-sm">
                      <div className="flex items-center text-orange-600">
                        <FiTrendingUp className="mr-1" />
                        {habit.streak || 0} day streak
                      </div>
                      <div className="text-gray-500">
                        Longest: {habit.longestStreak || 0} days
                      </div>
                      <div className="text-gray-500">
                        Total: {habit.totalCompletions || 0} times
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(habit)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => openDeleteModal(habit)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ←
                  </button>
                  <h4 className="font-medium text-gray-700">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h4>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    →
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-center text-xs font-medium text-gray-500 pb-1">
                      {day}
                    </div>
                  ))}
                  {getDaysInMonth().map((date, idx) => {
                    const completed = isDateCompleted(habit, date);
                    const today = isToday(date);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleCompletion(habit.id, date)}
                        className={`
                          aspect-square rounded-lg text-sm font-medium transition-all
                          ${completed 
                            ? `text-white` 
                            : today
                            ? 'bg-gray-100 text-gray-900 ring-2 ring-blue-500'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }
                        `}
                        style={completed ? { backgroundColor: habit.color } : {}}
                      >
                        {format(date, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedHabit ? 'Edit Habit' : 'Create New Habit'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Habit Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Morning Study Session"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Add details about this habit..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency *
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value, icon: cat.icon })}
                      className={`
                        p-3 rounded-lg border-2 text-center transition-all
                        ${formData.category === cat.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-xs">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex space-x-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`
                        w-10 h-10 rounded-full transition-all
                        ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
                      `}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedHabit ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <FiTrash2 className="text-2xl text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-center mb-2">Delete Habit?</h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete "{selectedHabit?.name}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedHabit(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Habits;
