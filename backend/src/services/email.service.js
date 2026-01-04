const nodemailer = require('nodemailer');

/**
 * Email Service for sending notifications
 * Supports Gmail and custom SMTP
 */

// Create transporter
const createTransporter = () => {
  const emailConfig = {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD // Use App Password for Gmail
    }
  };

  // Use custom SMTP if configured
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  return nodemailer.createTransport(emailConfig);
};

/**
 * Send welcome email to new user
 */
async function sendWelcomeEmail(userEmail, userName) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email service not configured. Skipping welcome email.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"StudySync AI" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🎉 Welcome to StudySync AI!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .feature-item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Welcome to StudySync AI!</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName || 'there'}! 👋</h2>
              <p>We're excited to have you join StudySync AI - your intelligent study companion powered by AI!</p>
              
              <div class="features">
                <h3>🎯 What You Can Do:</h3>
                <div class="feature-item">📚 <strong>Smart Document Analysis</strong> - Upload PDFs and get AI-powered summaries</div>
                <div class="feature-item">📝 <strong>Assignment Tracking</strong> - Never miss a deadline again</div>
                <div class="feature-item">🗓️ <strong>AI Study Planner</strong> - Personalized study schedules</div>
                <div class="feature-item">💬 <strong>AI Chat Assistant</strong> - Get instant help with your studies</div>
                <div class="feature-item">❓ <strong>Viva Preparation</strong> - Generate practice questions</div>
                <div class="feature-item">✅ <strong>Habit Tracking</strong> - Build consistent study habits</div>
              </div>

              <p>Start by exploring the dashboard and uploading your first document!</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://frontend-nine-navy-50.vercel.app'}" class="button">
                  Get Started →
                </a>
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                💡 <strong>Pro Tip:</strong> Enable notifications in settings to get deadline reminders!
              </p>
            </div>
            <div class="footer">
              <p>Happy studying! 🎓</p>
              <p>The StudySync AI Team</p>
              <p style="margin-top: 10px;">
                <a href="${process.env.FRONTEND_URL || 'https://frontend-nine-navy-50.vercel.app'}/settings" style="color: #667eea;">Manage Preferences</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send deadline reminder email
 */
async function sendDeadlineReminder(userEmail, userName, assignment) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email service not configured. Skipping deadline reminder.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const daysUntil = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    const urgency = daysUntil <= 1 ? '🚨 URGENT' : daysUntil <= 3 ? '⚠️ Soon' : '📅 Upcoming';
    
    const mailOptions = {
      from: `"StudySync AI" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `${urgency}: ${assignment.title} - Deadline Reminder`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${daysUntil <= 1 ? '#ef4444' : daysUntil <= 3 ? '#f59e0b' : '#3b82f6'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .assignment-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${daysUntil <= 1 ? '#ef4444' : daysUntil <= 3 ? '#f59e0b' : '#3b82f6'}; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .deadline-badge { display: inline-block; padding: 5px 15px; background: ${daysUntil <= 1 ? '#fee2e2' : daysUntil <= 3 ? '#fef3c7' : '#dbeafe'}; color: ${daysUntil <= 1 ? '#991b1b' : daysUntil <= 3 ? '#92400e' : '#1e40af'}; border-radius: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${urgency} Deadline Reminder</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName || 'there'}! 👋</h2>
              <p>This is a friendly reminder about an upcoming deadline:</p>
              
              <div class="assignment-card">
                <h3>${assignment.title}</h3>
                ${assignment.description ? `<p>${assignment.description}</p>` : ''}
                <p><strong>Subject:</strong> ${assignment.subject || 'N/A'}</p>
                <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Status:</strong> ${assignment.status || 'Pending'}</p>
                <p style="margin-top: 15px;">
                  <span class="deadline-badge">
                    ${daysUntil <= 0 ? 'Due Today!' : daysUntil === 1 ? 'Due Tomorrow' : `${daysUntil} days remaining`}
                  </span>
                </p>
              </div>

              <p>${daysUntil <= 1 ? "⏰ This is due very soon! Don't forget to submit it." : 'Make sure to complete it before the deadline!'}</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://frontend-nine-navy-50.vercel.app'}/assignments" class="button">
                  View Assignment →
                </a>
              </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>StudySync AI - Your Study Companion</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Deadline reminder sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending deadline reminder:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send pending tasks summary email
 */
async function sendPendingTasksSummary(userEmail, userName, pendingData) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email service not configured. Skipping pending tasks summary.');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    const { assignments = [], habits = [], studyPlans = [] } = pendingData;
    const totalPending = assignments.length + habits.length + studyPlans.length;

    if (totalPending === 0) {
      return { success: false, message: 'No pending tasks' };
    }
    
    const mailOptions = {
      from: `"StudySync AI" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `📋 You have ${totalPending} pending task${totalPending > 1 ? 's' : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .section { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
            .task-item { padding: 10px; margin: 5px 0; background: #f8f9fa; border-radius: 5px; border-left: 3px solid #667eea; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .badge { display: inline-block; padding: 3px 10px; background: #667eea; color: white; border-radius: 12px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Pending Tasks Summary</h1>
            </div>
            <div class="content">
              <h2>Hi ${userName || 'there'}! 👋</h2>
              <p>Here's a summary of your pending tasks:</p>
              
              ${assignments.length > 0 ? `
                <div class="section">
                  <h3>📝 Assignments <span class="badge">${assignments.length}</span></h3>
                  ${assignments.map(a => `
                    <div class="task-item">
                      <strong>${a.title}</strong><br>
                      <small>Due: ${new Date(a.dueDate).toLocaleDateString()}</small>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${habits.length > 0 ? `
                <div class="section">
                  <h3>✅ Habits <span class="badge">${habits.length}</span></h3>
                  ${habits.map(h => `
                    <div class="task-item">
                      <strong>${h.name}</strong><br>
                      <small>Not completed today</small>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${studyPlans.length > 0 ? `
                <div class="section">
                  <h3>🗓️ Study Plans <span class="badge">${studyPlans.length}</span></h3>
                  ${studyPlans.map(s => `
                    <div class="task-item">
                      <strong>${s.title}</strong><br>
                      <small>Pending sessions</small>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <p style="margin-top: 20px;">Stay on track with your studies! 💪</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'https://frontend-nine-navy-50.vercel.app'}/dashboard" class="button">
                  View Dashboard →
                </a>
              </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>StudySync AI - Your Study Companion</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Pending tasks summary sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending pending tasks summary:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendWelcomeEmail,
  sendDeadlineReminder,
  sendPendingTasksSummary
};
