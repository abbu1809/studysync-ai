# 🚀 CI/CD Setup Guide for StudySync AI

## ✅ What's Already Done

I've created the following files for you:
- `.github/workflows/backend-ci.yml` - Auto-tests & deploys backend
- `.github/workflows/frontend-ci.yml` - Auto-builds & tests frontend  
- `.github/workflows/full-test.yml` - Runs full project tests
- `render.yaml` - Render configuration for auto-deployment
- `vercel.json` - Vercel configuration

---

## 📋 Setup Steps (10 Minutes)

### Step 1: Get Render Deploy Hook (2 min)

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your backend service (studysync-backend)
3. Go to **Settings** tab
4. Scroll to **Deploy Hook**
5. Click **Create Deploy Hook**
6. Name it: `GitHub Actions`
7. Copy the URL (looks like: `https://api.render.com/deploy/srv-xxxxx?key=yyyyy`)

### Step 2: Add GitHub Secret (2 min)

1. Go to your GitHub repo: https://github.com/abbu1809/studysync-ai
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Name | Value |
|------|-------|
| `RENDER_DEPLOY_HOOK_URL` | (Paste the URL from Step 1) |
| `REACT_APP_API_URL` | `https://your-backend.onrender.com` |

### Step 3: Connect Render to GitHub (3 min)

**Option A: Using render.yaml (Recommended)**

1. Your `render.yaml` file is ready
2. Go to Render dashboard
3. Click **New** → **Blueprint**
4. Connect your GitHub repo: `abbu1809/studysync-ai`
5. Select the `render.yaml` file
6. Click **Apply**
7. Render will automatically deploy from GitHub now!

**Option B: Manual Connection**

1. Go to your backend service on Render
2. Settings → Build & Deploy
3. Enable **Auto-Deploy**: Yes
4. Branch: `main`
5. Save changes

### Step 4: Connect Vercel to GitHub (3 min)

1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Click **Import Project**
3. Import from Git: `abbu1809/studysync-ai`
4. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com`
6. Deploy!

**Vercel will now auto-deploy on every push to main**

---

## 🎯 How It Works Now

### When you push to GitHub:

```bash
git add .
git commit -m "your changes"
git push origin main
```

**Automatically happens:**

1. ✅ GitHub Actions runs tests
2. ✅ Builds are verified
3. ✅ Backend deploys to Render (if tests pass)
4. ✅ Frontend deploys to Vercel
5. ✅ You get email notifications

### Workflow Triggers:

| Event | What Happens |
|-------|--------------|
| Push to `main` | Full deployment (backend + frontend) |
| Push to `develop` | Tests run, no deployment |
| Pull Request | All tests run for review |
| Manual trigger | Can run tests anytime |

---

## 🔧 Configuration Details

### Backend CI/CD Features:
- ✅ Syntax validation
- ✅ Dependency installation
- ✅ Test execution (if available)
- ✅ Automatic deployment to Render
- ✅ Only deploys if tests pass

### Frontend CI/CD Features:
- ✅ Linting (if configured)
- ✅ Production build verification
- ✅ Build size reporting
- ✅ Automatic deployment to Vercel

### Security Features:
- ✅ NPM audit for vulnerabilities
- ✅ High-severity issue detection
- ✅ Separate test jobs for isolation

---

## 🐛 Troubleshooting

### Backend not deploying?
- Check Render Deploy Hook URL in GitHub Secrets
- Verify it starts with `https://api.render.com/deploy/`
- Check workflow runs in GitHub Actions tab

### Frontend not deploying?
- Verify Vercel is connected to GitHub repo
- Check environment variables in Vercel dashboard
- Ensure build succeeds locally: `cd frontend && npm run build`

### Tests failing?
- Check workflow logs in GitHub Actions tab
- Run tests locally first: `npm test`
- Temporarily set `continue-on-error: true` if needed

---

## 📊 Monitoring Deployments

### Check Status:
1. **GitHub Actions**: https://github.com/abbu1809/studysync-ai/actions
2. **Render**: https://dashboard.render.com
3. **Vercel**: https://vercel.com/dashboard

### View Logs:
- GitHub Actions logs show test results
- Render logs show backend deployment
- Vercel logs show frontend deployment

---

## 🎓 Next Steps

1. **Push your changes** to trigger first CI/CD run:
   ```bash
   git add .
   git commit -m "Add CI/CD workflows"
   git push origin main
   ```

2. **Watch it work**:
   - Go to: https://github.com/abbu1809/studysync-ai/actions
   - See your workflows running live!

3. **Optional Enhancements**:
   - Add Jest tests for better coverage
   - Add ESLint for code quality
   - Add Slack/Discord notifications
   - Add staging environment

---

## 💡 Pro Tips

- **Branch Protection**: Enable in GitHub Settings to require tests before merging
- **Status Badges**: Add to README to show build status
- **Caching**: Workflows already cache npm dependencies for speed
- **Manual Triggers**: Can manually run workflows from Actions tab

---

## 🆘 Need Help?

If something doesn't work:
1. Check GitHub Actions logs
2. Check Render deployment logs
3. Check Vercel deployment logs
4. Verify all secrets are correctly set

Your CI/CD is now ready! 🎉
