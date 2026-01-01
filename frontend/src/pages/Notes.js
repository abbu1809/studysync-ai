import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { documentService } from '../services';
import { FiFileText, FiLayers, FiTag, FiChevronDown, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import DeleteModal from '../components/DeleteModal';

function Notes() {
  const [notesData, setNotesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  useEffect(() => {
    loadNotesData();
  }, []);

  const loadNotesData = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAll({ type: 'notes', status: 'completed' });
      setNotesData(data.documents || []);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      await documentService.delete(noteToDelete.id);
      toast.success('Note deleted');
      setShowDeleteModal(false);
      setNoteToDelete(null);
      await loadNotesData();
    } catch (error) {
      toast.error('Failed to delete note');
      setShowDeleteModal(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Study Notes</h1>
        <div className="text-sm text-gray-500">
          {notesData.length} {notesData.length === 1 ? 'Note' : 'Notes'}
        </div>
      </div>

      {notesData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiFileText className="mx-auto text-5xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Available</h3>
          <p className="text-gray-500">Upload notes to see structured concepts and definitions here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {notesData.map((note) => {
            const data = note.structuredData || {};
            const isExpanded = expandedSections[note.id];

            return (
              <div key={note.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div
                    onClick={() => toggleSection(note.id)}
                    className="flex items-center space-x-4 flex-1"
                  >
                    <div className="p-3 bg-indigo-100 rounded-lg">
                      <FiFileText className="text-2xl text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {data.subject || note.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Created on {format(new Date(note.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(note);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete note"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                    <div onClick={() => toggleSection(note.id)}>
                      {isExpanded ? <FiChevronDown className="text-xl" /> : <FiChevronRight className="text-xl" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {/* Topics Section */}
                    {data.topics && data.topics.length > 0 && (
                      <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                          <FiLayers className="mr-2 text-indigo-600" />
                          Main Topics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {data.topics.map((topic, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
                              <h4 className="font-medium text-gray-900">{topic}</h4>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Concepts Section */}
                    {data.concepts && data.concepts.length > 0 && (
                      <div className="p-6 bg-gradient-to-r from-teal-50 to-cyan-50">
                        <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                          <FiTag className="mr-2 text-teal-600" />
                          Key Concepts
                        </h3>
                        <div className="space-y-3">
                          {data.concepts.map((concept, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                  {idx + 1}
                                </div>
                                <div className="ml-3">
                                  <p className="text-gray-700">{concept}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {data.summary && (
                      <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50">
                        <h3 className="font-semibold text-lg text-gray-900 mb-4">Summary</h3>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    {data.keywords && data.keywords.length > 0 && (
                      <div className="p-6 bg-gray-50">
                        <h3 className="font-semibold text-sm text-gray-700 mb-3">Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {data.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Extracted Text Preview */}
                    {note.extractedText && (
                      <div className="p-6 border-t border-gray-200">
                        <h3 className="font-semibold text-sm text-gray-700 mb-3">Full Text</h3>
                        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <p className="text-sm text-gray-600 whitespace-pre-wrap">{note.extractedText}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setNoteToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This action cannot be undone."
        itemName={noteToDelete?.title}
      />
    </div>
  );
}

export default Notes;
