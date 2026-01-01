# 🚀 StudySync AI Deployment Guide (FREE)

## Overview
- **Frontend**: Vercel (React)
- **Backend**: Render (Node.js)
- **Database**: Firebase Firestore
- **Storage**: Cloudinary
- **Cost**: $0/month

---

## 📦 Prerequisites

1. **GitHub Account** (to store code)
2. **Vercel Account** (sign up at vercel.com)
3. **Render Account** (sign up at render.com)
4. Firebase project already set up ✅
5. Cloudinary account already set up ✅

---

## 🔧 Step 1: Prepare Backend for Deployment

### 1.1 Update backend package.json

Make sure your `backend/package.json` has:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 1.2 Update CORS settings

In `backend/src/server.js`, update CORS to allow your frontend domain:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-app-name.vercel.app'  // Add after deploying frontend
  ],
  credentials: true
};
```

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Create production API URL in frontend

Create `frontend/.env.production`:

```env
REACT_APP_API_URL=https://your-backend-app.onrender.com
```

### 2.2 Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend folder
cd frontend

# Deploy
vercel

# Follow prompts:
# - "Set up and deploy?"  → Yes
# - "Which scope?"        → Your account
# - "Link to existing?"   → No
# - "Project name?"       → studysync-ai (or your choice)
# - "Directory?"          → ./ (current directory)
# - "Build command?"      → npm run build
# - "Output directory?"   → build
# - "Deploy?"             → Yes
```

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (push code first)
3. Select the `frontend` folder as root directory
4. Add environment variables:
   - `REACT_APP_API_URL` = (leave blank for now, update after backend deploy)
5. Click **Deploy**

### 2.3 Get your frontend URL

After deployment, you'll get a URL like:
```
https://studysync-ai-abc123.vercel.app
```

**Save this URL!** You'll need it for backend CORS.

---

## ⚙️ Step 3: Deploy Backend to Render

### 3.1 Push code to GitHub

```bash
# Initialize git in backend folder
cd backend
git init
git add .
git commit -m "Initial backend commit"

# Create GitHub repo and push
# (Create repo on github.com first, then:)
git remote add origin https://github.com/YOUR_USERNAME/studysync-backend.git
git push -u origin main
```

### 3.2 Deploy to Render

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `studysync-backend`
   - **Runtime**: Node
   - **Branch**: main
   - **Root Directory**: (leave blank or `backend`)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 3.3 Add Environment Variables

In Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=5000
FIREBASE_PROJECT_ID=sync-ai-5fe57
CLOUDINARY_CLOUD_NAME=dwwrsd0bp
CLOUDINARY_API_KEY=372744239235294
CLOUDINARY_API_SECRET=L7bLrhX72b4wCKEo448YHf4yrbU
GEMINI_API_KEY=AIzaSyBu7lW0VrwpRt55JVGlBDUfvJ685DRRToA
GOOGLE_CLOUD_API_KEY=AIzaSyCh7pBBiEy-fDbG1uPOUdxkkB2Y29KlCPo
GOOGLE_CLOUD_PROJECT_ID=sync-ai-c9106
DOCUMENT_AI_PROCESSOR_ID=f1876e8d1504adb1
DOCUMENT_AI_LOCATION=us
VISION_API_ENABLED=true
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
CLASSROOM_API_ENABLED=true
```

### 3.4 Upload Firebase Service Account Key

**IMPORTANT:** Don't commit `serviceAccountKey.json` to Git!

Two options:

**Option A: Use Environment Variable (Recommended)**

1. Copy content of `backend/config/serviceAccountKey.json`
2. In Render, add environment variable:
   - Key: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Value: (paste entire JSON content)

3. Update `backend/src/config/firebase.js`:

```javascript
const admin = require('firebase-admin');

