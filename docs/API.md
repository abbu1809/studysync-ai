# API Documentation - StudySync AI

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
All endpoints (except `/auth/*`) require authentication via Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

---

## 🔐 Authentication

### Register User
Creates user profile in Firestore after Firebase Auth registration.

**POST** `/auth/register`

**Body:**
```json
{
  "uid": "firebase-uid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "User profile created successfully",
  "user": { ... }
}
```

---

## 👤 User Management

### Get User Profile
**GET** `/users/profile`

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "...",
    "email": "...",
    "preferences": { ... },
    "habits": { ... },
    "stats": { ... }
  }
}
```

### Update Preferences
**PUT** `/users/preferences`

**Body:**
```json
{
  "studyHoursPerDay": 4,
  "studyTimePreference": "evening",
  "breakDuration": 15,
  "sessionDuration": 45,
  "notificationsEnabled": true,
  "theme": "dark"
}
```

---

## 📄 Document Management

### Upload Document
**POST** `/documents`

**Content-Type:** `multipart/form-data`

**Body:**
- `file`: PDF or image file
- `title`: Document title
- `type`: `syllabus|assignment|notice|notes`

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully. Processing started.",
  "document": {
    "id": "...",
    "title": "...",
    "type": "syllabus",
    "processingStatus": "pending",
    ...
  }
}
```

### Get All Documents
**GET** `/documents?type=syllabus&status=completed`

**Query Parameters:**
- `type` (optional): Filter by document type
- `status` (optional): Filter by processing status

**Response:**
```json
{
  "success": true,
  "count": 5,
  "documents": [ ... ]
}
```

### Get Document by ID
**GET** `/documents/:documentId`

### Delete Document
**DELETE** `/documents/:documentId`

### Reprocess Document
**POST** `/documents/:documentId/reprocess`

---

## 📝 Assignment Management

### Get All Assignments
**GET** `/assignments?status=pending&priority=high`

**Query Parameters:**
- `status`: `pending|in-progress|completed|overdue`
- `priority`: `low|medium|high|urgent`
- `subject`: Filter by subject name

**Response:**
```json
{
  "success": true,
  "count": 10,
  "assignments": [
    {
      "id": "...",
      "title": "...",
      "subject": "...",
      "dueDate": "2026-01-20",
      "priority": "high",
      "status": "pending",
      "daysRemaining": 5,
      ...
    }
  ]
}
```

### Create Assignment
**POST** `/assignments`

**Body:**
```json
{
  "title": "Assignment 1",
  "subject": "Mathematics",
  "description": "...",
  "topics": ["Calculus", "Derivatives"],
  "dueDate": "2026-01-20",
  "estimatedHours": 3,
  "difficulty": "medium"
}
```

### Update Assignment Status
**PATCH** `/assignments/:assignmentId/status`

**Body:**
```json
{
  "status": "completed",
  "actualHours": 2.5,
  "completionNotes": "Finished ahead of schedule"
}
```

---

## 📅 Study Plan

### Generate Study Plan
**POST** `/study-plans/generate`

**Body:**
```json
{
  "startDate": "2026-01-15",
  "endDate": "2026-01-31",
  "includeAssignments": ["assignment-id-1", "assignment-id-2"],
  "excludeDays": [0, 6]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Study plan generated successfully",
  "plan": {
    "id": "...",
    "schedule": [
      {
        "date": "2026-01-15",
        "dayOfWeek": "Wednesday",
        "sessions": [
          {
            "id": "...",
            "startTime": "09:00",
            "endTime": "11:00",
            "subject": "Mathematics",
            "topic": "Calculus",
            "type": "study",
            "completed": false
          }
        ]
      }
    ]
  }
}
```

### Update Session
**PATCH** `/study-plans/:planId/sessions/:sessionId`

**Body:**
```json
{
  "completed": true,
  "notes": "Good session"
}
```

### Rebalance Plan
**POST** `/study-plans/:planId/rebalance`

---

## 💬 Chat

### Send Message
**POST** `/chat/message`

