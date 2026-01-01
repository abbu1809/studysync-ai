import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardNew from './pages/DashboardNew';
import Documents from './pages/Documents';
import Assignments from './pages/Assignments';
import StudyPlanner from './pages/StudyPlanner';
import Chat from './pages/Chat';
import VivaQuestionsNew from './pages/VivaQuestionsNew';
import Settings from './pages/Settings';
import HabitsNew from './pages/HabitsNew';
import Syllabus from './pages/Syllabus';
import Notes from './pages/Notes';

// Components
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Styles
import './styles/index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardNew />} />
                <Route path="documents" element={<Documents />} />
                <Route path="assignments" element={<Assignments />} />
                <Route path="study-planner" element={<StudyPlanner />} />
                <Route path="habits" element={<HabitsNew />} />
                <Route path="syllabus" element={<Syllabus />} />
                <Route path="notes" element={<Notes />} />
                <Route path="chat" element={<Chat />} />
                <Route path="viva" element={<VivaQuestionsNew />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
