# 📧 Email Notifications Setup Guide

## Overview

StudySync AI now includes comprehensive email notification functionality:
- ✉️ **Welcome emails** for new users
- 📅 **Deadline reminders** for upcoming assignments
- 📋 **Daily summaries** of pending tasks
- 🔔 **Automated notifications** via scheduled jobs

---

## 🔧 Setup Instructions

### Step 1: Configure Email Service (5 minutes)

You need to add email credentials to your environment variables.

#### **Option A: Gmail (Recommended)**

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
3. **Add to Render Environment Variables**:

| Variable | Value | Example |
|----------|-------|---------|
| `EMAIL_USER` | Your Gmail address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | App Password (16 chars) | `abcd efgh ijkl mnop` |
| `FRONTEND_URL` | Your frontend URL | `https://frontend-nine-navy-50.vercel.app` |

#### **Option B: Custom SMTP**

| Variable | Value |
|----------|-------|
| `SMTP_HOST` | Your SMTP server |
| `SMTP_PORT` | Port (usually 587) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |
| `SMTP_SECURE` | `true` or `false` |
| `FRONTEND_URL` | Your frontend URL |

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

This will install `nodemailer` which is now added to package.json.

### Step 3: Redeploy Backend

After adding environment variables in Render:
1. Go to Render Dashboard
2. Click your backend service
3. Click **Manual Deploy** → **Deploy latest commit**

Or push to GitHub (will auto-deploy with CI/CD).

---

## 📬 Available Email Features

### 1. Welcome Email
Automatically sent when a new user registers.

**Includes:**
- Welcome message
- Feature overview
- Quick start button
- Settings link

### 2. Deadline Reminders
Sent for assignments due within 3 days.

**Includes:**
- Assignment details
- Days until due date
- Urgency indicator (🚨 urgent, ⚠️ soon, 📅 upcoming)
- Link to view assignment

### 3. Pending Tasks Summary
Daily digest of incomplete tasks.

**Includes:**
- Pending assignments
- Incomplete habits
- Active study plans
- Link to dashboard

---

## 🔔 Automated Notifications

### Daily Scheduled Emails

Two automated workflows run via GitHub Actions:

1. **Deadline Reminders**
   - Runs: Twice daily (9 AM & 6 PM UTC)
   - Checks: All users with assignments due in 3 days
   - Sends: Individual reminder emails

2. **Daily Summaries**
   - Runs: Twice daily (9 AM & 6 PM UTC)
   - Checks: Users who opted in
   - Sends: Summary of pending tasks

**These are automatically configured in `.github/workflows/daily-notifications.yml`**

---

## 🎛️ User Notification Preferences

Users can control their email notifications via the API:

```javascript
PUT /api/notifications/preferences
{
  "emailNotifications": true,      // Enable/disable all emails
  "deadlineReminders": true,       // Enable deadline reminders
  "dailySummary": false            // Enable daily summary (opt-in)
}
```

**Default settings for new users:**
- Email notifications: ✅ Enabled
- Deadline reminders: ✅ Enabled
- Daily summary: ❌ Disabled (opt-in only)

---

## 🧪 Testing Email Notifications

### Test Welcome Email
```bash
POST /api/notifications/test-welcome
Authorization: Bearer YOUR_TOKEN
```

### Test Deadline Reminders
```bash
POST /api/notifications/deadline-check
Authorization: Bearer YOUR_TOKEN
```

### Test Pending Summary
```bash
POST /api/notifications/pending-summary
Authorization: Bearer YOUR_TOKEN
```

### Manual Trigger Batch Emails
```bash
# Deadline reminders for all users
POST /api/notifications/batch/deadline-reminders

# Daily summaries for opted-in users
POST /api/notifications/batch/daily-summary
```

---

## 📊 Email Templates

All emails include:
- ✨ Responsive HTML design
- 🎨 Branded styling (purple gradient)
- 📱 Mobile-friendly layout
- 🔗 Call-to-action buttons
- 👤 Personalized content

---

## 🔍 Monitoring & Logs

### Check Email Sending Status

**Backend Logs (Render):**
```
✅ Welcome email sent to user@example.com
✅ Sent reminder to user@example.com for "Math Assignment"
📧 Found 5 users with upcoming deadlines
✨ Batch deadline reminders complete: 5 sent, 0 errors
```

**GitHub Actions Logs:**
- Go to: https://github.com/abbu1809/studysync-ai/actions
- Click **Daily Email Notifications** workflow
- View execution logs

---

## ⚙️ Customization

### Change Email Schedule

Edit [.github/workflows/daily-notifications.yml](.github/workflows/daily-notifications.yml):

```yaml
schedule:
  # Change times (currently 9 AM & 6 PM UTC)
  - cron: '0 9,18 * * *'
```

**Cron examples:**
- `0 9 * * *` - Once daily at 9 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 8,12,18 * * *` - Three times daily (8 AM, noon, 6 PM)

### Customize Email Templates

Edit templates in [backend/src/services/email.service.js](backend/src/services/email.service.js):
- Change colors, fonts, layout
- Add your logo
- Modify content

---

## 🚨 Troubleshooting

### Emails not sending?

1. **Check environment variables** in Render:
   - `EMAIL_USER` set correctly?
   - `EMAIL_PASSWORD` is App Password (not regular password)?
   - `FRONTEND_URL` is set?

2. **Check backend logs**:
   - Look for "Email service not configured" messages
   - Check for authentication errors

3. **Gmail App Password issues**:
   - Make sure 2FA is enabled
   - Generate a new App Password
   - Use the 16-character password without spaces

### Scheduled emails not running?

1. **Verify workflow is enabled**:
   - GitHub repo → Actions tab
   - Check if workflows are running

2. **Check GitHub Actions limits**:
   - You have 2000 free minutes/month
   - This uses ~60 minutes/month

### Rate limiting?

- Gmail: 500 emails/day limit
- Add delays between emails (already implemented: 1 second)
- Consider using SendGrid for higher volume

---

## 💡 Best Practices

1. **Test First**: Use test endpoints before relying on automated emails
2. **Monitor Logs**: Check Render and GitHub Actions logs regularly
3. **Respect Users**: Honor notification preferences
4. **Deliverability**: Use a verified email address
5. **Frequency**: Don't spam - twice daily is reasonable

---

## 🎯 API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/notifications/test-welcome` | POST | ✅ | Send test welcome email |
| `/api/notifications/deadline-check` | POST | ✅ | Check user's deadlines |
| `/api/notifications/pending-summary` | POST | ✅ | Send pending tasks summary |
| `/api/notifications/preferences` | PUT | ✅ | Update preferences |
| `/api/notifications/batch/deadline-reminders` | POST | ❌ | Batch deadline reminders |
| `/api/notifications/batch/daily-summary` | POST | ❌ | Batch daily summaries |

---

## ✅ Setup Checklist

- [ ] Add `EMAIL_USER` to Render environment variables
- [ ] Add `EMAIL_PASSWORD` (Gmail App Password) to Render
- [ ] Add `FRONTEND_URL` to Render
- [ ] Run `npm install` in backend folder
- [ ] Redeploy backend to Render
- [ ] Test welcome email with test endpoint
- [ ] Verify GitHub Actions workflow is running
- [ ] Check logs for successful email delivery

---

## 🎉 All Done!

Your email notification system is now ready! New users will receive welcome emails, and deadline reminders will be sent automatically.

**Questions?** Check the logs or test the endpoints manually.
