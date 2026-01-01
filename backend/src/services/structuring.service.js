const { generateContent } = require('../config/gemini');

/**
 * Structure extracted text into organized data
 * @param {string} extractedText - Raw OCR text
 * @returns {Promise<object>} Structured data
 */
async function structureContent(extractedText) {
  try {
    const prompt = `
You are an academic document analyzer. Analyze the following text extracted from an academic document and structure it into JSON format.

Extract and identify:
1. Subjects and their topics
2. Deadlines mentioned
3. Assignment details (if any)

Document Text:
${extractedText}

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "subjects": [
    {
      "name": "Subject Name",
      "topics": [
        {
          "name": "Topic Name",
          "subtopics": ["Subtopic 1", "Subtopic 2"],
          "estimatedHours": 2,
          "difficulty": "medium"
        }
      ]
    }
  ],
  "deadlines": [
    {
      "title": "Deadline Title",
      "date": "2026-01-15",
      "description": "Description",
      "priority": "high"
    }
  ],
  "assignments": [
    {
      "title": "Assignment Title",
      "subject": "Subject Name",
      "dueDate": "2026-01-20",
      "description": "Description",
      "topics": ["Topic 1"],
      "estimatedHours": 3
    }
  ]
}

If no data is found for a category, return an empty array. Always return valid JSON.
`;

    const response = await generateContent(prompt, {
      temperature: 0.3,
      maxOutputTokens: 4096
    });

    // Parse JSON from response
    let structuredData;
    try {
      // Remove markdown code blocks if present
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      structuredData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Return empty structure if parsing fails
      structuredData = {
        subjects: [],
        deadlines: [],
        assignments: []
      };
    }

    return structuredData;
  } catch (error) {
    console.error('Content structuring error:', error);
    throw new Error('Failed to structure content: ' + error.message);
  }
}

/**
 * Detect document type from content
 */
async function detectDocumentType(text) {
  const prompt = `
Analyze this text and determine the document type.
Respond with ONLY ONE of these words: syllabus, assignment, notice, notes

Text:
${text.substring(0, 500)}
`;

  const response = await generateContent(prompt, { temperature: 0.2 });
  const type = response.trim().toLowerCase();

  const validTypes = ['syllabus', 'assignment', 'notice', 'notes'];
  return validTypes.includes(type) ? type : 'notes';
}

/**
 * Extract key concepts from syllabus
 */
async function extractKeyConcepts(syllabusText) {
  const prompt = `
Extract the most important concepts and topics from this syllabus.
Return a simple JSON array of strings.

Syllabus:
${syllabusText}

Format: ["Concept 1", "Concept 2", ...]
`;

  const response = await generateContent(prompt, { temperature: 0.3 });
  
  try {
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    return JSON.parse(cleanResponse);
  } catch {
    return [];
  }
}

module.exports = {
  structureContent,
  detectDocumentType,
  extractKeyConcepts
};
