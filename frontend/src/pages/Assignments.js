import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { assignmentService } from '../services';
import { toast } from 'react-toastify';
import { format, differenceInDays } from 'date-fns';
import DeleteModal from '../components/DeleteModal';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    topics: '',
    dueDate: '',
    estimatedHours: 1,
    difficulty: 'medium'
  });

  useEffect(() => {
    loadAssignments();
  }, [filterStatus, filterPriority]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPriority !== 'all') params.priority = filterPriority;
      
      const data = await assignmentService.getAll(params);
      setAssignments(data.assignments || []);
    } catch (error) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        topics: formData.topics.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (editingId) {
        await assignmentService.update(editingId, data);
        toast.success('Assignment updated');
      } else {
        await assignmentService.create(data);
        toast.success('Assignment created');
      }

      setShowModal(false);
      resetForm();
      loadAssignments();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (assignment) => {
    setEditingId(assignment.id);
    setFormData({
      title: assignment.title,
      subject: assignment.subject,
      description: assignment.description || '',
      topics: assignment.topics.join(', '),
      dueDate: assignment.dueDate,
      estimatedHours: assignment.estimatedHours,
      difficulty: assignment.difficulty
    });
    setShowModal(true);
  };

  const handleDeleteClick = (assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await assignmentService.delete(assignmentToDelete.id);
      toast.success('Assignment deleted');
      setShowDeleteModal(false);
      setAssignmentToDelete(null);
      loadAssignments();
    } catch (error) {
      toast.error('Failed to delete assignment');
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await assignmentService.updateStatus(
        id,
        status,
        status === 'completed' ? formData.estimatedHours : undefined,
        undefined
      );
      toast.success('Status updated');
      loadAssignments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      description: '',
      topics: '',
      dueDate: '',
      estimatedHours: 1,
      difficulty: 'medium'
    });
    setEditingId(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'in-progress': return 'text-blue-700 bg-blue-100';
      case 'overdue': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getDaysRemaining = (dueDate) => {
    const days = differenceInDays(new Date(dueDate), new Date());
    return days;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Assignments</h1>
          <p className="text-gray-600">Track and manage your assignments</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Add Assignment
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Priority</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input-field"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="card p-12 text-center">
          <FiAlertCircle className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No assignments yet</h3>
          <p className="text-gray-600">Add your first assignment to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => {
            const daysLeft = getDaysRemaining(assignment.dueDate);
            return (
              <div key={assignment.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{assignment.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(typeof assignment.status === 'string' ? assignment.status : assignment.status?.status || 'pending')}`}>
                        {typeof assignment.status === 'string' ? assignment.status : assignment.status?.status || 'pending'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{assignment.subject}</p>
                    
                    {assignment.description && (
                      <p className="text-sm text-gray-500 mb-3">{assignment.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {assignment.topics.map((topic, idx) => (
                        <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded">
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiClock />
                        Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
                        {daysLeft >= 0 ? (
                          <span className={`ml-2 font-medium ${daysLeft <= 2 ? 'text-red-600' : 'text-gray-600'}`}>
                            ({daysLeft} days left)
                          </span>
                        ) : (
                          <span className="ml-2 font-medium text-red-600">
                            (Overdue)
                          </span>
                        )}
                      </div>
                      <span>Est. {assignment.estimatedHours}h</span>
                      <span className="capitalize">{assignment.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {(typeof assignment.status === 'string' ? assignment.status : assignment.status?.status || 'pending') !== 'completed' && (
                      <>
                        <button
                          onClick={() => {
                            const currentStatus = typeof assignment.status === 'string' ? assignment.status : assignment.status?.status || 'pending';
                            handleStatusChange(assignment.id, currentStatus === 'in-progress' ? 'completed' : 'in-progress');
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title={(typeof assignment.status === 'string' ? assignment.status : assignment.status?.status || 'pending') === 'in-progress' ? 'Mark Complete' : 'Start Working'}
                        >
                          <FiCheckCircle />
                        </button>
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <FiEdit2 />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteClick(assignment)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? 'Edit Assignment' : 'Add New Assignment'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject *</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="input-field w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Topics (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.topics}
                    onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                    placeholder="e.g., Arrays, Sorting, Recursion"
                    className="input-field w-full"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Due Date *</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Estimated Hours</label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) })}
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="input-field w-full"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn-primary flex-1">
                    {editingId ? 'Update' : 'Create'} Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
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

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAssignmentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Assignment"
        message="Are you sure you want to delete this assignment? This action cannot be undone."
        itemName={assignmentToDelete?.title}
      />
    </div>
  );
};

export default Assignments;
