import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CPTracker from './pages/CPTracker';
import GitHubTracker from './pages/GitHubTracker';
import RepoVisualizer from './pages/RepoVisualizer';
import PracticeReview from './pages/PracticeReview';
import ManageAccount from './pages/ManageAccount';
import PublicProfile from './pages/PublicProfile';
import NotFound from './pages/NotFound';
import Contests from './pages/Contests';
import Journal from './pages/Journal';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgotpassword" element={<ForgotPassword />} />
              <Route path="/resetpassword/:token" element={<ResetPassword />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/github"
                element={
                  <ProtectedRoute>
                    <GitHubTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cp"
                element={
                  <ProtectedRoute>
                    <CPTracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/repos"
                element={
                  <ProtectedRoute>
                    <RepoVisualizer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practice"
                element={
                  <ProtectedRoute>
                    <PracticeReview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <ManageAccount />
                  </ProtectedRoute>
                }
              />
              <Route path="/u/:username" element={<PublicProfile />} />
              <Route
                path="/contests"
                element={<ProtectedRoute><Contests /></ProtectedRoute>}
              />
              <Route
                path="/journal"
                element={<ProtectedRoute><Journal /></ProtectedRoute>}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;