# StudySync AI 🎓

**An AI-powered academic assistant that transforms unstructured academic data into a personalized, adaptive study ecosystem.**

> "StudySync AI leverages cutting-edge Google AI technologies to convert scattered syllabi, assignments, and study materials into a unified, intelligent learning platform — empowering students to study smarter, not harder."

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Database-Firebase-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)
[![Google AI](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat&logo=google)](https://ai.google/)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Application Workflows](#-application-workflows)
- [Detailed Feature Description](#-detailed-feature-description)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [CI/CD & Deployment](#-cicd--deployment)
- [Email Notifications](#-email-notifications)
- [Security](#-security)
- [Future Enhancements](#-future-enhancements)
- [Upcoming Features](#-upcoming-features)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**StudySync AI** is a comprehensive academic management platform that addresses the common challenge students face: managing fragmented academic information across multiple sources. By combining advanced AI capabilities with intuitive design, StudySync AI creates a centralized, intelligent study companion that:

- **Eliminates Manual Planning**: Automatically generates personalized study schedules
- **Processes Unstructured Data**: Converts PDFs, images, and documents into structured information
- **Adapts to Your Habits**: Learns your study patterns and optimizes recommendations
- **Provides Intelligent Assistance**: Offers context-aware help through an AI chatbot
- **Tracks Progress**: Monitors assignments, habits, and academic performance
- **Sends Smart Reminders**: Email notifications for deadlines and pending tasks

### Problem Statement

Students typically struggle with:
- Scattered information across syllabi, emails, and announcements
- Manual study planning consuming valuable time
- Missing deadlines due to poor tracking
- Difficulty prioritizing tasks across multiple subjects
- Lack of personalized study guidance

### Our Solution

StudySync AI automates the entire academic workflow using AI:
1. **Upload** syllabi, assignments, or study materials
2. **AI extracts** and structures the information
3. **Generates** personalized study plans and schedules
4. **Tracks** progress and adapts to your habits
5. **Reminds** you of deadlines and pending tasks
6. **Assists** you with AI-powered Q&A

---

## ✨ Features

### 🤖 AI-Powered Core Features

#### 1. Smart Document Processing
- **OCR Technology**: Extract text from PDFs, images, and scanned documents
- **Intelligent Parsing**: Identify course names, topics, deadlines, and requirements
- **Multi-Format Support**: PDF, JPG, PNG, DOCX
- **Batch Processing**: Upload multiple documents simultaneously
- **Automatic Categorization**: Organize by subject, type, and priority

#### 2. Intelligent Study Planner
- **AI-Generated Schedules**: Hour-by-hour study plans based on deadlines
- **Adaptive Planning**: Adjusts to your availability and preferences
- **Priority-Based**: Focuses on urgent and important tasks
- **Break Optimization**: Includes strategic breaks for better retention
- **Progress Tracking**: Visual indicators of plan completion

#### 3. Assignment Management
- **Centralized Dashboard**: View all assignments in one place
- **Priority System**: Automatic prioritization based on deadlines and importance
- **Status Tracking**: Pending, In Progress, Completed
- **Deadline Alerts**: Visual indicators for upcoming deadlines
- **Subject Categorization**: Filter by course or subject

#### 4. Habit-Aware Intelligence
- **Pattern Recognition**: Identifies your peak productivity hours
- **Study Consistency Tracking**: Monitors regular study habits
- **Preference Learning**: Adapts to your study style
- **Performance Analytics**: Shows trends and improvements
- **Personalized Recommendations**: Suggests optimal study times

#### 5. Viva/Exam Q&A Generator
- **Syllabus Analysis**: Generates relevant exam questions
- **AI-Powered Answers**: Provides comprehensive responses
- **Topic Coverage**: Ensures all syllabus topics are covered
- **Difficulty Levels**: Ranges from basic to advanced
- **Practice Mode**: Self-assessment capabilities

#### 6. Resource Recommendations
- **Curated Content**: AI-selected learning materials
- **Multi-Format**: Videos, articles, tutorials, practice problems
- **Context-Aware**: Based on current study topics
- **Quality Filtered**: High-rated and relevant resources
- **Bookmarking**: Save favorite resources

#### 7. Context-Aware AI Chatbot
- **Full Context**: Access to all your academic data
- **Intelligent Responses**: Powered by Google Gemini
- **Multi-Turn Conversations**: Maintains conversation history
- **Subject-Specific**: Understands your courses and materials
- **Quick Answers**: Instant help with concepts and doubts

#### 8. Email Notification System
- **Welcome Emails**: Beautiful onboarding messages
- **Deadline Reminders**: Automated alerts 1-3 days before due dates
- **Daily Summaries**: Optional digest of pending tasks
- **Customizable**: User-controlled notification preferences
- **Professional Design**: Responsive HTML email templates

### 🎨 User Experience Features

- **Dark/Light Themes**: Comfortable studying in any environment
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Intuitive Navigation**: Clean, modern interface
- **Real-Time Updates**: Live data synchronization
- **Quick Actions**: Shortcuts for common tasks
- **Progress Visualization**: Charts and graphs for analytics

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                   │
│              (Web Browser / Mobile Device)                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React.js Application (Vercel)                           │   │
│  │  - Component-based UI                                    │   │
│  │  - State Management (Context API)                        │   │
│  │  - Real-time Updates                                     │   │
│  │  - Responsive Design (Tailwind CSS)                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       │ REST API / WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Node.js + Express.js (Render)                           │   │
│  │  - RESTful API Endpoints                                 │   │
│  │  - Authentication Middleware                             │   │
│  │  - Business Logic Controllers                            │   │
│  │  - Service Layer Architecture                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└───┬────────┬────────┬────────┬────────┬────────┬───────────┬────┘
    │        │        │        │        │        │           │
    │        │        │        │        │        │           │
┌───▼───┐ ┌─▼──┐ ┌───▼───┐ ┌──▼──┐ ┌──▼──┐ ┌───▼────┐ ┌────▼────┐
│Firebase│ │ AI │ │Vision│ │Cloud│ │Email│ │GitHub  │ │Storage  │
│ Auth   │ │API │ │ OCR  │ │inary│ │SMTP │ │Actions │ │Service  │
└────────┘ └────┘ └──────┘ └─────┘ └─────┘ └────────┘ └─────────┘
│                    EXTERNAL SERVICES LAYER                      │
│  - Firebase Authentication & Firestore                          │
│  - Google Gemini AI (Generative AI)                             │
│  - Google Vision API (OCR/Document AI)                          │
│  - Cloudinary (Image/File Storage)                              │
│  - Nodemailer (Email Notifications)                             │
│  - GitHub Actions (CI/CD & Automation)                          │
└─────────────────────────────────────────────────────────────────┘
```

### Detailed Component Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     FRONTEND ARCHITECTURE                        │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐    │
│  │   Components    │  │    Contexts     │  │     Pages      │    │
│  │  - Layout       │  │  - AuthContext  │  │  - Dashboard   │    │
│  │  - DeleteModal  │  │  - ThemeContext │  │  - Assignments │    │
│  │  - PrivateRoute │  │                 │  │  - Documents   │    │
│  └─────────────────┘  └─────────────────┘  │  - StudyPlanner│    │
│                                            │  - Chat        │    │
│  ┌─────────────────┐  ┌─────────────────┐  │  - Viva        │    │
│  │    Services     │  │     Styles      │  │  - Habits      │    │
│  │  - API Client   │  │  - Tailwind CSS │  │  - Settings    │    │
│  │  - Firebase SDK │  │  - Dark/Light   │  └────────────────┘    │
│  └─────────────────┘  └─────────────────┘                        │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                     BACKEND ARCHITECTURE                         │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    API Routes Layer                        │  │
│  │  /api/auth          /api/documents     /api/chat           │  │
│  │  /api/assignments   /api/study-plans   /api/viva           │  │
│  │  /api/habits        /api/analytics     /api/notifications  │  │
│  └───────────────┬────────────────────────────────────────────┘  │
│                  │                                               │
│  ┌───────────────▼────────────────────────────────────────────┐  │
│  │                  Controllers Layer                         │  │
│  │  - Request Validation                                      │  │
│  │  - Business Logic Orchestration                            │  │
│  │  - Response Formatting                                     │  │
│  └───────────────┬────────────────────────────────────────────┘  │
│                  │                                               │
│  ┌───────────────▼────────────────────────────────────────────┐  │
│  │                   Services Layer                           │  │
│  │  • OCR Service      - Document text extraction             │  │
│  │  • AI Service       - Gemini API interactions              │  │
│  │  • Email Service    - Notification delivery                │  │
│  │  • Study Plan       - Schedule generation                  │  │
│  │  • Chat Service     - Conversation management              │  │
│  │  • Viva Service     - Q&A generation                       │  │
│  └───────────────┬────────────────────────────────────────────┘  │
│                  │                                               │
│  ┌───────────────▼────────────────────────────────────────────┐  │
│  │                  Middleware Layer                          │  │
│  │  - Authentication (JWT/Firebase Token)                     │  │
│  │  - Error Handling                                          │  │
│  │  - Request Validation                                      │  │
│  │  - Rate Limiting                                           │  │
│  │  - CORS Configuration                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
USER ACTION → FRONTEND → API CALL → BACKEND → SERVICES → EXTERNAL APIs
     ↑                                                         │
     └──────────── RESPONSE ← CONTROLLER ← PROCESSING ←────────┘
```

### Database Schema (Firestore)

```
users/
  └── {userId}/
      ├── email
      ├── displayName
      ├── preferences/
      │   ├── studyHoursPerDay
      │   ├── emailNotifications
      │   └── theme
      └── stats/
          ├── totalStudyTime
          └── assignmentsCompleted

documents/
  └── {documentId}/
      ├── userId
      ├── title
      ├── type
      ├── extractedText
      └── structuredData

assignments/
  └── {assignmentId}/
      ├── userId
      ├── title
      ├── dueDate
      ├── status
      └── priority

studyPlans/
  └── {planId}/
      ├── userId
      ├── schedule[]
      ├── generatedAt
      └── status

habits/
  └── {habitId}/
      ├── userId
      ├── name
      └── completionLog{}

chatHistory/
  └── {sessionId}/
      ├── userId
      └── messages[]
```

---

## 🛠️ Technology Stack

### Frontend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **React.js** | UI Framework | 18.x |
| **Tailwind CSS** | Styling & Design System | 3.x |
| **React Router** | Client-side Routing | 6.x |
| **Firebase SDK** | Authentication & Realtime | 10.x |
| **Axios** | HTTP Client | 1.x |
| **React Toastify** | Notifications | 9.x |

### Backend Technologies
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime Environment | 18+ |
| **Express.js** | Web Framework | 4.x |
| **Firebase Admin** | Server-side Firebase | 12.x |
| **Nodemailer** | Email Service | 6.x |
| **Multer** | File Upload Handling | 1.x |
| **Helmet** | Security Headers | 7.x |
| **Morgan** | HTTP Logging | 1.x |
| **Compression** | Response Compression | 1.x |

### AI & Cloud Services
| Service | Purpose | Provider |
|---------|---------|----------|
| **Google Gemini** | Generative AI (Planning, Q&A, Chat) | Google AI |
| **Vision API** | OCR & Document Processing | Google Cloud |
| **Document AI** | Advanced Document Understanding | Google Cloud |
| **Firebase Auth** | User Authentication | Firebase |
| **Cloud Firestore** | NoSQL Database | Firebase |
| **Cloudinary** | Media Storage & CDN | Cloudinary |
| **GitHub Actions** | CI/CD & Automation | GitHub |

### DevOps & Deployment
| Tool | Purpose |
|------|---------|
| **Vercel** | Frontend Hosting |
| **Render** | Backend Hosting |
| **GitHub Actions** | Automated Testing & Deployment |
| **Firebase Hosting** | Alternative Hosting Option |

---

## 🔄 Application Workflows

### 1. User Registration & Onboarding Flow

```
┌─────────────┐
│   User      │
│  Visits App │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Sign Up with     │
│ Email/Google     │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Firebase Authentication  │
│ - Create User Account    │
│ - Generate Auth Token    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Backend: Create Profile  │
│ - Store User Data        │
│ - Set Default Preferences│
│ - Initialize Stats       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Send Welcome Email       │
│ - Beautiful HTML Email   │
│ - Feature Overview       │
│ - Quick Start Guide      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Redirect to Dashboard    │
│ - Show Empty State       │
│ - Onboarding Tips        │
└──────────────────────────┘
```

### 2. Document Upload & Processing Workflow

```
┌──────────────────┐
│ User Uploads PDF │
│ or Image File    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Frontend Validation          │
│ - Check File Type            │
│ - Verify Size Limit (<10MB)  │
│ - Show Upload Progress       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Upload to Cloudinary         │
│ - Store Original File        │
│ - Generate Secure URL        │
│ - Return File Metadata       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Google Vision OCR Processing │
│ - Extract All Text           │
│ - Detect Document Structure  │
│ - Identify Tables/Lists      │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ AI Structuring (Gemini)      │
│ - Parse Course Names         │
│ - Extract Topics/Chapters    │
│ - Identify Deadlines         │
│ - Detect Assignment Details  │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Save to Firestore            │
│ documents/{documentId}       │
│ - Original Text              │
│ - Structured Data            │
│ - Metadata                   │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Update UI                    │
│ - Show Success Message       │
│ - Display Extracted Data     │
│ - Enable Study Plan Creation │
└──────────────────────────────┘
```

### 3. AI Study Plan Generation Workflow

```
┌─────────────────────┐
│ User Clicks         │
│ "Generate Plan"     │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────┐
│ Collect User Input           │
│ - Study Hours/Day            │
│ - Preferred Times            │
│ - Break Duration             │
│ - Subject Priorities         │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Gather Context Data          │
│ - All Uploaded Syllabi       │
│ - Pending Assignments        │
│ - Exam Dates                 │
│ - Past Study Habits          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Construct AI Prompt          │
│ "Create a study plan for:    │
│  - Subject: Math, Physics    │
│  - Available: 4 hours/day    │
│  - Deadlines: Assignment X   │
│  - Preference: Evening study"│
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Google Gemini AI Processing  │
│ - Analyze Syllabus Content   │
│ - Calculate Time Allocation  │
│ - Optimize Task Sequencing   │
│ - Include Strategic Breaks   │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Format Schedule Output       │
│ {                            │
│   "schedule": [              │
│     {                        │
│       "time": "9:00-10:00",  │
│       "task": "Math Ch-1",   │
│       "type": "study"        │
│     },                       │
│     { "time": "10:00-10:15", │
│       "task": "Break"        │
│     }                        │
│   ]                          │
│ }                            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Save to Firestore            │
│ studyPlans/{planId}          │
│ - User ID                    │
│ - Generated Schedule         │
│ - Creation Timestamp         │
│ - Status: Active             │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Display Interactive Plan     │
│ - Calendar View              │
│ - Task Checkboxes            │
│ - Progress Tracker           │
│ - Edit/Adjust Options        │
└──────────────────────────────┘
```

### 4. Assignment Tracking Workflow

```
┌─────────────────────┐
│ Assignment Created  │
│ (Manual/Document)   │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────┐
│ Store in Firestore           │
│ assignments/{assignmentId}   │
│ - Title, Subject             │
│ - Due Date, Priority         │
│ - Status: Pending            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Calculate Days Until Due     │
│ - If < 3 days: High Priority │
│ - If < 1 day: Urgent         │
│ - If overdue: Critical       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Display on Dashboard         │
│ - Sort by Priority/Date      │
│ - Color-coded Indicators     │
│ - Quick Action Buttons       │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Automated Email Reminders    │
│ (GitHub Actions - Daily)     │
│ - Check Due Dates            │
│ - Send Reminder Emails       │
│ - 3 days, 1 day, same day    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ User Marks Complete          │
│ - Update Status              │
│ - Record Completion Time     │
│ - Update Statistics          │
└──────────────────────────────┘
```

### 5. AI Chat Interaction Workflow

```
┌─────────────────────┐
│ User Asks Question  │
│ in Chat Interface   │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────┐
│ Retrieve User Context        │
│ - All Documents              │
│ - Current Study Plan         │
│ - Recent Assignments         │
│ - Chat History               │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Construct Enhanced Prompt    │
│ "Context: User is studying   │
│  Physics Chapter 5.          │
│  User asked: 'Explain        │
│  Newton's Laws'              │
│  Provide concise answer."    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Send to Gemini AI            │
│ - Use Conversation History   │
│ - Context-Aware Processing   │
│ - Generate Response          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Store Conversation           │
│ chatHistory/{sessionId}      │
│ - Question                   │
│ - Answer                     │
│ - Timestamp                  │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Display Response             │
│ - Markdown Formatting        │
│ - Code Highlighting          │
│ - Real-time Streaming        │
└──────────────────────────────┘
```

### 6. Email Notification Workflow

```
┌──────────────────────────────┐
│ GitHub Actions Cron Job      │
│ Runs Every 14 Minutes        │
└──────────┬───────────────────┘
           │
           ├────────────────────┐
           │                    │
           ▼                    ▼
┌──────────────────┐  ┌────────────────────┐
│ Keep Render Alive│  │ Daily Notifications│
│ - Ping /health   │  │ (9 AM & 6 PM UTC)  │
└──────────────────┘  └────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │ Check All Users          │
                    │ - Get Assignments        │
                    │ - Filter Due in 3 Days   │
                    │ - Check Preferences      │
                    └────────┬─────────────────┘
                             │
                             ▼
                    ┌──────────────────────────┐
                    │ For Each User:           │
                    │ - Send Deadline Reminder │
                    │ - Send Daily Summary     │
                    │ (if opted in)            │
                    └────────┬─────────────────┘
                             │
                             ▼
                    ┌──────────────────────────┐
                    │ Nodemailer SMTP          │
                    │ - Connect to Gmail       │
                    │ - Send HTML Email        │
                    │ - Track Delivery         │
                    └──────────────────────────┘
```

---

## 📖 Detailed Feature Description

### Smart Document Processing

**How it Works:**
1. User uploads PDF/image through drag-and-drop interface
2. File is validated (type, size) and uploaded to Cloudinary for secure storage
3. Google Vision API extracts all text with high accuracy
4. Gemini AI analyzes the extracted text to identify:
   - Course/subject names
   - Chapter/topic list
   - Learning objectives
   - Assignment requirements
   - Important dates and deadlines
5. Structured data is saved to Firestore for easy retrieval
6. UI updates with extracted information in organized format

**Supported Formats:**
- PDF documents (multi-page)
- Images (JPG, PNG, WEBP)
- Scanned documents
- Screenshots
- Handwritten notes (with varying accuracy)

**Use Cases:**
- Upload semester syllabus to auto-populate course structure
- Scan assignment sheets to extract requirements
- Process exam timetables for deadline tracking
- Digitize handwritten notes for searchability

---

### Intelligent Study Planner

**Planning Algorithm:**
1. **Data Collection:**
   - User preferences (hours/day, time slots, break duration)
   - All course syllabi with topic lists
   - Upcoming assignment deadlines
   - Past study patterns and productivity data

2. **AI Analysis (Gemini):**
   - Calculates total study time needed per subject
   - Prioritizes topics based on exam/deadline proximity
   - Distributes workload evenly across available days
   - Inserts strategic breaks (Pomodoro-inspired)
   - Avoids overloading single days

3. **Schedule Generation:**
   - Hour-by-hour breakdown of tasks
   - Color-coded by subject
   - Includes specific chapters/topics
   - Mixed activities (reading, practice, revision)

4. **Adaptive Features:**
   - Learns from completion patterns
   - Adjusts difficulty based on performance
   - Reschedules missed tasks intelligently
   - Suggests extra study for weak areas

**Example Output:**
```
Monday, Jan 6
9:00 - 10:30   Mathematics - Calculus Chapter 3
10:30 - 10:45  Break
10:45 - 12:15  Physics - Thermodynamics Revision
12:15 - 1:00   Lunch
1:00 - 2:30    Programming - Practice Problems
2:30 - 2:45    Break
2:45 - 4:00    English - Essay Writing
```

---

### Assignment Management System

**Features:**
- **Automatic Import:** Extracts assignments from uploaded documents
- **Manual Entry:** Add custom assignments with details
- **Priority Calculation:**
  ```
  Priority = (Importance × 0.4) + (Urgency × 0.6)
  Urgency = Days Until Due Date
  Importance = User-defined (Low/Medium/High)
  ```
- **Status Workflow:** Pending → In Progress → Completed
- **Filters & Search:** By subject, status, date range
- **Deadline Visualization:** Calendar view and list view

**Email Reminders:**
- 3 days before: "Upcoming deadline" notification
- 1 day before: "Due tomorrow" urgent alert
- Same day: "Due today" critical reminder

---

### Habit Tracking & Analytics

**Tracked Metrics:**
- Daily study hours logged
- Completion rate of planned tasks
- Most productive time of day
- Subject-wise time distribution
- Consistency streaks

**AI Insights:**
- "You study best between 7-9 PM"
- "Your Math completion rate is 85%"
- "7-day study streak! Keep going!"
- "Consider morning slots for better focus"

**Visualization:**
- Line charts for study hours over time
- Heatmap showing productivity patterns
- Pie charts for subject distribution
- Progress bars for habit consistency

---

### Viva/Exam Q&A Generator

**Generation Process:**
1. User selects subject and topics
2. AI analyzes syllabus content
3. Generates questions at various difficulty levels:
   - **Basic:** Definitions, concepts
   - **Intermediate:** Applications, examples
   - **Advanced:** Analysis, problem-solving

4. Provides comprehensive answers with explanations
5. Saves Q&A pairs for future reference

**Example:**
```
Q: Explain Newton's Second Law of Motion.
A: Newton's Second Law states that the acceleration of an 
   object is directly proportional to the net force acting 
   on it and inversely proportional to its mass. 
   
   Formula: F = ma
   Where F is force, m is mass, a is acceleration.
   
   Example: A car accelerates faster with more engine power
   (force) and slower if it's heavier (mass).
```

---

### Context-Aware AI Chatbot

**Capabilities:**
- Answers subject-specific questions
- Explains concepts from uploaded materials
- Helps with problem-solving
- Provides study tips and strategies
- Remembers conversation context
- Accesses all user's academic data

**Example Interactions:**
```
User: "What topics should I focus on for tomorrow's test?"
Bot:  "Based on your study plan and syllabus, you should 
       prioritize:
       1. Calculus - Integration techniques
       2. Physics - Kinematics problems
       3. Programming - Loops and arrays
       
       You've completed 70% of your prep. I recommend 
       spending 2 more hours on Integration."

User: "Explain integration by parts"
Bot:  [Provides detailed explanation with formulas and examples]
```

---

### Email Notification System

**Types of Emails:**

1. **Welcome Email (Sent on Registration)**
   - Personalized greeting
   - Feature overview with icons
   - Quick start guide
   - Link to dashboard
   - Professional HTML design

2. **Deadline Reminders (Automated Daily)**
   - Assignment details
   - Days until due date
   - Urgency indicator (color-coded)
   - Direct link to assignment page

3. **Daily Summary (Opt-in)**
   - Pending assignments count
   - Incomplete habits
   - Active study plans
   - Link to dashboard

**Customization:**
- Enable/disable all notifications
- Choose which types to receive
- Set preferred delivery time (future enhancement)

---

## 📁 Project Structure

```
studysync-ai/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml              # Backend CI/CD pipeline
│       ├── frontend-ci.yml             # Frontend CI/CD pipeline
│       ├── full-test.yml               # Complete project tests
│       ├── keep-render-alive.yml       # Prevent backend spin-down
│       └── daily-notifications.yml     # Automated email reminders
│
├── frontend/                            # React Application
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js              # Main app layout
│   │   │   ├── DeleteModal.js         # Confirmation modals
│   │   │   └── PrivateRoute.js        # Auth-protected routes
│   │   ├── config/
│   │   │   └── firebase.js            # Firebase configuration
│   │   ├── contexts/
│   │   │   ├── AuthContext.js         # Authentication state
│   │   │   └── ThemeContext.js        # Dark/Light theme
│   │   ├── pages/
│   │   │   ├── Login.js               # Authentication page
│   │   │   ├── Register.js            # User registration
│   │   │   ├── Dashboard.js           # Main dashboard
│   │   │   ├── Documents.js           # Document management
│   │   │   ├── Assignments.js         # Assignment tracker
│   │   │   ├── StudyPlanner.js        # AI study planner
│   │   │   ├── Chat.js                # AI chatbot
│   │   │   ├── VivaQuestions.js       # Q&A generator
│   │   │   ├── Habits.js              # Habit tracking
│   │   │   └── Settings.js            # User preferences
│   │   ├── services/
│   │   │   ├── api.js                 # API client
│   │   │   └── index.js              # Service exports
│   │   ├── styles/
│   │   │   ├── index.css             # Global styles
│   │   │   ├── dark.css              # Dark theme
│   │   │   └── light.css             # Light theme
│   │   ├── App.js                     # Root component
│   │   └── index.js                   # Entry point
│   ├── .env.example                    # Environment template
│   ├── package.json
│   ├── tailwind.config.js             # Tailwind configuration
│   └── postcss.config.js
│
├── backend/                             # Express API Server
│   ├── src/
│   │   ├── config/
│   │   │   ├── firebase.js            # Firebase Admin setup
│   │   │   ├── gemini.js              # Gemini AI client
│   │   │   ├── googleCloud.js         # Vision API setup
│   │   │   └── cloudinary.js          # Image storage
│   │   ├── controllers/
│   │   │   ├── auth.controller.js     # Authentication logic
│   │   │   ├── user.controller.js     # User management
│   │   │   ├── document.controller.js # Document processing
│   │   │   ├── assignment.controller.js # Assignments
│   │   │   ├── studyPlan.controller.js # Study planning
│   │   │   ├── chat.controller.js     # Chat interactions
│   │   │   ├── viva.controller.js     # Q&A generation
│   │   │   ├── habit.controller.js    # Habit tracking
│   │   │   └── analytics.controller.js # Analytics
│   │   ├── middleware/
│   │   │   ├── auth.js                # JWT/Firebase auth
│   │   │   ├── errorHandler.js        # Error handling
│   │   │   └── validation.js          # Input validation
│   │   ├── routes/
│   │   │   ├── auth.routes.js         # Auth endpoints
│   │   │   ├── user.routes.js         # User endpoints
│   │   │   ├── document.routes.js     # Document endpoints
│   │   │   ├── assignment.routes.js   # Assignment endpoints
│   │   │   ├── studyPlan.routes.js    # Study plan endpoints
│   │   │   ├── chat.routes.js         # Chat endpoints
│   │   │   ├── viva.routes.js         # Viva endpoints
│   │   │   ├── habit.routes.js        # Habit endpoints
│   │   │   ├── analytics.routes.js    # Analytics endpoints
│   │   │   └── notification.routes.js # Email notifications
│   │   ├── services/
│   │   │   ├── ocr.service.js         # OCR processing
│   │   │   ├── studyPlan.service.js   # Plan generation
│   │   │   ├── chat.service.js        # Chat logic
│   │   │   ├── viva.service.js        # Q&A generation
│   │   │   ├── habit.service.js       # Habit analysis
│   │   │   ├── resource.service.js    # Resource recommendations
│   │   │   ├── email.service.js       # Email sending
│   │   │   ├── notification.service.js # Batch notifications
│   │   │   └── structuring.service.js # Data structuring
│   │   └── server.js                  # Express app entry
│   ├── .env.example                    # Environment template
│   └── package.json
│
├── functions/                           # Firebase Cloud Functions
│   ├── index.js                         # Function definitions
│   └── package.json
│
├── docs/                                # Documentation
│   ├── CICD_SETUP.md                   # CI/CD guide
│   ├── EMAIL_NOTIFICATIONS.md          # Email setup
│   ├── EMAIL_TESTING.md                # Testing guide
│   └── RENDER_KEEP_ALIVE.md            # Keep-alive setup
│
├── .gitignore
├── firebase.json                        # Firebase configuration
├── firestore.rules                      # Database security rules
├── storage.rules                        # Storage security rules
├── render.yaml                          # Render deployment config
├── vercel.json                          # Vercel deployment config
└── README.md                            # This file
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **Firebase Account** (free tier sufficient)
- **Google Cloud Platform Account** (for AI services)
- **Cloudinary Account** (free tier)
- **Git** & **GitHub Account**

### Step 1: Clone Repository

```bash
git clone https://github.com/abbu1809/studysync-ai.git
cd studysync-ai
```

### Step 2: Firebase Setup

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Name it "StudySync AI" (or your choice)
   - Disable Google Analytics (optional)

2. **Enable Services:**
   - **Authentication**: Enable Email/Password and Google Sign-In
   - **Firestore Database**: Create in production mode
   - **Storage**: Enable for file uploads

3. **Download Service Account:**
   - Project Settings → Service Accounts → Generate New Private Key
   - Save as `backend/config/serviceAccountKey.json`
   - ⚠️ **Never commit this file to Git!**

4. **Get Firebase Config:**
   - Project Settings → General → Your apps → Web app
   - Copy configuration values

### Step 3: Google Cloud Setup

1. **Enable APIs:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable **Vertex AI API** (for Gemini)
   - Enable **Cloud Vision API** (for OCR)
   - Enable **Document AI API** (optional, for advanced OCR)

2. **Get API Keys:**
   - APIs & Services → Credentials → Create Credentials → API Key
   - Copy the key for `GEMINI_API_KEY`

### Step 4: Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com/)
2. Create free account
3. Copy Cloud Name, API Key, API Secret from Dashboard

### Step 5: Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate app password for "Mail"
4. Copy the 16-character password

### Step 6: Environment Configuration

#### Backend Environment (.env in /backend)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google AI Services
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_CLOUD_API_KEY=your-cloud-api-key
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id

# Google Cloud Services (Optional)
DOCUMENT_AI_PROCESSOR_ID=your-processor-id
DOCUMENT_AI_LOCATION=us
VISION_API_ENABLED=true

# Email Notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:3000

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE_MB=10
```

#### Frontend Environment (.env in /frontend)

```env
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000
```

### Step 7: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 8: Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
App opens at http://localhost:3000

### Step 9: Test the Application

1. Register a new account
2. Check for welcome email
3. Upload a test PDF (syllabus)
4. Create an assignment
5. Generate a study plan
6. Try the AI chat

---

## 🔄 CI/CD & Deployment

### Automated Workflows

We use **GitHub Actions** for continuous integration and deployment:

#### 1. Backend CI/CD (`backend-ci.yml`)
- **Triggers:** Push to `main`, PRs, changes in `/backend`
- **Actions:**
  - Install dependencies
  - Run syntax validation
  - Execute tests (if available)
  - Deploy to Render (on `main` branch)

#### 2. Frontend CI/CD (`frontend-ci.yml`)
- **Triggers:** Push to `main`, PRs, changes in `/frontend`
- **Actions:**
  - Install dependencies
  - Run production build
  - Report build size
  - Vercel auto-deploys from GitHub

#### 3. Keep Render Alive (`keep-render-alive.yml`)
- **Triggers:** Every 14 minutes (cron job)
- **Actions:**
  - Ping backend `/health` endpoint
  - Prevents free tier spin-down
  - Ensures instant response times

#### 4. Daily Notifications (`daily-notifications.yml`)
- **Triggers:** Twice daily (9 AM & 6 PM UTC)
- **Actions:**
  - Send deadline reminders to all users
  - Send daily summaries to opted-in users

### Deployment Platforms

#### Frontend: Vercel
- **URL:** https://studysyncaidemo.vercel.app
- **Features:**
  - Auto-deploy from GitHub
  - Global CDN
  - Zero configuration
  - Instant rollbacks

**Setup:**
1. Connect GitHub repo to Vercel
2. Set root directory: `frontend`
3. Add environment variables
4. Deploy!

#### Backend: Render
- **Features:**
  - Free tier (with spin-down)
  - Auto-deploy from GitHub
  - Persistent storage

**Setup:**
1. Create new Web Service on Render
2. Connect GitHub repo
3. Root directory: `backend`
4. Build: `npm install`
5. Start: `npm start`
6. Add all environment variables
7. Deploy!

### GitHub Secrets Required

Add these in your GitHub repo settings:

| Secret Name | Purpose |
|-------------|---------|
| `RENDER_DEPLOY_HOOK_URL` | Trigger Render deployments |
| `RENDER_BACKEND_URL` | For keep-alive pings |
| `REACT_APP_API_URL` | Frontend API endpoint |

---

## 📧 Email Notifications

Detailed setup guide: [EMAIL_NOTIFICATIONS.md](EMAIL_NOTIFICATIONS.md)

**Quick Setup:**
1. Get Gmail App Password
2. Add to Render environment variables:
   - `EMAIL_USER=your-email@gmail.com`
   - `EMAIL_PASSWORD=your-app-password`
   - `FRONTEND_URL=https://your-app.vercel.app`
3. Redeploy backend
4. Emails sent automatically!

**Email Types:**
- **Welcome Email**: On user registration
- **Deadline Reminders**: 1-3 days before assignment due dates
- **Daily Summaries**: Optional digest of pending tasks

---

## 🔐 Security

### Authentication & Authorization
- **Firebase Authentication** with JWT tokens
- **Secure token validation** on every API request
- **Role-based access** (user can only access own data)
- **Session management** with auto-logout

### Data Protection
- **Firestore Security Rules** prevent unauthorized access
- **Environment variables** for sensitive credentials
- **HTTPS/TLS encryption** in production
- **Input sanitization** against injection attacks
- **Rate limiting** to prevent abuse

### Best Practices
- **No hardcoded secrets** in code
- **Service account** with minimal permissions
- **CORS** configured for specific origins
- **Helmet.js** for security headers
- **Regular dependency updates**

---

## 🎯 Future Enhancements

### Phase 1 (Q1 2026)
- [ ] **Mobile Application** (React Native)
  - iOS and Android apps
  - Push notifications
  - Offline mode
  - Biometric authentication

- [ ] **Advanced Analytics Dashboard**
  - Detailed performance insights
  - Predictive analytics for exam preparation
  - Comparison with peers (anonymized)
  - AI-generated improvement suggestions

- [ ] **Voice Assistant Integration**
  - Voice-based study planning
  - Hands-free Q&A
  - Audio flashcards
  - Speech-to-text note-taking

### Phase 2 (Q2 2026)
- [ ] **Collaborative Features**
  - Study groups
  - Shared documents and notes
  - Group chat with AI moderator
  - Peer learning recommendations

- [ ] **Gamification**
  - Achievement badges
  - Leaderboards
  - Study streaks
  - Reward points system
  - Challenges and quests

- [ ] **Advanced AI Features**
  - Personalized learning paths
  - Adaptive difficulty adjustment
  - Emotion detection (stress/fatigue)
  - AI tutor for concept clarification

### Phase 3 (Q3 2026)
- [ ] **Integration Marketplace**
  - Google Classroom sync
  - Microsoft Teams integration
  - Notion connector
  - Calendar apps (Google, Outlook)
  - LMS platforms (Moodle, Canvas)

- [ ] **Content Library**
  - Curated video courses
  - Interactive simulations
  - Practice question banks
  - Expert-created study guides

- [ ] **Parent/Teacher Portal**
  - Progress monitoring
  - Performance reports
  - Intervention suggestions
  - Communication tools

### Phase 4 (Q4 2026)
- [ ] **Enterprise Features**
  - Institution-wide deployment
  - Admin dashboard
  - Bulk user management
  - Custom branding
  - Advanced reporting

- [ ] **Research & Development**
  - Spaced repetition algorithm
  - Memory retention tracking
  - Learning style adaptation
  - Neuro-linguistic optimization

---

## 🚀 Upcoming Features

### In Active Development

#### 1. **Smart Flashcard Generator** (2 weeks)
- Auto-generate flashcards from documents
- Spaced repetition algorithm
- Progress tracking
- Export to Anki format

#### 2. **Pomodoro Timer Integration** (1 week)
- Built-in focus timer
- Task integration
- Break reminders
- Productivity statistics

#### 3. **Offline Mode** (3 weeks)
- Progressive Web App (PWA)
- Local data caching
- Sync when online
- Background notifications

#### 4. **Handwriting Recognition** (4 weeks)
- Better OCR for handwritten notes
- Equation recognition (LaTeX)
- Diagram extraction
- Annotation support

#### 5. **Video Lecture Integration** (2 weeks)
- YouTube integration
- Timestamp bookmarks
- Auto-generated notes
- Key concept extraction

#### 6. **Mind Map Generator** (3 weeks)
- Visual topic relationships
- Interactive diagrams
- Export as images
- Collaborative editing

#### 7. **Social Features** (6 weeks)
- Profile pages
- Follow other students
- Share study plans
- Resource recommendations

#### 8. **API for Developers** (4 weeks)
- Public REST API
- Webhook support
- Third-party integrations
- SDK for common languages

### Feature Request Process

Have an idea? We'd love to hear it!

1. **Check existing requests**: [GitHub Issues](https://github.com/abbu1809/studysync-ai/issues)
2. **Create new request**: Use "Feature Request" template
3. **Community voting**: Upvote features you want
4. **Development**: Top-voted features get prioritized

---

## 🤝 Contributing

We welcome contributions from the community!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with clear messages**
   ```bash
   git commit -m "Add: Amazing new feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation
- Keep PRs focused and small

### Areas We Need Help

- 🐛 Bug fixes
- 📝 Documentation improvements
- 🌐 Internationalization (i18n)
- ♿ Accessibility enhancements
- 🧪 Test coverage
- 🎨 UI/UX improvements

---

## 📄 License

**MIT License**

Copyright (c) 2026 Pixel Pirates - StudySync AI Team

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## 👥 Team

**Pixel Pirates**

- **Development Team**: Building the future of AI-powered education
- **AI Research**: Optimizing learning algorithms
- **UX Design**: Creating intuitive interfaces
- **DevOps**: Ensuring reliable infrastructure

---

## 📞 Support & Contact


- **🐛 Bug Reports**: [GitHub Issues](https://github.com/abbu1809/studysync-ai/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/abbu1809/studysync-ai/discussions)
- **📚 Documentation**: [docs.studysync.ai](https://docs.studysync.ai)
- **🌐 Website**: [studysync.ai](https://studysyncaidemo.vercel.app)

---

## 🙏 Acknowledgments

- **Google AI** for Gemini and Vision APIs
- **Firebase** for authentication and database
- **Vercel** for hosting infrastructure
- **Cloudinary** for media management
- **Open Source Community** for amazing tools and libraries

---

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Components**: 25+ React components
- **API Endpoints**: 40+ RESTful routes
- **AI Integrations**: 3 (Gemini, Vision, Document AI)
- **Email Templates**: 3 professional designs
- **Documentation Pages**: 5+
- **CI/CD Workflows**: 4 automated pipelines

---

<div align="center">

### ⭐ Star this repo if you find it helpful!

**Built with ❤️ by students, for students**

**StudySync AI - Study Smarter, Not Harder**

[🚀 Live Demo](https://studysyncaidemo.vercel.app) | [📖 Documentation](EMAIL_NOTIFICATIONS.md) | [🐛 Report Bug](https://github.com/abbu1809/studysync-ai/issues)

</div>
