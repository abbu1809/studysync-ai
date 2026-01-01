# 🚀 DEPLOYMENT CHECKLIST

## ✅ Prerequisites (Do First!)

### 1. Create GitHub Account
- [ ] Go to https://github.com/signup
- [ ] Create account (free)
- [ ] Verify email

### 2. Create Vercel Account  
- [ ] Go to https://vercel.com/signup
- [ ] Sign up with GitHub (click "Continue with GitHub")
- [ ] Authorize Vercel

### 3. Create Render Account
- [ ] Go to https://render.com/register
- [ ] Sign up with GitHub
- [ ] Verify email

---

## 📦 PHASE 1: Push Code to GitHub (Start Here!)

### Step 1.1: Install Git
```powershell
# Check if Git is installed
git --version

# If not installed, download from: https://git-scm.com/download/win
```

### Step 1.2: Configure Git (First Time Only)
```powershell
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### Step 1.3: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `studysync-ai`
3. Description: "AI-powered academic assistant"
4. **Keep it Public** (required for free deployment)
5. **Don't** initialize with README (we have code already)
6. Click "Create repository"

### Step 1.4: Push Your Code
```powershell
# Navigate to your project
cd C:\Users\Abhis\Desktop\sp3

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - StudySync AI"

# Add remote (REPLACE with YOUR GitHub username!)
git remote add origin https://github.com/YOUR_USERNAME/studysync-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**⏸️ STOP HERE and tell me when done!**

---

## 🎨 PHASE 2: Deploy Frontend to Vercel

### Step 2.1: Install Vercel CLI
```powershell
npm install -g vercel
```

### Step 2.2: Login to Vercel
```powershell
vercel login
# Enter your email, click the link sent to your email
```

### Step 2.3: Deploy Frontend
```powershell
cd frontend
vercel

# Answer the prompts:
# "Set up and deploy?"  → Y (Yes)
# "Which scope?"        → Select your account
# "Link to existing?"   → N (No)
# "Project name?"       → studysync-ai
# "Directory?"          → ./
# "Override settings?"  → N (No)
```

### Step 2.4: Save Your Frontend URL
After deployment, you'll see:
```
✅ Production: https://studysync-ai-xxx.vercel.app
```
**COPY THIS URL!** We need it for the backend.

**⏸️ STOP HERE and tell me your Vercel URL!**

---

## ⚙️ PHASE 3: Deploy Backend to Render

### Step 3.1: Prepare Service Account Key
1. Open: `backend\config\serviceAccountKey.json`
2. Copy **ENTIRE** file content
3. Keep it ready for next step

### Step 3.2: Deploy on Render
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect GitHub"** → Authorize Render
4. Select repository: `studysync-ai`
5. Configure:
   - **Name**: `studysync-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3.3: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these ONE BY ONE:

```
NODE_ENV = production
PORT = 5000
FIREBASE_PROJECT_ID = sync-ai-5fe57
CLOUDINARY_CLOUD_NAME = dwwrsd0bp
CLOUDINARY_API_KEY = 372744239235294
CLOUDINARY_API_SECRET = L7bLrhX72b4wCKEo448YHf4yrbU
GEMINI_API_KEY = AIzaSyBu7lW0VrwpRt55JVGlBDUfvJ685DRRToA
GOOGLE_CLOUD_API_KEY = AIzaSyCh7pBBiEy-fDbG1uPOUdxkkB2Y29KlCPo
GOOGLE_CLOUD_PROJECT_ID = sync-ai-c9106
DOCUMENT_AI_PROCESSOR_ID = f1876e8d1504adb1
DOCUMENT_AI_LOCATION = us
VISION_API_ENABLED = true
GMAIL_CLIENT_ID = your_gmail_client_id
GMAIL_CLIENT_SECRET = your_gmail_client_secret
CLASSROOM_API_ENABLED = true
ALLOWED_ORIGINS = https://studysync-ai-xxx.vercel.app,http://localhost:3000
```

**IMPORTANT:** Replace `studysync-ai-xxx.vercel.app` with YOUR actual Vercel URL!

### Step 3.4: Add Firebase Credentials
Add one more environment variable:

```
GOOGLE_APPLICATION_CREDENTIALS_JSON = 
```

For the value, paste the ENTIRE content of `serviceAccountKey.json` (all the JSON)

### Step 3.5: Deploy!
Click **"Create Web Service"**

Wait 3-5 minutes. You'll get a URL like:
```
https://studysync-backend.onrender.com
```

**⏸️ STOP HERE and tell me your Render URL!**

---

## 🔗 PHASE 4: Connect Everything

### Step 4.1: Update Frontend Environment
1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Click your project: `studysync-ai`
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://studysync-backend.onrender.com` (YOUR backend URL!)
   - **Environments**: Select all (Production, Preview, Development)
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"Redeploy"** on latest deployment

### Step 4.2: Test Your App!
1. Open your Vercel URL: `https://studysync-ai-xxx.vercel.app`
2. Try to register/login
3. Upload a document
4. Test AI features

**⏸️ Tell me if you see any errors!**

---

## ✅ PHASE 5: Final Steps

### Create Firestore Index
Click this link to create required index:
https://console.firebase.google.com/v1/r/project/sync-ai-5fe57/firestore/indexes?create_composite=Ck9wcm9qZWN0cy9zeW5jLWFpLTVmZTU3L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9kb2N1bWVudHMvaW5kZXhlcy9fEAEaFAoQcHJvY2Vzc2luZ1N0YXR1cxABGgoKBnVzZXJJZBABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI

Wait 2-3 minutes for index to build.

---

## 🎉 YOU'RE LIVE!

Your app is now deployed at:
- **Frontend**: https://studysync-ai-xxx.vercel.app
- **Backend**: https://studysync-backend.onrender.com

---

## 📞 Need Help?

Tell me which phase you're on and I'll help you through it!
