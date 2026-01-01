/**
 * Analyze study habits from session data
 */
function analyzeStudyHabits(sessions) {
  if (!sessions || sessions.length === 0) {
    return getDefaultHabits();
  }

  // Calculate average study hours per day
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalDays = getUniqueDays(sessions).length;
  const averageStudyHours = parseFloat((totalMinutes / 60 / totalDays).toFixed(2));

  // Determine peak productivity time
  const timeDistribution = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  };

  sessions.forEach(session => {
    timeDistribution[session.timeOfDay] += session.duration;
  });

  const peakProductivityTime = Object.entries(timeDistribution)
    .sort((a, b) => b[1] - a[1])[0][0];

  // Calculate consistency (days studied / total days * 100)
  const daysStudied = getUniqueDays(sessions).length;
  const totalPeriodDays = Math.ceil(
    (new Date() - new Date(sessions[sessions.length - 1].startTime)) / (1000 * 60 * 60 * 24)
  );
  const consistency = Math.min(100, Math.round((daysStudied / totalPeriodDays) * 100));

  // Find preferred subjects
  const subjectMinutes = {};
  sessions.forEach(session => {
    subjectMinutes[session.subject] = (subjectMinutes[session.subject] || 0) + session.duration;
  });

  const preferredSubjects = Object.entries(subjectMinutes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([subject]) => subject);

  return {
    averageStudyHours,
    peakProductivityTime,
    consistency,
    preferredSubjects
  };
}

/**
 * Generate insights from habits and recent sessions
 */
function generateInsights(params) {
  const { habits, recentSessions } = params;

  const insights = [];

  // Consistency insights
  if (habits.consistency >= 80) {
    insights.push({
      type: 'positive',
      message: 'Excellent study consistency! Keep up the great work.',
      category: 'consistency'
    });
  } else if (habits.consistency < 50) {
    insights.push({
      type: 'warning',
      message: 'Your study consistency could be improved. Try setting a daily study goal.',
      category: 'consistency'
    });
  }

  // Study hours insights
  if (habits.averageStudyHours < 2) {
    insights.push({
      type: 'suggestion',
      message: 'Consider increasing your daily study time to improve learning outcomes.',
      category: 'study-time'
    });
  } else if (habits.averageStudyHours > 8) {
    insights.push({
      type: 'warning',
      message: 'Be careful not to burn out. Make sure to take adequate breaks.',
      category: 'study-time'
    });
  }

  // Peak productivity insights
  insights.push({
    type: 'info',
    message: `Your peak productivity time is ${habits.peakProductivityTime}. Schedule harder tasks during this time.`,
    category: 'productivity'
  });

  // Recent activity insights
  if (recentSessions && recentSessions.length > 0) {
    const last7Days = recentSessions.filter(s => {
      const sessionDate = new Date(s.startTime);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return sessionDate >= sevenDaysAgo;
    });

    const recentMinutes = last7Days.reduce((sum, s) => sum + s.duration, 0);
    const recentHours = (recentMinutes / 60).toFixed(1);

    insights.push({
      type: 'info',
      message: `You've studied ${recentHours} hours in the last 7 days.`,
      category: 'recent-activity'
    });

    // Check for study streaks
    const studyDates = getUniqueDays(recentSessions).sort();
    const streak = calculateStreak(studyDates);

    if (streak >= 3) {
      insights.push({
        type: 'positive',
        message: `Great job! You're on a ${streak}-day study streak!`,
        category: 'streak'
      });
    }
  }

  // Subject diversity insights
  if (habits.preferredSubjects && habits.preferredSubjects.length > 0) {
    insights.push({
      type: 'info',
      message: `You focus most on: ${habits.preferredSubjects.slice(0, 3).join(', ')}`,
      category: 'subjects'
    });
  }

  return insights;
}

/**
 * Get unique study days from sessions
 */
function getUniqueDays(sessions) {
  const days = new Set();
  sessions.forEach(session => {
    const date = new Date(session.startTime).toDateString();
    days.add(date);
  });
  return Array.from(days);
}

/**
 * Calculate study streak
 */
function calculateStreak(sortedDates) {
  if (sortedDates.length === 0) return 0;

  let streak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    
    const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      currentStreak++;
      streak = Math.max(streak, currentStreak);
    } else if (dayDiff > 1) {
      currentStreak = 1;
    }
  }

  return streak;
}

/**
 * Get default habits when no data available
 */
function getDefaultHabits() {
  return {
    averageStudyHours: 0,
    peakProductivityTime: 'evening',
    consistency: 0,
    preferredSubjects: []
  };
}

module.exports = {
  analyzeStudyHabits,
  generateInsights
};
