# StudySync AI

**An AI-powered academic assistant that converts unstructured academic data into a personalized, adaptive study plan.**

> "StudySync AI transforms scattered academic information into a personalized, adaptive study plan using Google's AI — so students focus on learning, not planning."

## 🚀 Features

- **Smart Document Processing**: Upload PDFs/images (syllabus, assignments) and extract structured data using Google Vision OCR
- **Intelligent Study Planner**: AI-generated hour-by-hour study schedules adapted to your deadlines and availability
- **Assignment Tracking**: Priority-based dashboard with deadline management
- **Habit-Aware Adaptation**: Learn your study patterns and optimize recommendations
- **Viva Q&A Generator**: Generate exam-focused questions and answers from syllabus
- **Resource Recommendations**: Curated learning resources based on current topics
- **Context-Aware Chatbot**: AI assistant with full knowledge of your academic data
- **Dark/Light Themes**: Full theme support for comfortable studying

## 🛠️ Tech Stack

### Frontend
- React.js (with hooks)
- Tailwind CSS
- Firebase Authentication

### Backend
- Node.js
- Express.js
- Firebase Cloud Functions

### Database
- Firebase Firestore

### AI & Google Services
- Google Gemini API (reasoning, planning, Q&A)
- Google Vision OCR / Document AI (text extraction)
- Gmail API (optional assignment extraction)
- Google Classroom API (optional)
- Firebase Cloud Messaging (notifications)

## 📁 Project Structure

```
sp3/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API clients
│   │   ├── utils/           # Utility functions
│   │   ├── styles/          # CSS files
│   │   └── App.js
│   ├── public/
│   └── package.json
│
├── backend/                  # Express server
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Configuration
│   │   └── server.js
│   └── package.json
│
├── functions/                # Firebase Cloud Functions
│   ├── index.js
│   └── package.json
│
└── docs/                     # Documentation
    └── firestore-schema.md
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- Firebase account
- Google Cloud Platform account (for Gemini API, Vision OCR)

### Environment Variables

#### Backend (.env in /backend)
```
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path-to-service-account.json
GEMINI_API_KEY=your-gemini-api-key
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
NODE_ENV=development
```

#### Frontend (.env in /frontend)
```
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000
```

### Installation

1. **Clone the repository**
```bash
cd c:\Users\Abhis\Desktop\sp3
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

4. **Install Firebase Functions Dependencies**
```bash
cd ../functions
npm install
```

5. **Configure Firebase**
- Create a Firebase project
- Enable Authentication (Email/Password and Google)
- Enable Firestore Database
- Download service account key and place in `/backend/config/`

6. **Configure Google Cloud APIs**
- Enable Vision API
- Enable Gemini API (Vertex AI)
- (Optional) Enable Gmail API and Classroom API

### Running the Application

#### Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

**Firebase Functions (local):**
```bash
cd functions
npm run serve
```

#### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

**Deploy Firebase Functions:**
```bash
cd functions
firebase deploy --only functions
```

## 📊 Firestore Schema

See [docs/firestore-schema.md](docs/firestore-schema.md) for detailed database structure.

## 🎯 Core Workflows

### 1. Document Upload Flow
User uploads PDF → Vision OCR extracts text → AI structures data → Saves to Firestore

### 2. Study Plan Generation
User sets preferences → Gemini analyzes syllabus + deadlines → Generates schedule → Saves plan

### 3. Habit Adaptation
System tracks study sessions → Detects patterns → Adjusts recommendations → Updates preferences

### 4. Chat Interaction
User asks question → Retrieves context (docs, plan, assignments) → Gemini generates answer → Stores history

## 🔐 Security

- Firebase Authentication with secure token validation
- API routes protected with authentication middleware
- Environment variables for sensitive credentials
- Firestore security rules for data access control
- Input validation and sanitization

## 📈 Future Enhancements

- Mobile app (React Native)
- Collaborative study groups
- Advanced analytics dashboard
- Integration with more LMS platforms
- Voice-based study assistant
- Spaced repetition algorithm

## 📝 License

MIT License

## 🤝 Contributing

Contributions welcome! Please read contributing guidelines before submitting PRs.

## 📧 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ for students who want to study smarter, not harder.**
**Team: Pixel Pirates**
