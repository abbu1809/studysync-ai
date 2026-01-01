# 🚀 Quick Start Guide - StudySync AI

## ✅ What You Need (Credentials Checklist)

### 1. **Firebase** (FREE)
- [ ] Project ID
- [ ] Service Account JSON file
- [ ] Web App Config (8 values)

**Get it here:** https://console.firebase.google.com
- Create new project → Project Settings → Service Accounts → Generate Key

---

### 2. **Cloudinary** (FREE tier available)
- [ ] Cloud Name
- [ ] API Key  
- [ ] API Secret

**Get it here:** https://cloudinary.com/users/register/free
- Sign up → Dashboard → Copy credentials

---

### 3. **Google Gemini API** (FREE)
- [ ] API Key

**Get it here:** https://makersuite.google.com/app/apikey
- Click "Create API Key" → Copy it

---

### 4. **Google Cloud Vision API** (FREE tier: 1000 requests/month)
- [ ] Enable the API
- [ ] Use Firebase service account (already have it from step 1!)

**Enable here:** https://console.cloud.google.com/apis/library/vision.googleapis.com
- Select your Firebase project → Click "Enable"

---

## 🎯 Setup Steps (5 minutes)

### Option 1: Automated Setup (Recommended)
```powershell
cd c:\Users\Abhis\Desktop\sp3
.\setup.ps1
```
The script will:
- Create .env files
- Install all dependencies
- Guide you through credential setup
- Start the servers

---

### Option 2: Manual Setup

#### Step 1: Firebase Setup
```powershell
# Login to Firebase
firebase login

# Initialize Firebase (select Firestore, Functions, Hosting)
firebase init
```

#### Step 2: Backend Setup
```powershell
cd backend

# Create .env file
cp .env.example .env

# Edit .env and add your credentials
notepad .env
```

**Add to `backend/.env`:**
```env
PORT=5000
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=your-project-id-here
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json

# Cloudinary (from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Gemini API (from makersuite.google.com)
GEMINI_API_KEY=your-gemini-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE_MB=10
```

**Add Firebase Service Account:**
- Download JSON from Firebase Console
- Save as `backend/config/serviceAccountKey.json`

```powershell
# Install dependencies
npm install

# Start backend server
npm run dev
```
✅ Backend running at http://localhost:5000

---

#### Step 3: Frontend Setup
```powershell
cd ../frontend

# Create .env file
cp .env.example .env

# Edit .env
notepad .env
```

**Add to `frontend/.env`:**
```env
# Get these from Firebase Console → Project Settings → Your apps → Web app
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456:web:abcd
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# App Info
REACT_APP_NAME=StudySync AI
REACT_APP_VERSION=1.0.0
```

```powershell
# Install dependencies
npm install

# Start frontend
npm start
```
✅ Frontend running at http://localhost:3000

---

#### Step 4: Deploy Firebase Rules
```powershell
cd ..
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 🎨 Your Credentials Summary

Fill this out as you get each credential:

```
✅ FIREBASE
   Project ID: ______________________
   Service Account: ✓ Downloaded to backend/config/

✅ CLOUDINARY  
   Cloud Name: ______________________
   API Key: ______________________
   API Secret: ______________________

✅ GEMINI API
   API Key: ______________________

✅ VISION API
   Enabled: ✓ (uses Firebase service account)
```

---

## 🧪 Test the Application

1. **Register Account**
   - Go to http://localhost:3000/register
   - Sign up with email or Google

2. **Upload Document**
   - Navigate to Documents page
   - Upload a PDF syllabus
   - Wait for OCR processing

3. **Generate Study Plan**
   - Go to Study Planner
   - Set dates and preferences
   - Click "Generate Plan"

4. **Chat with AI**
   - Open Chat page
   - Ask: "What topics should I study first?"

---

## 🐛 Common Issues

### Backend won't start
```powershell
# Check .env file exists and has all credentials
cat backend/.env

# Verify service account file exists
ls backend/config/serviceAccountKey.json

# Check Node version (need 18+)
node --version
```

### "Firebase not configured" error
- Make sure `GOOGLE_APPLICATION_CREDENTIALS` points to correct file
- Verify service account JSON is valid

### Cloudinary upload fails
- Check cloud name, API key, and secret are correct
- No quotes around values in .env file

### Gemini API errors
- Verify API key from https://makersuite.google.com/app/apikey
- Check API quota limits

---

## 📡 Server Status Check

Both servers running? You should see:

**Terminal 1 (Backend):**
```
🚀 Server running on port 5000
✅ Firebase initialized
✅ Connected to Firestore
```

**Terminal 2 (Frontend):**
```
webpack compiled successfully
Local: http://localhost:3000
```

---

## 🎉 You're Ready!

Access your app at: **http://localhost:3000**

**Default credentials for testing:**
- Email: test@studysync.ai
- Password: password123
(Or create new account)

---

## 📚 Next Steps

- [ ] Read [API.md](docs/API.md) for endpoint documentation
- [ ] Check [SETUP.md](SETUP.md) for production deployment
- [ ] Implement full UI for placeholder pages
- [ ] Set up email notifications
- [ ] Deploy to production

---

## 🆘 Need Help?

1. Check [CREDENTIALS.md](CREDENTIALS.md) for detailed credential guide
2. Review [SETUP.md](SETUP.md) for troubleshooting
3. Verify all .env values are correct (no quotes, no spaces)
4. Check Firebase Console for any service errors
5. Look at browser console and backend logs for errors

---

**Happy Studying! 📚✨**
