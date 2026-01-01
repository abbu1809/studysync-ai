import React, { useState, useEffect } from 'react';
import { FiUpload, FiFile, FiTrash2, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { documentService } from '../services';
import { toast } from 'react-toastify';
import DeleteModal from '../components/DeleteModal';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState('syllabus');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, [filterType, filterStatus]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const data = await documentService.getAll(params);
      setDocuments(data.documents || []);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle) {
      toast.error('Please select a file and enter a title');
      return;
    }

    try {
      setUploading(true);
      
      await documentService.upload(selectedFile, {
        title: uploadTitle,
        type: uploadType
      });
      toast.success('Document uploaded! Processing started...');
      
      setSelectedFile(null);
      setUploadTitle('');
      setUploadType('syllabus');
      document.getElementById('fileInput').value = '';
      
      loadDocuments();
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    setDocumentToDelete(documents.find(d => d.id === docId));
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await documentService.delete(documentToDelete.id);
      toast.success('Document deleted');
      setShowDeleteModal(false);
      setDocumentToDelete(null);
      loadDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const handleReprocess = async (docId) => {
    try {
      await documentService.reprocess(docId);
      toast.success('Reprocessing started');
      loadDocuments();
    } catch (error) {
      toast.error('Failed to reprocess document');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    return <FiFile className="text-indigo-600" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Documents</h1>
        <p className="text-gray-600">Upload and manage your study materials</p>
      </div>

      {/* Upload Section */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Document Title</label>
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g., Computer Science Syllabus"
              className="input-field w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="input-field w-full"
            >
              <option value="syllabus">Syllabus</option>
              <option value="assignment">Assignment</option>
              <option value="notice">Notice</option>
              <option value="notes">Notes</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Choose File (PDF or Image)</label>
          <input
            id="fileInput"
            type="file"
            accept=".pdf,image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="btn-primary flex items-center gap-2"
        >
          <FiUpload />
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="syllabus">Syllabus</option>
            <option value="assignment">Assignment</option>
            <option value="notice">Notice</option>
            <option value="notes">Notes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="card p-12 text-center">
          <FiFile className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No documents yet</h3>
          <p className="text-gray-600">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-3xl">
                    {getTypeIcon(doc.type)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{doc.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                      <span className="capitalize">{doc.type}</span>
                      <span>•</span>
                      <span>{doc.fileName}</span>
                      <span>•</span>
                      <span>{(doc.fileSize / 1024).toFixed(2)} KB</span>
                      <span>•</span>
                      <span>{new Date(doc.createdAt?._seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                    </div>
                    
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.processingStatus)}`}>
                      {doc.processingStatus}
                    </span>

                    {doc.processingError && (
                      <p className="mt-2 text-sm text-red-600">{doc.processingError}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {doc.processingStatus === 'failed' && (
                    <button
                      onClick={() => handleReprocess(doc.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Reprocess"
                    >
                      <FiRefreshCw />
                    </button>
                  )}
                  
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Download"
                  >
                    <FiDownload />
                  </a>
                  
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {doc.processingStatus === 'completed' && doc.extractedText && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 line-clamp-3">{doc.extractedText.substring(0, 200)}...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setDocumentToDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete Document?"
        itemName={documentToDelete?.title}
      />
    </div>
  );
};

export default Documents;
