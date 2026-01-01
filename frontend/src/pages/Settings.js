import React, { useState, useEffect } from 'react';
import { FiUser, FiClock, FiBell, FiSun, FiMoon, FiSave } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { userService } from '../services';
import { toast } from 'react-toastify';

const Settings = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    photoURL: ''
  });

  const [preferences, setPreferences] = useState({
    studyHoursPerDay: 4,
    studyTimePreference: 'evening',
    breakDuration: 15,
    sessionDuration: 45,
    notificationsEnabled: true,
    emailNotifications: true,
    deadlineReminders: true,
    theme: 'light'
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      
      setProfile({
        displayName: data.user.displayName || '',
        email: data.user.email || '',
        photoURL: data.user.photoURL || ''
      });

      setPreferences({
        ...preferences,
        ...data.user.preferences,
        theme
      });
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await userService.updatePreferences({
        ...preferences,
        studyHoursPerDay: Number(preferences.studyHoursPerDay),
        breakDuration: Number(preferences.breakDuration),
        sessionDuration: Number(preferences.sessionDuration)
      });

      // Update theme if changed
      if (preferences.theme !== theme) {
        toggleTheme();
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiUser className="text-2xl text-indigo-600" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-6">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt="Profile"
                  className="w-20 h-20 rounded-full"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                  <FiUser className="text-3xl text-indigo-600" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{profile.displayName || 'User'}</h3>
                <p className="text-gray-600">{profile.email}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="input-field w-full"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  className="input-field w-full bg-gray-100"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Study Preferences */}
        <form onSubmit={handleSavePreferences}>
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <FiClock className="text-2xl text-indigo-600" />
              <h2 className="text-xl font-semibold">Study Preferences</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Target Study Hours Per Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  step="0.5"
                  value={preferences.studyHoursPerDay}
                  onChange={(e) => setPreferences({ ...preferences, studyHoursPerDay: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Preferred Study Time
                </label>
                <select
                  value={preferences.studyTimePreference}
                  onChange={(e) => setPreferences({ ...preferences, studyTimePreference: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="morning">Morning (6 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 9 PM)</option>
                  <option value="night">Night (9 PM - 12 AM)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Session Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="120"
                  step="15"
                  value={preferences.sessionDuration}
                  onChange={(e) => setPreferences({ ...preferences, sessionDuration: e.target.value })}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  step="5"
                  value={preferences.breakDuration}
                  onChange={(e) => setPreferences({ ...preferences, breakDuration: e.target.value })}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="card p-6 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <FiBell className="text-2xl text-indigo-600" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notificationsEnabled}
                  onChange={(e) => setPreferences({ ...preferences, notificationsEnabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-medium">Enable Notifications</p>
                  <p className="text-sm text-gray-600">Receive in-app notifications</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Get updates via email</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.deadlineReminders}
                  onChange={(e) => setPreferences({ ...preferences, deadlineReminders: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-medium">Deadline Reminders</p>
                  <p className="text-sm text-gray-600">Get reminded about upcoming deadlines</p>
                </div>
              </label>
            </div>
          </div>

          {/* Appearance */}
          <div className="card p-6 mt-6">
            <div className="flex items-center gap-3 mb-6">
              {theme === 'dark' ? (
                <FiMoon className="text-2xl text-indigo-600" />
              ) : (
                <FiSun className="text-2xl text-indigo-600" />
              )}
              <h2 className="text-xl font-semibold">Appearance</h2>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                className="input-field w-full md:w-64"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-8"
            >
              <FiSave />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
