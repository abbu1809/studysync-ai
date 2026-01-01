const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const cloudinary = require('../config/cloudinary');
const ocrService = require('../services/ocr.service');
const structuringService = require('../services/structuring.service');
const { v4: uuidv4 } = require('uuid');

/**
 * Upload and process document
 */
async function uploadDocument(req, res, next) {
  try {
    const { uid } = req.user;
    const { title, type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `studysync/${uid}`,
          resource_type: 'auto',
          public_id: `${uuidv4()}_${file.originalname.split('.')[0]}`,
          format: file.mimetype.includes('pdf') ? 'pdf' : undefined
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    const fileUrl = uploadResult.secure_url;
    const cloudinaryId = uploadResult.public_id;

    // Create document entry in Firestore
    const documentData = {
      id: uuidv4(),
      userId: uid,
      title,
      type,
      fileName: file.originalname,
      fileUrl,
      cloudinaryId,
      fileSize: file.size,
      mimeType: file.mimetype,
      extractedText: '',
      structuredData: {},
      processingStatus: 'pending',
      processingError: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const docRef = db.collection('documents').doc(documentData.id);
    await docRef.set(documentData);

    // Update user stats
    await db.collection('users').doc(uid).update({
      'stats.documentsUploaded': FieldValue.increment(1)
    });

    // Start OCR processing asynchronously (pass userId and documentType for auto-assignment)
    processDocumentAsync(documentData.id, file.buffer, file.mimetype, uid, type);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully. Processing started.',
      document: documentData
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Process document asynchronously
 */
async function processDocumentAsync(documentId, fileBuffer, mimeType, userId, documentType) {
  try {
    // Update status to processing
    await db.collection('documents').doc(documentId).update({
      processingStatus: 'processing',
      updatedAt: FieldValue.serverTimestamp()
    });

    let extractedText = '';
    let structuredData = {};

    try {
      // Extract text using Tesseract.js (Free OCR - no billing required)
      const ocrService = require('../services/ocr.service');
      extractedText = await ocrService.extractText(fileBuffer, mimeType);
      
      // Parse structured data based on document type
      structuredData = await parseDocumentContent(extractedText, documentType);
      
      console.log('OCR extraction successful, text length:', extractedText.length);
      console.log('Structured data extracted:', JSON.stringify(structuredData, null, 2));
      
      // Auto-create assignment if document type is 'assignment' and we extracted assignment data
      if (documentType === 'assignment' && structuredData.title) {
        await createAssignmentFromDocument(userId, documentId, {
          title: structuredData.title,
          subject: structuredData.subject || 'General',
          description: structuredData.requirements?.join('\n') || '',
          topics: structuredData.topics || [],
          dueDate: structuredData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedHours: structuredData.estimatedHours || 2
        });
        console.log('Auto-created assignment from document');
      }
      
    } catch (ocrError) {
      console.log('OCR processing failed:', ocrError.message);
      
      // Fallback: Set placeholder text
      extractedText = 'Document uploaded successfully. Text extraction failed. You can still use this document for reference.';
      structuredData = {
        note: 'OCR processing failed: ' + ocrError.message,
        topics: [],
        keywords: []
      };
    }

    // Update document with results
    await db.collection('documents').doc(documentId).update({
      extractedText,
      structuredData,
      processingStatus: 'completed',
      updatedAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Document processing error:', error);
    
    await db.collection('documents').doc(documentId).update({
      processingStatus: 'failed',
      processingError: error.message,
      updatedAt: FieldValue.serverTimestamp()
    });
  }
}

/**
 * Create assignment from detected assignment in document
 */
async function createAssignmentFromDocument(userId, documentId, assignmentData) {
  const assignment = {
    id: uuidv4(),
    userId,
    documentId,
    title: assignmentData.title,
    subject: assignmentData.subject,
    description: assignmentData.description || '',
    topics: assignmentData.topics || [],
    dueDate: assignmentData.dueDate,
    estimatedHours: assignmentData.estimatedHours || 2,
    actualHours: 0,
    status: 'pending',
    priority: calculatePriority(assignmentData.dueDate),
    difficulty: 'medium',
    completedAt: null,
    completionNotes: '',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };

  await db.collection('assignments').doc(assignment.id).set(assignment);
}

/**
 * Calculate assignment priority based on due date
 */
function calculatePriority(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const daysRemaining = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return 'urgent';
  if (daysRemaining <= 3) return 'high';
  if (daysRemaining <= 7) return 'medium';
  return 'low';
}

/**
 * Parse document content to extract structured data using AI
 */
async function parseDocumentContent(extractedText, documentType) {
  try {
    const { generateContent } = require('../config/gemini');
    
    // Use Gemini to extract structured data based on document type
    let prompt = '';
    
    if (documentType === 'assignment') {
      prompt = `Analyze this assignment document and extract:
1. Assignment title
2. Subject/course name
3. Topics covered
4. Due date (if mentioned)
5. Estimated hours needed
6. Key requirements/tasks

Document text:
${extractedText}

Respond in JSON format:
{
  "title": "assignment title",
  "subject": "subject name",
  "topics": ["topic1", "topic2"],
  "dueDate": "YYYY-MM-DD or null",
  "estimatedHours": number,
  "requirements": ["req1", "req2"],
  "keywords": ["key1", "key2"]
}`;
    } else if (documentType === 'syllabus') {
      prompt = `Analyze this syllabus document and extract:
1. Course/subject name
2. All topics and subtopics
3. Important dates (exams, deadlines, etc.)
4. Grading criteria and weightage
5. Key concepts

Document text:
${extractedText}

Respond in JSON format:
{
  "subject": "subject name",
  "topics": ["topic1", "topic2"],
  "subtopics": {"topic1": ["sub1", "sub2"]},
  "dates": [{"event": "event name", "date": "YYYY-MM-DD or descriptive date"}],
  "grading": "grading criteria text with percentages",
  "keywords": ["key1", "key2"]
}`;
    } else if (documentType === 'notes') {
      prompt = `Analyze these notes and extract:
1. Main subject/topic
2. All major topics covered
3. Key concepts and definitions
4. Important formulas or key points
5. Summary

Document text:
${extractedText}

Respond in JSON format:
{
  "subject": "subject name",
  "topics": ["topic1", "topic2"],
  "concepts": ["concept1 with explanation", "concept2 with explanation"],
  "keywords": ["key1", "key2"],
  "summary": "brief summary of the notes"
}`;
    } else {
      // Generic extraction
      prompt = `Analyze this document and extract key information:
1. Main topics
2. Important keywords
3. Key points

Document text:
${extractedText}

Respond in JSON format:
{
  "topics": ["topic1", "topic2"],
  "keywords": ["key1", "key2"],
  "summary": "brief summary"
}`;
    }

    const response = await generateContent(prompt, { temperature: 0.3 });
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const structuredData = JSON.parse(jsonMatch[0]);
      return structuredData;
    }
    
    // Fallback to basic extraction
    return extractBasicData(extractedText);
  } catch (error) {
    console.error('Error parsing document with AI:', error);
    return extractBasicData(extractedText);
  }
}

/**
 * Basic fallback extraction without AI
 */
function extractBasicData(extractedText) {
  const structuredData = {
    topics: [],
    keywords: []
  };

  // Extract potential topics (simple word frequency analysis)
  const words = extractedText.toLowerCase().split(/\s+/);
  const wordFreq = {};
  words.forEach(word => {
    if (word.length > 5) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Get top keywords
  structuredData.keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  return structuredData;
}

/**
 * Get all user documents
 */
async function getDocuments(req, res, next) {
  try {
    const { uid } = req.user;
    const { type, status } = req.query;

    let query = db.collection('documents').where('userId', '==', uid);

    if (type) {
      query = query.where('type', '==', type);
    }

    if (status) {
      query = query.where('processingStatus', '==', status);
    }

    const snapshot = await query.get();

    const documents = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific document
 */
async function getDocument(req, res, next) {
  try {
    const { uid } = req.user;
    const { documentId } = req.params;

    const doc = await db.collection('documents').doc(documentId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = doc.data();

    if (document.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete document
 */
async function deleteDocument(req, res, next) {
  try {
    const { uid } = req.user;
    const { documentId } = req.params;

    const doc = await db.collection('documents').doc(documentId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = doc.data();

    if (document.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete file from Cloudinary
    if (document.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(document.cloudinaryId, {
          resource_type: document.mimeType.includes('pdf') ? 'raw' : 'image'
        });
      } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
      }
    }

    // Delete document from Firestore
    await db.collection('documents').doc(documentId).delete();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reprocess document
 */
async function reprocessDocument(req, res, next) {
  try {
    const { uid } = req.user;
    const { documentId } = req.params;

    const doc = await db.collection('documents').doc(documentId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = doc.data();

    if (document.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Use Cloudinary SDK to get the file with proper authentication
    const https = require('https');
    const cloudinary = require('../config/cloudinary');
    
    // Generate signed URL for secure download
    const signedUrl = cloudinary.url(document.cloudinaryId, {
      resource_type: document.mimeType.includes('pdf') ? 'raw' : 'image',
      type: 'upload',
      sign_url: true
    });

    // Download with proper signed URL
    const fileBuffer = await new Promise((resolve, reject) => {
      https.get(signedUrl, (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      }).on('error', reject);
    });

    // Restart processing (pass userId and documentType for auto-assignment)
    processDocumentAsync(documentId, fileBuffer, document.mimeType, document.userId, document.type);

    res.status(200).json({
      success: true,
      message: 'Document reprocessing started'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  reprocessDocument
};
