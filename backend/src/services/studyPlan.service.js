const { generateContent } = require('../config/gemini');
const { format, addDays, isBefore, isWeekend } = require('date-fns');

/**
 * Generate study schedule using AI
 */
async function generateSchedule(params) {
  const {
    startDate,
    endDate,
    userPreferences,
    userHabits,
    assignments,
    syllabusData,
    excludeDays
  } = params;

  try {
    const prompt = buildSchedulePrompt({
      startDate,
      endDate,
      userPreferences,
      userHabits,
      assignments,
      syllabusData,
      excludeDays
    });

    const response = await generateContent(prompt, {
      temperature: 0.5,
      maxOutputTokens: 8192
    });

    // Parse schedule from response
    const schedule = parseScheduleResponse(response, startDate, endDate);

    return schedule;
  } catch (error) {
    console.error('Schedule generation error:', error);
    throw new Error('Failed to generate study schedule: ' + error.message);
  }
}

/**
 * Build prompt for schedule generation
 */
function buildSchedulePrompt(params) {
  const {
    startDate,
    endDate,
    userPreferences,
    userHabits,
    assignments,
    syllabusData
  } = params;

  return `
You are an expert study planner AI. Create a detailed, hour-by-hour study schedule.

USER PROFILE:
- Available study hours per day: ${userPreferences.studyHoursPerDay}
- Preferred study time: ${userPreferences.studyTimePreference}
- Session duration: ${userPreferences.sessionDuration} minutes
- Break duration: ${userPreferences.breakDuration} minutes
- Peak productivity: ${userHabits.peakProductivityTime}
- Average study hours: ${userHabits.averageStudyHours}

SCHEDULE PERIOD:
- Start: ${format(startDate, 'yyyy-MM-dd')}
- End: ${format(endDate, 'yyyy-MM-dd')}

ASSIGNMENTS (Priority Order):
${assignments.map((a, i) => `
${i + 1}. ${a.title}
   Subject: ${a.subject}
   Due: ${format(new Date(a.dueDate), 'yyyy-MM-dd')}
   Estimated Hours: ${a.estimatedHours}
   Topics: ${a.topics.join(', ')}
   Priority: ${a.priority}
`).join('\n')}

SYLLABUS TOPICS:
${JSON.stringify(syllabusData, null, 2)}

REQUIREMENTS:
1. Prioritize assignments by deadline (urgent first)
2. Add buffer time (1-2 days) before each deadline
3. Schedule harder topics during peak productivity time
4. Include breaks between sessions
5. Balance workload across days
6. Include revision sessions
7. Avoid cramming - distribute work evenly

Return ONLY valid JSON array of days with this structure:
[
  {
    "date": "2026-01-15",
    "dayOfWeek": "Wednesday",
    "sessions": [
      {
        "id": "unique-id",
        "startTime": "09:00",
        "endTime": "10:30",
        "subject": "Mathematics",
        "topic": "Calculus",
        "assignmentId": "assignment-id or null",
        "type": "study|assignment|revision|break",
        "completed": false,
        "completedAt": null,
        "notes": ""
      }
    ],
    "totalPlannedHours": 4,
    "totalCompletedHours": 0
  }
]

Generate a realistic, achievable schedule. Do not include markdown formatting.
`;
}

/**
 * Parse AI response into schedule format
 */
function parseScheduleResponse(response, startDate, endDate) {
  try {
    // Clean response
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const schedule = JSON.parse(cleanResponse);

    // Validate and add IDs
    return schedule.map(day => ({
      ...day,
      sessions: day.sessions.map(session => ({
        ...session,
        id: session.id || generateSessionId()
      }))
    }));
  } catch (error) {
    console.error('Schedule parse error:', error);
    
    // Fallback: Create basic schedule
    return createBasicSchedule(startDate, endDate);
  }
}

/**
 * Fallback: Create basic schedule structure
 */
function createBasicSchedule(startDate, endDate) {
  const schedule = [];
  let currentDate = new Date(startDate);

  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    if (!isWeekend(currentDate)) {
      schedule.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        dayOfWeek: format(currentDate, 'EEEE'),
        sessions: [
          {
            id: generateSessionId(),
            startTime: '09:00',
            endTime: '11:00',
            subject: 'Study Session',
            topic: 'To be determined',
            assignmentId: null,
            type: 'study',
            completed: false,
            completedAt: null,
            notes: ''
          }
        ],
        totalPlannedHours: 2,
        totalCompletedHours: 0
      });
    }

    currentDate = addDays(currentDate, 1);
  }

  return schedule;
}

/**
 * Rebalance existing study plan
 */
async function rebalanceSchedule(params) {
  const { currentPlan, userPreferences, assignments } = params;

  // Get incomplete sessions
  const incompleteSessions = [];
  currentPlan.schedule.forEach(day => {
    day.sessions.forEach(session => {
      if (!session.completed && new Date(day.date) < new Date()) {
        incompleteSessions.push({ ...session, date: day.date });
      }
    });
  });

  if (incompleteSessions.length === 0) {
    return currentPlan.schedule; // No rebalancing needed
  }

  // Regenerate for remaining days
  const today = new Date();
  const endDate = new Date(currentPlan.endDate);

  return await generateSchedule({
    startDate: today,
    endDate,
    userPreferences,
    userHabits: {},
    assignments,
    syllabusData: [],
    excludeDays: []
  });
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  generateSchedule,
  rebalanceSchedule
};
