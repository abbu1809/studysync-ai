import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { habitService } from '../services';
import { FiPlus, FiChevronLeft, FiChevronRight, FiMoreHorizontal, FiCheck } from 'react-icons/fi';
import { startOfWeek, addDays, format, isToday, addWeeks, subWeeks } from 'date-fns';
import DeleteModal from '../components/DeleteModal';

const CATEGORIES = [
  { value: 'study', label: 'Study', icon: '📚', color: '#007AFF' },
  { value: 'exercise', label: 'Exercise', icon: '💪', color: '#FF3B30' },
  { value: 'health', label: 'Health', icon: '❤️', color: '#FF2D55' },
  { value: 'productivity', label: 'Productivity', icon: '⚡', color: '#FFCC00' },
  { value: 'mindfulness', label: 'Mindfulness', icon: '🧘', color: '#AF52DE' },
  { value: 'general', label: 'General', icon: '✨', color: '#5AC8FA' }
];

function HabitsNew() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    goal: 1,
    category: 'study',
    icon: '📚',
    color: '#007AFF'
  });

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const data = await habitService.getAll();
      setHabits(data.habits || []);
    } catch (error) {
      toast.error('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const isDateCompleted = (habit, date) => {
    if (!habit.completions || !Array.isArray(habit.completions)) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return habit.completions.some(c => c.date === dateStr);
  };

  const handleToggleCompletion = async (habitId, date) => {
    const habit = habits.find(h => h.id === habitId);
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCompleted = isDateCompleted(habit, date);

    try {
      if (isCompleted) {
        await habitService.uncomplete(habitId, { date: dateStr });
      } else {
        await habitService.complete(habitId, { date: dateStr });
      }
      await loadHabits();
    } catch (error) {
      toast.error('Failed to update habit');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedHabit) {
        await habitService.update(selectedHabit.id, formData);
        toast.success('Habit updated');
      } else {
        await habitService.create(formData);
        toast.success('Habit created');
      }
      setShowModal(false);
      resetForm();
      await loadHabits();
    } catch (error) {
      toast.error('Failed to save habit');
    }
  };

  const handleEdit = (habit) => {
    setSelectedHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || '',
      frequency: habit.frequency || 'daily',
      goal: habit.goal || 1,
      category: habit.category,
      icon: habit.icon,
      color: habit.color
    });
    setShowModal(true);
  };

  const handleDeleteClick = (habit) => {
    setHabitToDelete(habit);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!habitToDelete) return;
    try {
      await habitService.delete(habitToDelete.id);
      toast.success('Habit deleted');
      setShowDeleteModal(false);
      setHabitToDelete(null);
      await loadHabits();
    } catch (error) {
      toast.error('Failed to delete habit');
      setShowDeleteModal(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frequency: 'daily',
      goal: 1,
      category: 'study',
      icon: '📚',
      color: '#007AFF'
    });
    setSelectedHabit(null);
  };

  const weekDays = getWeekDays();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Habits</h1>
            <p className="text-gray-500 mt-1">Build your daily routines</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <FiPlus className="text-xl" />
            <span className="font-semibold">New Habit</span>
          </button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between">
          <button
            onClick={handlePreviousWeek}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiChevronLeft className="text-2xl text-gray-600" />
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-500">Week of</p>
            <p className="text-lg font-semibold text-gray-900">
              {format(weekDays[0], 'MMM dd')} - {format(weekDays[6], 'MMM dd, yyyy')}
            </p>
          </div>
          <button
            onClick={handleNextWeek}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiChevronRight className="text-2xl text-gray-600" />
          </button>
        </div>
      </div>

      {/* Habits List */}
      <div className="max-w-5xl mx-auto space-y-4">
        {habits.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Habits Yet</h3>
            <p className="text-gray-500 mb-6">Create your first habit to get started</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold hover:shadow-lg transition-all"
            >
              Create Habit
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const category = CATEGORIES.find(c => c.value === habit.category);
            const completedThisWeek = weekDays.filter(day => isDateCompleted(habit, day)).length;
            const completionRate = Math.round((completedThisWeek / 7) * 100);

            return (
              <div
                key={habit.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden"
                style={{ borderLeft: `6px solid ${habit.color || category?.color}` }}
              >
                <div className="p-6">
                  {/* Habit Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md"
                        style={{ backgroundColor: `${habit.color || category?.color}15` }}
                      >
                        {habit.icon || category?.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{habit.name}</h3>
                        {habit.description && (
                          <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(habit)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <FiMoreHorizontal className="text-xl text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Week Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {weekDays.map((day, idx) => {
                      const completed = isDateCompleted(habit, day);
                      const today = isToday(day);

                      return (
                        <button
                          key={idx}
                          onClick={() => handleToggleCompletion(habit.id, day)}
                          className="group relative"
                        >
                          <div className="text-center mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              {format(day, 'EEE')}
                            </p>
                            <p className={`text-sm font-bold ${today ? 'text-blue-600' : 'text-gray-700'}`}>
                              {format(day, 'd')}
                            </p>
                          </div>
                          <div
                            className={`relative w-full aspect-square rounded-2xl transition-all duration-200 ${
                              completed
                                ? 'bg-gradient-to-br shadow-md'
                                : 'bg-gray-100 hover:bg-gray-200'
                            } ${today ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                            style={{
                              backgroundImage: completed
                                ? `linear-gradient(135deg, ${habit.color || category?.color}, ${habit.color || category?.color}dd)`
                                : 'none'
                            }}
                          >
                            {completed && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <FiCheck className="text-white text-2xl font-bold" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current Streak</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {habit.streak || 0}
                          <span className="text-sm text-gray-500 ml-1">days</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">This Week</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {completedThisWeek}
                          <span className="text-sm text-gray-500 ml-1">/ 7</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${completionRate}%`,
                              backgroundColor: habit.color || category?.color
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
                      </div>
                      <p className="text-xs text-gray-500">Completion Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedHabit ? 'Edit Habit' : 'New Habit'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Habit Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Morning Exercise"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Optional details..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value, icon: cat.icon, color: cat.color })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.category === cat.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-xs font-semibold text-gray-700">{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                {selectedHabit && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteClick(selectedHabit);
                      setShowModal(false);
                    }}
                    className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  {selectedHabit ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setHabitToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? All progress and history will be permanently lost."
        itemName={habitToDelete?.name}
      />
    </div>
  );
}

export default HabitsNew;