let serviceAccount;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  // Production: from environment variable
  serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
} else {
  // Development: from file
  serviceAccount = require('../../config/serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});
```

**Option B: Use Render Secret Files**

1. In Render dashboard → Settings → Secret Files
2. Add file:
   - Filename: `config/serviceAccountKey.json`
   - Contents: (paste file content)

### 3.5 Deploy

Click **Create Web Service** and wait for deployment (~5 minutes).

You'll get a URL like:
```
https://studysync-backend.onrender.com
```

---

## 🔗 Step 4: Connect Frontend to Backend

### 4.1 Update Frontend Environment

In Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add:
   - `REACT_APP_API_URL` = `https://studysync-backend.onrender.com`
3. Redeploy frontend

### 4.2 Update Backend CORS

In `backend/src/server.js`, update CORS:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://studysync-ai-abc123.vercel.app'  // Your actual Vercel URL
  ],
  credentials: true
};
```

Commit and push to trigger Render auto-deploy.

---

## ✅ Step 5: Enable Firestore Indexes

Don't forget to create the required indexes:

1. **Documents Index**: [Click here](https://console.firebase.google.com/v1/r/project/sync-ai-5fe57/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9zeW5jLWFpLTVmZTU3L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9kb2N1bWVudHMvaW5kZXhlcy9fEAEaFAoQcHJvY2Vzc2luZ1N0YXR1cxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI)

2. **Viva Results Index**: `userId + completedAt`
3. **Study Sessions Index**: `userId + startTime`

---

## 🎉 Done! Your App is Live

- **Frontend**: https://studysync-ai-abc123.vercel.app
- **Backend**: https://studysync-backend.onrender.com

---

## 📊 Free Tier Limits

### Vercel (Frontend)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited projects
- ✅ Auto HTTPS
- ✅ CDN globally

### Render (Backend)
- ✅ 750 hours/month (enough for 1 service)
- ⚠️ Sleeps after 15min inactivity
- ✅ Auto-deploy from Git
- ⚠️ 512 MB RAM

### Firebase
- ✅ 1 GB storage
- ✅ 50K document reads/day
- ✅ 20K writes/day
- ✅ 20K deletes/day

---

## ⚡ Tips for Free Tier

### 1. Prevent Render Sleep

**Option A: Use a free uptime monitor**
- [UptimeRobot](https://uptimerobot.com) - ping your backend every 5min
- [Cron-job.org](https://cron-job.org) - scheduled health checks

**Option B: Client-side ping**
In your frontend, add a health check:

```javascript
// In App.js or index.js
setInterval(() => {
  fetch(`${process.env.REACT_APP_API_URL}/health`)
    .catch(() => {}); // Ignore errors
}, 5 * 60 * 1000); // Every 5 minutes
```

### 2. Optimize Firebase Usage

- Enable offline persistence
- Use query limits
- Cache frequently accessed data

### 3. Monitor Gemini API Usage

Free tier: 20 requests/day
- Add rate limiting in frontend
- Show quota warnings to users
- Consider caching AI responses

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

1. Check CORS settings in backend
2. Verify `REACT_APP_API_URL` in Vercel
3. Check backend logs in Render dashboard

### Backend crashes on startup

1. Check all environment variables are set
2. Verify Firebase credentials
3. Check logs in Render dashboard

### Firestore errors

1. Enable required composite indexes
2. Check Firebase security rules
3. Verify API key permissions

---

## 🔄 Updating Your App

### Frontend Updates
```bash
cd frontend
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploys on push
```

### Backend Updates
```bash
cd backend
git add .
git commit -m "Update backend"
git push
# Render auto-deploys on push
```

---

## 💰 When to Upgrade

**Upgrade to paid plans when:**
- Backend gets >750 hours/month usage (Render: $7/month)
- Need >100GB bandwidth (Vercel: $20/month)
- Exceed Gemini free tier (Paid: ~$5-10/month)
- Need better uptime (99.9% SLA)

---

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)

---

## 🎓 Your Deployment is Ready!

Test everything:
- ✅ User registration/login
- ✅ Document upload
- ✅ AI Assistant chat
- ✅ Viva question generation
- ✅ Study planner
- ✅ Analytics dashboard

**Share your app with the world! 🚀**
