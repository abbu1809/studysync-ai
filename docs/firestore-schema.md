# Firestore Database Schema

## Collections Overview

### 1. **users**
Stores user profile, preferences, and study habits.

```javascript
users/{userId}
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Preferences
  preferences: {
    studyHoursPerDay: number,        // Available study hours per day
    studyTimePreference: string,      // 'morning' | 'afternoon' | 'evening' | 'night'
    breakDuration: number,            // Minutes
    sessionDuration: number,          // Minutes
    notificationsEnabled: boolean,
    theme: string,                    // 'light' | 'dark'
  },
  
  // Study Habits (analyzed patterns)
  habits: {
    averageStudyHours: number,
    peakProductivityTime: string,    // 'morning' | 'afternoon' | 'evening' | 'night'
    consistency: number,              // 0-100 score
    preferredSubjects: string[],
    lastAnalyzedAt: timestamp,
  },
  
  // Stats
  stats: {
    totalStudyTime: number,          // Total minutes
    assignmentsCompleted: number,
    documentsUploaded: number,
    chatMessages: number,
  }
}
```

---

### 2. **documents**
Stores uploaded documents and extracted content.

```javascript
documents/{documentId}
{
  id: string,
  userId: string,
  title: string,
  type: string,                      // 'syllabus' | 'assignment' | 'notice' | 'notes'
  fileName: string,
  fileUrl: string,                   // Firebase Storage URL
  fileSize: number,
  mimeType: string,
  
  // Extracted Content
  extractedText: string,             // Raw OCR output
  structuredData: {
    subjects: [
      {
        name: string,
        topics: [
          {
            name: string,
            subtopics: string[],
            estimatedHours: number,
            difficulty: string,      // 'easy' | 'medium' | 'hard'
          }
        ]
      }
    ],
    deadlines: [
      {
        title: string,
        date: timestamp,
        description: string,
        priority: string,            // 'low' | 'medium' | 'high'
      }
    ],
    assignments: [
      {
        title: string,
        subject: string,
        dueDate: timestamp,
        description: string,
        topics: string[],
        estimatedHours: number,
      }
    ]
  },
  
  processingStatus: string,          // 'pending' | 'processing' | 'completed' | 'failed'
  processingError: string,
  
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

---

### 3. **assignments**
Tracks all assignments with status and priority.

```javascript
assignments/{assignmentId}
{
  id: string,
  userId: string,
  documentId: string,                // Reference to source document
  
  title: string,
  subject: string,
  description: string,
  topics: string[],
  
  dueDate: timestamp,
  estimatedHours: number,
  actualHours: number,               // Time actually spent
  
  status: string,                    // 'pending' | 'in-progress' | 'completed' | 'overdue'
  priority: string,                  // 'low' | 'medium' | 'high' | 'urgent'
  difficulty: string,                // 'easy' | 'medium' | 'hard'
  
  // Completion tracking
  completedAt: timestamp,
  completionNotes: string,
  
  // Auto-calculated fields
  daysRemaining: number,
  hoursRemaining: number,
  
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

---

### 4. **studyPlans**
AI-generated study schedules.

```javascript
studyPlans/{planId}
{
  id: string,
  userId: string,
  
  planType: string,                  // 'weekly' | 'custom'
  startDate: timestamp,
  endDate: timestamp,
  
  // Schedule details
  schedule: [
    {
      date: timestamp,
      dayOfWeek: string,
      sessions: [
        {
          id: string,
          startTime: string,         // '09:00'
          endTime: string,           // '11:00'
          subject: string,
          topic: string,
          assignmentId: string,      // Optional
          type: string,              // 'study' | 'assignment' | 'revision' | 'break'
          completed: boolean,
          completedAt: timestamp,
          notes: string,
        }
      ],
      totalPlannedHours: number,
      totalCompletedHours: number,
    }
  ],
  
  // Generation metadata
  generationPrompt: string,
  aiModel: string,                   // 'gemini-pro'
  
  status: string,                    // 'active' | 'completed' | 'abandoned'
  adherenceScore: number,            // 0-100
  
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

---

### 5. **studySessions**
Individual study session logs for habit tracking.

```javascript
studySessions/{sessionId}
{
  id: string,
  userId: string,
  planId: string,                    // Optional reference
  assignmentId: string,              // Optional reference
  
  subject: string,
  topic: string,
  
  startTime: timestamp,
  endTime: timestamp,
  duration: number,                  // Minutes
  
  timeOfDay: string,                 // 'morning' | 'afternoon' | 'evening' | 'night'
  
  // Productivity metrics
  focusScore: number,                // Self-reported 1-5
  notes: string,
  
  createdAt: timestamp,
}
```

---

### 6. **vivaQuestions**
Generated viva questions and answers.

```javascript
vivaQuestions/{questionId}
{
  id: string,
  userId: string,
  subject: string,
  topic: string,
  documentId: string,                // Source document
  
  question: string,
  answer: string,
  difficulty: string,                // 'easy' | 'medium' | 'hard'
  
  // User interaction
  attempted: boolean,
  userAnswer: string,
  isCorrect: boolean,
  attemptedAt: timestamp,
  
  generatedBy: string,               // 'gemini-pro'
  
  createdAt: timestamp,
}
```

---

### 7. **resources**
Recommended learning resources.

```javascript
resources/{resourceId}
{
  id: string,
  userId: string,
  subject: string,
  topic: string,
  
  title: string,
  url: string,
  type: string,                      // 'video' | 'article' | 'documentation' | 'course'
  source: string,                    // 'youtube' | 'medium' | 'official docs'
  
  relevanceScore: number,            // 0-100
  
  // User interaction
  viewed: boolean,
  viewedAt: timestamp,
  helpful: boolean,
  
  recommendedBy: string,             // 'ai' | 'manual'
  
  createdAt: timestamp,
}
```

---

### 8. **chatHistory**
Context-aware chatbot conversation history.

```javascript
chatHistory/{conversationId}
{
  id: string,
  userId: string,
  
  messages: [
    {
      id: string,
      role: string,                  // 'user' | 'assistant'
      content: string,
      timestamp: timestamp,
      
      // Context used for this message
      contextUsed: {
        documents: string[],         // Document IDs
        assignments: string[],       // Assignment IDs
        studyPlan: string,           // Plan ID
      }
    }
  ],
  
  title: string,                     // Auto-generated from first message
  
  createdAt: timestamp,
  updatedAt: timestamp,
}
```

---

### 9. **notifications**
System notifications for deadlines, reminders, etc.

```javascript
notifications/{notificationId}
{
  id: string,
  userId: string,
  
  type: string,                      // 'deadline' | 'reminder' | 'achievement' | 'suggestion'
  title: string,
  message: string,
  
  relatedEntity: {
    type: string,                    // 'assignment' | 'session' | 'plan'
    id: string,
  },
  
  read: boolean,
  readAt: timestamp,
  
  actionUrl: string,                 // Deep link
  
  createdAt: timestamp,
}
```

---

## Indexes

### Required Composite Indexes

1. **assignments**: `userId` ASC, `status` ASC, `dueDate` ASC
2. **assignments**: `userId` ASC, `priority` DESC, `dueDate` ASC
3. **studySessions**: `userId` ASC, `startTime` DESC
4. **documents**: `userId` ASC, `type` ASC, `createdAt` DESC
5. **chatHistory**: `userId` ASC, `updatedAt` DESC
6. **notifications**: `userId` ASC, `read` ASC, `createdAt` DESC

---

## Security Rules Example

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }
    
    // Documents collection
    match /documents/{documentId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Assignments collection
    match /assignments/{assignmentId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Study Plans collection
    match /studyPlans/{planId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Study Sessions collection
    match /studySessions/{sessionId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Viva Questions collection
    match /vivaQuestions/{questionId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Resources collection
    match /resources/{resourceId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Chat History collection
    match /chatHistory/{conversationId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
    }
  }
}
```

---

## Data Flow Examples

### 1. Document Upload Flow
1. User uploads PDF → Storage
2. Backend creates `documents` entry with `processingStatus: 'pending'`
3. OCR extracts text → updates `extractedText`
4. AI structures data → updates `structuredData`
5. Updates `processingStatus: 'completed'`
6. Creates entries in `assignments` if detected

### 2. Study Plan Generation
1. Fetch user's `preferences` and `habits`
2. Fetch all pending `assignments`
3. Fetch `documents` (syllabus)
4. Send to Gemini API with scheduling prompt
5. Create `studyPlans` entry with generated schedule

### 3. Habit Analysis
1. Query `studySessions` for last 30 days
2. Analyze timing patterns, consistency
3. Update user's `habits` object
4. Trigger plan rebalancing if needed

---

This schema is optimized for:
- Fast queries with proper indexing
- Scalability with Firestore's NoSQL structure
- Data denormalization for read performance
- Clear relationships between entities
- Easy backup and migration
