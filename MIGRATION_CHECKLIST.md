# 🔄 Migration Checklist: Render → Railway

## ✅ Pre-Migration Checklist

- [ ] GitHub repository is up to date
- [ ] All environment variables documented
- [ ] Firebase Service Account JSON file ready
- [ ] Frontend URL noted down
- [ ] Render backend URL noted down (for comparison)

---

## 📝 Step-by-Step Migration

### Phase 1: Deploy to Railway (15 minutes)

#### 1.1 Sign up for Railway
- [ ] Go to https://railway.app
- [ ] Click "Login with GitHub"
- [ ] Authorize Railway

#### 1.2 Create New Project
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose your repository
- [ ] Wait for initial build to complete

#### 1.3 Configure Environment Variables
- [ ] Go to Variables tab
- [ ] Click "Raw Editor"
- [ ] Paste all environment variables from `RENDER_ENV_VARS.txt`
- [ ] Add `FIREBASE_SERVICE_ACCOUNT` with JSON content
- [ ] Click "Deploy" to restart

#### 1.4 Generate Domain
- [ ] Go to Settings tab
- [ ] Scroll to "Domains" section
- [ ] Click "Generate Domain"
- [ ] Copy your new Railway URL (e.g., `https://sp3-production.up.railway.app`)

#### 1.5 Test Railway Deployment
- [ ] Open: `https://your-app.up.railway.app/health`
- [ ] Verify JSON response with "healthy" status
- [ ] Test an API endpoint (e.g., `/api/auth/test`)

---

### Phase 2: Update Frontend (5 minutes)

#### 2.1 Update Vercel Environment Variables
- [ ] Go to Vercel Dashboard
- [ ] Click on your project → Settings → Environment Variables
- [ ] Find `REACT_APP_API_URL` or `VITE_API_URL`
- [ ] Update value to Railway URL: `https://your-app.up.railway.app`
- [ ] Save changes

#### 2.2 Redeploy Frontend
- [ ] Go to Deployments tab
- [ ] Click "..." menu on latest deployment
- [ ] Click "Redeploy"
- [ ] Wait for deployment to complete (~2 minutes)

#### 2.3 Test Frontend
- [ ] Open your frontend URL
- [ ] Try logging in
- [ ] Test a feature (e.g., create assignment, chat)
- [ ] Check browser console for errors

---

### Phase 3: Verify Everything Works (5 minutes)

#### 3.1 Test All Critical Features
- [ ] User authentication (login/register)
- [ ] Document upload
- [ ] Assignment creation
- [ ] Study plan generation
- [ ] Chat feature
- [ ] Viva questions generation
- [ ] Habits tracking

#### 3.2 Check Railway Logs
- [ ] Go to Railway Dashboard
- [ ] Click "View Logs"
- [ ] Verify no errors
- [ ] Confirm requests are being processed

---

### Phase 4: Remove Render (2 minutes)

#### 4.1 Delete Render Service
- [ ] Go to https://dashboard.render.com
- [ ] Select your backend service
- [ ] Click Settings
- [ ] Scroll to bottom
- [ ] Click "Delete Web Service"
- [ ] Type service name to confirm
- [ ] Click "Delete"

#### 4.2 Clean Up (Optional)
- [ ] Remove Render-specific files (if any)
- [ ] Update documentation
- [ ] Commit changes to GitHub

---

## 🎉 Post-Migration

### Verify Success
- [ ] Frontend loads without errors
- [ ] All API calls work correctly
- [ ] No 15-minute spin-down issue
- [ ] Railway dashboard shows active deployment

### Monitor for 24 Hours
- [ ] Check Railway usage dashboard
- [ ] Monitor error logs
- [ ] Test app at different times
- [ ] Verify auto-deploy works (push to GitHub)

---

## 🚨 Rollback Plan (If Something Goes Wrong)

### If Railway Deployment Fails:
1. Keep Render running temporarily
2. Debug Railway logs
3. Check environment variables
4. Verify build configuration

### If Frontend Can't Connect:
1. Verify CORS settings in `backend/src/server.js`
2. Check `ALLOWED_ORIGINS` includes frontend URL
3. Confirm Railway URL is correct in Vercel
4. Test Railway backend directly in browser

---

## 📊 Expected Results

| Metric | Render (Before) | Railway (After) |
|--------|----------------|-----------------|
| Cold Start | 50s | 0s (always on) |
| Uptime | Sleeps after 15min | 24/7 |
| Free Hours | 750/month | 500/month |
| Deploy Time | 3-5 minutes | 2-3 minutes |
| Auto-deploy | ✅ | ✅ |

---

## 🆘 Troubleshooting

### Railway Build Fails
```bash
# Check build logs in Railway Dashboard
# Common issues:
# - Missing package.json
# - Wrong Node version
# - Missing dependencies
```

### Environment Variables Not Working
```bash
# Verify in Railway Dashboard → Variables
# Make sure no extra spaces or quotes
# Check FIREBASE_SERVICE_ACCOUNT is valid JSON
```

### CORS Errors in Frontend
```bash
# Update backend/src/server.js
# Ensure ALLOWED_ORIGINS includes your frontend URL
# Format: https://your-app.vercel.app,http://localhost:3000
```

---

## 📞 Support Resources

- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- Railway Status: https://status.railway.app

---

**Estimated Total Time**: 25-30 minutes
**Difficulty**: Easy
**Reversibility**: Can switch back to Render if needed
