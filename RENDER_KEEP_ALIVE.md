# 🔄 Render Keep-Alive Setup

## Problem
Render's free tier spins down your backend after 15 minutes of inactivity, causing 1-2 minute cold starts on first request.

## Solution
A GitHub Actions cron job that pings your backend every 14 minutes to keep it alive.

---

## ✅ Setup (2 Minutes)

### Step 1: Add GitHub Secret

1. Go to: https://github.com/abbu1809/studysync-ai/settings/secrets/actions
2. Click **New repository secret**
3. Add the following:

| Name | Value |
|------|-------|
| `RENDER_BACKEND_URL` | `https://your-backend-name.onrender.com` |

**Example:** If your backend URL is `https://studysync-backend.onrender.com`, use that exact URL.

### Step 2: Enable GitHub Actions

The workflow is already created in `.github/workflows/keep-render-alive.yml`

It will automatically:
- ✅ Run every 14 minutes (24/7)
- ✅ Ping your `/health` endpoint
- ✅ Keep your backend warm
- ✅ Prevent cold starts

### Step 3: Test It (Optional)

Manually trigger the workflow:
1. Go to: https://github.com/abbu1809/studysync-ai/actions
2. Click **Keep Render Alive** workflow
3. Click **Run workflow** → **Run workflow**
4. Check the logs to confirm it works

---

## 📊 How It Works

```
GitHub Actions (Every 14 min)
    ↓
Pings: https://your-backend.onrender.com/health
    ↓
Render Backend stays active
    ↓
No cold starts! 🎉
```

### Workflow Schedule
```yaml
schedule:
  - cron: '*/14 * * * *'  # Every 14 minutes
```

**This means:**
- Runs 24 hours a day, 7 days a week
- Keeps your backend constantly warm
- Completely free (GitHub Actions gives 2000 minutes/month free)
- Uses about 720 minutes/month (well within limits)

---

## 🎯 Benefits

| Before | After |
|--------|-------|
| ❌ 15 min inactivity → spin down | ✅ Always active |
| ❌ 1-2 min cold start delay | ✅ Instant response |
| ❌ Poor user experience | ✅ Fast, responsive app |

---

## 🔍 Monitor Status

Check if it's working:

1. **GitHub Actions Logs**: https://github.com/abbu1809/studysync-ai/actions/workflows/keep-render-alive.yml
   - Should show successful pings every 14 minutes

2. **Render Logs**: https://dashboard.render.com
   - Click your backend service → Logs
   - You'll see health check requests every 14 minutes

3. **Test Your Backend**:
   ```bash
   curl https://your-backend.onrender.com/health
   ```
   Should respond instantly (no cold start)

---

## ⚠️ Important Notes

1. **Set the Secret**: Without `RENDER_BACKEND_URL` secret, the workflow won't ping anything
2. **Free Tier Limits**: GitHub gives 2000 free minutes/month - this uses ~720 minutes
3. **Alternative**: You could use external services like UptimeRobot, but this is free and simple

---

## 🛠️ Troubleshooting

### Workflow Not Running?
- Check: https://github.com/abbu1809/studysync-ai/actions
- Ensure the workflow file is on the `main` branch
- Verify cron syntax is correct

### Backend Still Cold Starting?
- Verify `RENDER_BACKEND_URL` secret is set correctly
- Check workflow logs for errors
- Ensure `/health` endpoint exists on your backend

### Want to Disable?
Delete or disable the workflow:
```bash
git rm .github/workflows/keep-render-alive.yml
git commit -m "Disable keep-alive"
git push
```

---

## 💡 Pro Tips

1. **Monitor Usage**: GitHub Settings → Billing → Actions usage
2. **Adjust Frequency**: Change `*/14` to `*/10` for more frequent pings (uses more minutes)
3. **Multiple Services**: Ping multiple endpoints by adding more curl commands

---

## ✨ All Set!

Your backend will now stay alive 24/7 without any manual intervention!

**Next Step**: Add the `RENDER_BACKEND_URL` secret to activate it.
