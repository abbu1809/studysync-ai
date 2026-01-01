# 🔑 CREDENTIALS CHECKLIST

## Copy this template and fill in your credentials

---

## 1️⃣ FIREBASE CREDENTIALS

### Firebase Console: https://console.firebase.google.com

**Project Settings → General:**
```
Project ID: ___________________________
Web API Key: ___________________________
Auth Domain: ___________________________
Storage Bucket: ___________________________
Messaging Sender ID: ___________________________
App ID: ___________________________
```

**Project Settings → Service Accounts → Generate New Private Key:**
- Download JSON file
- Save as: `backend/config/serviceAccountKey.json`
- Or copy values to .env:
  ```
  FIREBASE_CLIENT_EMAIL: ___________________________
  FIREBASE_PRIVATE_KEY: ___________________________
  ```

**Enable Authentication Providers:**
- [ ] Email/Password (Settings → Sign-in method)
- [ ] Google (Settings → Sign-in method)

---

## 2️⃣ CLOUDINARY CREDENTIALS

### Cloudinary Console: https://console.cloudinary.com

**Dashboard:**
```
Cloud Name: ___________________________
API Key: ___________________________
API Secret: ___________________________
```

**Setup Steps:**
1. Sign up at cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, API Secret
4. Add to `backend/.env`

---

## 3️⃣ GOOGLE GEMINI API

### Google AI Studio: https://makersuite.google.com/app/apikey

```
Gemini API Key: ___________________________
```

**Setup Steps:**
1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Add to `backend/.env` as GEMINI_API_KEY

---

## 4️⃣ GOOGLE CLOUD VISION API

### Google Cloud Console: https://console.cloud.google.com

**Option A: Use Service Account (Recommended)**
- Same as Firebase service account key
- Set GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json

**Option B: Use API Key**
1. Go to APIs & Services → Credentials
2. Create credentials → API Key
3. Restrict key to Cloud Vision API
```
Vision API Key: ___________________________
```

**Enable the API:**
1. Go to APIs & Services → Library
2. Search "Cloud Vision API"
3. Click Enable

---

## 5️⃣ ENVIRONMENT FILES

### Backend `.env` File Template:
```env
# Server
PORT=5000
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google AI
GEMINI_API_KEY=your-gemini-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE_MB=10
```

### Frontend `.env` File Template:
```env
# Firebase
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456:web:abcd
REACT_APP_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API
REACT_APP_API_URL=http://localhost:5000

# App
REACT_APP_NAME=StudySync AI
REACT_APP_VERSION=1.0.0
```

---

## 📋 SETUP CHECKLIST

- [ ] Created Firebase project
- [ ] Downloaded Firebase service account key → `backend/config/serviceAccountKey.json`
- [ ] Got Firebase web config (8 values)
- [ ] Enabled Email & Google auth providers in Firebase
- [ ] Created Cloudinary account
- [ ] Got Cloudinary credentials (Cloud Name, API Key, Secret)
- [ ] Got Gemini API key from Google AI Studio
- [ ] Enabled Cloud Vision API in Google Cloud Console
- [ ] Created `backend/.env` with all credentials
- [ ] Created `frontend/.env` with Firebase config
- [ ] Run `setup.ps1` script
- [ ] Verified both servers start successfully

---

## 🆘 WHERE TO GET EACH CREDENTIAL

| Credential | URL | Location |
|-----------|-----|----------|
| Firebase Config | https://console.firebase.google.com | Project Settings → General → Your apps → Web app |
| Service Account | https://console.firebase.google.com | Project Settings → Service Accounts → Generate Key |
| Cloudinary | https://console.cloudinary.com | Dashboard |
| Gemini API | https://makersuite.google.com/app/apikey | Create API Key button |
| Vision API | https://console.cloud.google.com | APIs & Services → Cloud Vision API |

---

## 🎯 READY TO START?

Once you have all credentials:

1. **Run setup script:**
   ```powershell
   cd c:\Users\Abhis\Desktop\sp3
   .\setup.ps1
   ```

2. **Or manually:**
   ```powershell
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your credentials
   npm install
   npm run dev

   # Frontend (new terminal)
   cd frontend
   cp .env.example .env
   # Edit .env with your credentials
   npm install
   npm start
   ```

3. **Deploy Firebase:**
   ```powershell
   firebase login
   firebase init
   firebase deploy --only firestore:rules,firestore:indexes
   ```

---

**Need help?** Check the detailed [SETUP.md](SETUP.md) guide!
