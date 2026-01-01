const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

/**
 * Extract text from document using Tesseract.js (Free OCR)
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} mimeType - MIME type of file
 * @returns {Promise<string>} Extracted text
 */
async function extractText(fileBuffer, mimeType) {
  try {
    if (mimeType === 'application/pdf') {
      return await extractFromPDF(fileBuffer);
    } else if (mimeType.startsWith('image/')) {
      return await extractFromImage(fileBuffer);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('OCR extraction error:', error);
    throw new Error('Failed to extract text from document: ' + error.message);
  }
}

/**
 * Extract text from image using Tesseract.js (Free)
 */
async function extractFromImage(imageBuffer) {
  try {
    console.log('Starting Tesseract OCR for image...');
    
    const result = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: info => console.log('Tesseract progress:', info.status, info.progress)
      }
    );

    console.log('Tesseract OCR completed');
    return result.data.text || '';
  } catch (error) {
    console.error('Image OCR error:', error);
    throw error;
  }
}

/**
 * Extract text from PDF using pdf-parse (Free)
 * Works for text-based PDFs (not scanned images)
 */
async function extractFromPDF(pdfBuffer) {
  try {
    console.log('Starting PDF text extraction...');
    
    // Use pdf-parse to extract text from text-based PDFs
    const data = await pdfParse(pdfBuffer);
    
    if (data.text && data.text.trim().length > 0) {
      console.log('PDF text extraction completed, extracted', data.text.length, 'characters');
      return data.text;
    } else {
      // PDF might be scanned images, suggest alternative
      console.log('No text found in PDF - might be a scanned document');
      return 'This PDF appears to be a scanned document or image-based. For best results, please upload the document as image files (PNG, JPG) or use a text-based PDF.';
    }
  } catch (error) {
    console.error('PDF extraction error:', error);
    return 'Failed to extract text from PDF. Please try uploading the document as image files (PNG, JPG) instead.';
  }
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/\n{3,}/g, '\n\n')  // Limit consecutive newlines
    .trim();
}

module.exports = {
  extractText,
  cleanText
};
