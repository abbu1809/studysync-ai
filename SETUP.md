# StudySync AI - Setup & Deployment Guide

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Google Cloud Platform account
- Firebase project created

## 🚀 Quick Start Guide

### 1. Firebase Project Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase in project root
cd c:\Users\Abhis\Desktop\sp3
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
# - Storage
```

### 2. Enable Required Google Cloud APIs

Go to Google Cloud Console and enable:

1. **Cloud Vision API** (for OCR)
2. **Vertex AI API** (for Gemini)
3. **Firebase Authentication**
4. **Cloud Firestore**
5. **Cloud Storage**

### 3. Get Service Account Key

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `backend/config/serviceAccountKey.json`

### 4. Get API Keys

**Gemini API Key:**
```bash
# Go to https://makersuite.google.com/app/apikey
# Create API key and copy it
```

**Firebase Web Config:**
```bash
# Go to Firebase Console → Project Settings → General
# Under "Your apps" → Web app → Config
# Copy all values
```

### 5. Backend Setup

```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env with your values:
# PORT=5000
# FIREBASE_PROJECT_ID=your-project-id
# GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json
# GEMINI_API_KEY=your-gemini-api-key
# etc.

# Install dependencies
npm install

# Start development server
npm run dev
```

### 6. Frontend Setup

```bash
cd ../frontend

# Create .env file
cp .env.example .env

# Edit .env with Firebase config:
# REACT_APP_FIREBASE_API_KEY=your-api-key
# REACT_APP_FIREBASE_AUTH_DOMAIN=your-domain
# etc.
# REACT_APP_API_URL=http://localhost:5000

# Install dependencies
npm install

# Start development server
npm start
```

### 7. Firebase Functions Setup

```bash
cd ../functions

# Install dependencies
npm install

# Deploy functions
firebase deploy --only functions
```

### 8. Deploy Firestore Rules & Indexes

```bash
# From project root
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

## 🔧 Configuration Details

### Backend Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=studysync-ai
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json

# Google AI
GEMINI_API_KEY=AIzaSy...
VISION_API_KEY=AIzaSy...

# Optional: Gmail & Classroom
GMAIL_CLIENT_ID=your-client-id
GMAIL_CLIENT_SECRET=your-client-secret
CLASSROOM_API_KEY=your-classroom-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload
MAX_FILE_SIZE_MB=10
```

### Frontend Environment Variables

```env
# Firebase
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=studysync-ai.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=studysync-ai
REACT_APP_FIREBASE_STORAGE_BUCKET=studysync-ai.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API
REACT_APP_API_URL=http://localhost:5000

# App
REACT_APP_NAME=StudySync AI
REACT_APP_VERSION=1.0.0
```

## 📱 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Access the app at: `http://localhost:3000`

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

**Deploy to Firebase Hosting:**
```bash
# From project root
firebase deploy --only hosting
```

## 🧪 Testing the Application

### 1. Create Account
- Go to `http://localhost:3000/register`
- Sign up with email or Google

### 2. Upload a Document
- Navigate to Documents page
- Upload a PDF syllabus or assignment

### 3. Generate Study Plan
- Go to Study Planner
- Set dates and preferences
- Generate AI-powered schedule

### 4. Chat with AI
- Open Chat page
- Ask questions about your syllabus or assignments

### 5. Generate Viva Questions
- Go to Viva Questions
- Select subject and topic
- Generate exam-style Q&A

## 🔐 Security Checklist

- [x] Firestore security rules configured
- [x] Storage rules configured
- [x] API authentication middleware
- [x] Rate limiting enabled
- [x] Input validation
- [x] File upload restrictions
- [x] Environment variables secured

## 📊 Firebase Console Tasks

1. **Authentication**
   - Enable Email/Password provider
   - Enable Google provider
   - Configure authorized domains

2. **Firestore Database**
   - Create database in production mode
   - Deploy security rules
   - Create composite indexes

3. **Storage**
   - Create default bucket
   - Deploy storage rules

4. **Functions**
   - Deploy Cloud Functions
   - Monitor function logs

## 🐛 Common Issues & Solutions

### Backend won't start
```bash
# Check Node version
node --version  # Should be 18+

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Frontend build errors
```bash
# Check environment variables
cat .env

# Clear cache
npm run build -- --reset-cache
```

### Firebase deployment fails
```bash
# Re-login
firebase login --reauth

# Check project
firebase use --add
```

### OCR not working
```bash
# Verify Vision API is enabled
# Check service account permissions
# Ensure GOOGLE_APPLICATION_CREDENTIALS path is correct
```

### Gemini API errors
```bash
# Verify API key is correct
# Check API quota limits
# Ensure Vertex AI API is enabled
```

## 📈 Monitoring & Logs

**Backend Logs:**
```bash
cd backend
npm start
# Logs appear in console
```

**Firebase Functions Logs:**
```bash
firebase functions:log
```

**Firestore Usage:**
```bash
# Check in Firebase Console → Firestore → Usage tab
```

## 🚀 Production Deployment

### Deploy Everything
```bash
# Build frontend
cd frontend
npm run build

# Deploy all services
cd ..
firebase deploy
```

### Deploy Specific Services
```bash
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 📝 Post-Deployment

1. Test all features in production
2. Monitor error logs
3. Set up Firebase Analytics
4. Configure custom domain (optional)
5. Set up backup strategy

## 🎯 Next Steps

1. Implement full UI for all pages (Documents, Assignments, etc.)
2. Add email notifications using SendGrid/Nodemailer
3. Integrate Gmail API for assignment extraction
4. Add Google Classroom integration
5. Implement advanced analytics
6. Create mobile app with React Native
7. Add collaborative features

## 🆘 Support

For issues or questions:
1. Check Firebase Console logs
2. Review backend API logs
3. Inspect browser console for frontend errors
4. Verify all environment variables
5. Ensure all APIs are enabled in Google Cloud Console

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

**Built with ❤️ for students who want to study smarter, not harder.**
