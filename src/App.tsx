import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { StudyPage } from './pages/StudyPage';
import { BrowsePage } from './pages/BrowsePage';
import { DecksPage } from './pages/DecksPage';
import { SettingsPage } from './pages/SettingsPage';
import { useDB } from './hooks/useDB';

function AppInner() {
  const { ready, error } = useDB();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-center px-4">
        <div>
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-gray-700 dark:text-gray-300">Failed to initialize database: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-400">
          <p className="text-3xl mb-3">🀄</p>
          <p>Loading MandarinSRS…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="study/:deckId" element={<StudyPage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="decks" element={<DecksPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

const queryClientInstance = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
