const { generateContent } = require('../config/gemini');

/**
 * Generate learning resource recommendations
 */
async function generateRecommendations(params) {
  const { subject, topic, userId } = params;

  try {
    const prompt = `
You are a learning resource curator. Recommend high-quality, domain-specific learning resources.

Subject: ${subject}
Topic: ${topic}

Provide 5-7 curated resources that are:
1. Directly relevant to the topic
2. From reputable sources (official docs, university courses, well-known educators)
3. Mix of types: videos, articles, documentation, courses
4. Actually exist (don't make up URLs)

Return ONLY valid JSON array (no markdown):
[
  {
    "title": "Resource Title",
    "url": "https://example.com/resource",
    "type": "video|article|documentation|course",
    "source": "YouTube|Medium|Official Docs|etc",
    "relevanceScore": 95
  }
]

Focus on quality over quantity. Only recommend resources you're confident exist.
`;

    const response = await generateContent(prompt, {
      temperature: 0.5,
      maxOutputTokens: 2048
    });

    const resources = parseResources(response);

    return resources;
  } catch (error) {
    console.error('Resource generation error:', error);
    // Return fallback generic resources
    return getFallbackResources(subject, topic);
  }
}

/**
 * Parse resources from AI response
 */
function parseResources(response) {
  try {
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const resources = JSON.parse(cleanResponse);

    // Validate structure
    return resources.map(r => ({
      title: r.title || 'Resource',
      url: r.url || '#',
      type: r.type || 'article',
      source: r.source || 'Unknown',
      relevanceScore: r.relevanceScore || 50
    }));
  } catch (error) {
    console.error('Resource parse error:', error);
    return [];
  }
}

/**
 * Fallback resources if AI fails
 */
function getFallbackResources(subject, topic) {
  return [
    {
      title: `Learn ${topic} - Khan Academy`,
      url: `https://www.khanacademy.org/search?query=${encodeURIComponent(topic)}`,
      type: 'course',
      source: 'Khan Academy',
      relevanceScore: 80
    },
    {
      title: `${topic} Tutorial`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(subject + ' ' + topic)}`,
      type: 'video',
      source: 'YouTube',
      relevanceScore: 75
    },
    {
      title: `${topic} Documentation`,
      url: `https://www.google.com/search?q=${encodeURIComponent(subject + ' ' + topic + ' documentation')}`,
      type: 'documentation',
      source: 'Web',
      relevanceScore: 70
    }
  ];
}

module.exports = {
  generateRecommendations
};