**Body:**
```json
{
  "message": "What are the key topics in calculus?",
  "conversationId": "..." // optional, creates new if null
}
```

**Response:**
```json
{
  "success": true,
  "conversationId": "...",
  "message": {
    "id": "...",
    "role": "assistant",
    "content": "The key topics in calculus include...",
    "timestamp": "..."
  }
}
```

### Get Conversations
**GET** `/chat/conversations`

### Get Conversation
**GET** `/chat/conversations/:conversationId`

---

## ❓ Viva Questions

### Generate Questions
**POST** `/viva/generate`

**Body:**
```json
{
  "subject": "Mathematics",
  "topic": "Calculus",
  "documentId": "...", // optional
  "count": 5,
  "difficulty": "medium" // easy|medium|hard|mixed
}
```

**Response:**
```json
{
  "success": true,
  "message": "5 questions generated successfully",
  "questions": [
    {
      "id": "...",
      "question": "What is the derivative of x²?",
      "answer": "The derivative of x² is 2x...",
      "difficulty": "easy"
    }
  ]
}
```

### Submit Answer
**POST** `/viva/:questionId/answer`

**Body:**
```json
{
  "userAnswer": "The derivative is 2x"
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "isCorrect": true,
    "score": 95,
    "feedback": "Excellent answer!"
  }
}
```

---

## 📚 Resources

### Get Recommendations
**GET** `/resources/recommendations?subject=Mathematics&topic=Calculus`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "resources": [
    {
      "id": "...",
      "title": "Khan Academy Calculus",
      "url": "https://...",
      "type": "course",
      "source": "Khan Academy",
      "relevanceScore": 95
    }
  ]
}
```

### Mark as Viewed
**POST** `/resources/:resourceId/view`

### Submit Feedback
**POST** `/resources/:resourceId/feedback`

**Body:**
```json
{
  "helpful": true
}
```

---

## 📊 Habits

### Log Study Session
**POST** `/habits/sessions`

**Body:**
```json
{
  "subject": "Mathematics",
  "topic": "Calculus",
  "startTime": "2026-01-15T09:00:00Z",
  "endTime": "2026-01-15T11:00:00Z",
  "focusScore": 4,
  "notes": "Productive session"
}
```

### Get Sessions
**GET** `/habits/sessions?startDate=2026-01-01&endDate=2026-01-31`

### Analyze Habits
**POST** `/habits/analyze`

**Response:**
```json
{
  "success": true,
  "habits": {
    "averageStudyHours": 3.5,
    "peakProductivityTime": "morning",
    "consistency": 85,
    "preferredSubjects": ["Mathematics", "Physics"]
  }
}
```

### Get Insights
**GET** `/habits/insights`

**Response:**
```json
{
  "success": true,
  "habits": { ... },
  "insights": [
    {
      "type": "positive",
      "message": "Great job! You're on a 7-day study streak!",
      "category": "streak"
    }
  ]
}
```

---

## 🚨 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes:
- `TOKEN_EXPIRED` (401): Authentication token expired
- `INVALID_TOKEN` (401): Invalid authentication token
- `PERMISSION_DENIED` (403): User doesn't have access
- `VALIDATION_ERROR` (400): Invalid request data
- `NOT_FOUND` (404): Resource not found
- `INTERNAL_ERROR` (500): Server error

---

## 📊 Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window per IP
- **Response when exceeded:**
  ```json
  {
    "success": false,
    "message": "Too many requests from this IP, please try again later."
  }
  ```

---

## 🔄 Webhooks (Cloud Functions)

### Document Processing Complete
Triggered when document OCR processing completes.

**Event:** `documents/{documentId}` update

**Notification Created:**
```json
{
  "userId": "...",
  "type": "suggestion",
  "title": "Document Processed",
  "message": "Your document has been processed successfully!"
}
```

---

## 📝 Notes

1. All dates are in ISO 8601 format
2. File uploads limited to 10MB
3. Supported file types: PDF, JPG, PNG
4. Timestamps use Firestore server timestamp
5. All responses include `success` boolean field
