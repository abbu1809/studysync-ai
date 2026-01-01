import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { documentService } from '../services';
import { FiBook, FiCalendar, FiAward, FiChevronDown, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { format } from 'date-fns';
import DeleteModal from '../components/DeleteModal';

function Syllabus() {
  const [syllabusData, setSyllabusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [syllabusToDelete, setSyllabusToDelete] = useState(null);

  useEffect(() => {
    loadSyllabusData();
  }, []);

  const loadSyllabusData = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAll({ type: 'syllabus', status: 'completed' });
      setSyllabusData(data.documents || []);
    } catch (error) {
      toast.error('Failed to load syllabus data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteClick = (syllabus) => {
    setSyllabusToDelete(syllabus);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!syllabusToDelete) return;
    try {
      await documentService.delete(syllabusToDelete.id);
      toast.success('Syllabus deleted');
      setShowDeleteModal(false);
      setSyllabusToDelete(null);
      await loadSyllabusData();
    } catch (error) {
      toast.error('Failed to delete syllabus');
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
        <h1 className="text-2xl font-bold text-gray-900">Course Syllabus</h1>
        <div className="text-sm text-gray-500">
          {syllabusData.length} {syllabusData.length === 1 ? 'Course' : 'Courses'}
        </div>
      </div>

      {syllabusData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FiBook className="mx-auto text-5xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Syllabus Documents</h3>
          <p className="text-gray-500">Upload syllabus documents to see structured course information here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {syllabusData.map((syllabus) => {
            const data = syllabus.structuredData || {};
            const isExpanded = expandedSections[syllabus.id];

            return (
              <div key={syllabus.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
                  <div
                    onClick={() => toggleSection(syllabus.id)}
                    className="flex items-center space-x-4 flex-1"
                  >
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FiBook className="text-2xl text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {data.subject || syllabus.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Uploaded on {format(new Date(syllabus.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(syllabus);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete syllabus"
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                    <div onClick={() => toggleSection(syllabus.id)}>
                      {isExpanded ? <FiChevronDown className="text-xl" /> : <FiChevronRight className="text-xl" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {/* Topics Section */}
                    {data.topics && data.topics.length > 0 && (
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                          <FiBook className="mr-2 text-blue-600" />
                          Course Topics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {data.topics.map((topic, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="flex items-start">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                                  {idx + 1}
                                </div>
                                <div className="ml-3 flex-1">
                                  <h4 className="font-medium text-gray-900">{topic}</h4>
                                  {data.subtopics && data.subtopics[topic] && (
                                    <ul className="mt-2 space-y-1">
                                      {data.subtopics[topic].map((subtopic, subIdx) => (
                                        <li key={subIdx} className="text-sm text-gray-600 flex items-start">
                                          <span className="mr-2">•</span>
                                          <span>{subtopic}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Important Dates */}
                    {data.dates && data.dates.length > 0 && (
                      <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
                        <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                          <FiCalendar className="mr-2 text-green-600" />
                          Important Dates
                        </h3>
                        <div className="space-y-3">
                          {data.dates.map((dateItem, idx) => (
                            <div key={idx} className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <FiCalendar className="text-green-600" />
                                </div>
                                <span className="font-medium text-gray-900">{dateItem.event}</span>
                              </div>
                              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                {dateItem.date}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grading Information */}
                    {data.grading && (
                      <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                        <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                          <FiAward className="mr-2 text-purple-600" />
                          Grading Criteria
                        </h3>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                            {data.grading}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Keywords */}
                    {data.keywords && data.keywords.length > 0 && (
                      <div className="p-6 bg-gray-50">
                        <h3 className="font-semibold text-sm text-gray-700 mb-3">Key Concepts</h3>
                        <div className="flex flex-wrap gap-2">
                          {data.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-full text-sm"
                            >
                              {keyword}
                            </span>
                          ))}
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
          setSyllabusToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Syllabus"
        message="Are you sure you want to delete this syllabus document? This action cannot be undone."
        itemName={syllabusToDelete?.title}
      />
    </div>
  );
}

export default Syllabus;
