import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import AuthPage from "@/pages/AuthPage";
import CinematicIntro from "@/pages/CinematicIntro";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Goals from "@/pages/Goals";
import Habits from "@/pages/Habits";
import VisionBoard from "@/pages/VisionBoard";
import Journal from "@/pages/Journal";
import Exercises from "@/pages/Exercises";
import AICoach from "@/pages/AICoach";
import Analytics from "@/pages/Analytics";
import JourneyMap from "@/pages/JourneyMap";
import RitualMode from "@/pages/RitualMode";
import WisdomLibrary from "@/pages/WisdomLibrary";
import TransformationTimeline from "@/pages/TransformationTimeline";
import IdentityEvolution from "@/pages/IdentityEvolution";
import ObstacleTransformer from "@/pages/ObstacleTransformer";
import BurningDesire from "@/pages/BurningDesire";
import ThemeSettings from "@/pages/ThemeSettings";
import InspirationFeed from "@/pages/InspirationFeed";
import MentorLetters from "@/pages/MentorLetters";
import LegacyMode from "@/pages/LegacyMode";
import PremeditatioPractice from "@/pages/PremeditatioPractice";
import HabitStacking from "@/pages/HabitStacking";
import MorningAlgorithm from "@/pages/MorningAlgorithm";
import PhilosophyPage from "@/pages/PhilosophyPage";
import Layout from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [showCinematicIntro, setShowCinematicIntro] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userPreferences, setUserPreferences] = useState(
    JSON.parse(localStorage.getItem('userPreferences') || 'null')
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogin = (token, user) => {
    setToken(token);
    setUser(user);
    // Check if user needs onboarding
    const prefs = localStorage.getItem('userPreferences');
    const hasSeenIntro = localStorage.getItem('hasSeenCinematicIntro');
    
    if (!prefs || !JSON.parse(prefs).onboardingCompleted) {
      // New user - show cinematic intro first
      if (!hasSeenIntro) {
        setShowCinematicIntro(true);
      } else {
        setShowOnboarding(true);
      }
    }
  };

  const handleCinematicIntroComplete = () => {
    localStorage.setItem('hasSeenCinematicIntro', 'true');
    setShowCinematicIntro(false);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (preferences) => {
    setUserPreferences(preferences);
    setShowOnboarding(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setUserPreferences(null);
    setShowOnboarding(false);
    localStorage.removeItem('userPreferences');
  };

  return (
    <div className="App">
      <BrowserRouter>
        {/* Show cinematic intro for first-time users */}
        {token && showCinematicIntro ? (
          <CinematicIntro 
            onComplete={handleCinematicIntroComplete} 
            userName={user?.name}
          />
        ) : token && showOnboarding ? (
          <Onboarding user={user} onComplete={handleOnboardingComplete} />
        ) : (
          <Routes>
            <Route
              path="/auth"
              element={!token ? <AuthPage onLogin={handleLogin} /> : <Navigate to="/" />}
            />
            <Route
              path="/"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <Dashboard token={token} user={user} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/goals"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <Goals token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/habits"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <Habits token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/vision-board"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <VisionBoard token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/journal"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <Journal token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/exercises"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <Exercises token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/ai-coach"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <AICoach token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/analytics"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <Analytics token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/journey"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <JourneyMap token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/rituals"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <RitualMode token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/wisdom"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <WisdomLibrary token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/timeline"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <TransformationTimeline token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/identity"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <IdentityEvolution token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/obstacle"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <ObstacleTransformer token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/burning-desire"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <BurningDesire token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/themes"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <ThemeSettings token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/inspiration"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <InspirationFeed token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/letters"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <MentorLetters token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/legacy"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <LegacyMode token={token} user={user} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/premeditatio"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <PremeditatioPractice token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/habit-stacking"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <HabitStacking token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/morning-algorithm"
              element={
                token ? (
                  <Layout user={user} onLogout={handleLogout} userPreferences={userPreferences}>
                    <MorningAlgorithm token={token} userPreferences={userPreferences} />
                  </Layout>
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="/philosophy/:feature"
              element={<PhilosophyPage />}
            />
          </Routes>
        )}
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
