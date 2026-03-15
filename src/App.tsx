import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { ReadingPage } from './pages/ReadingPage';
import { BrowsePage } from './pages/BrowsePage';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { QuizPage } from './pages/QuizPage';
import { AboutPage } from './pages/AboutPage';
import { useAuth } from './hooks/useAuth';
import { useSync } from './hooks/useSync';

function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  // Initialize auth session listener and sync
  useAuth();
  useSync();
  return <>{children}</>;
}

function App() {
  return (
    <HashRouter>
      <AuthSyncProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/reading/:id" element={<ReadingPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Routes>
      </AuthSyncProvider>
    </HashRouter>
  );
}

export default App;
