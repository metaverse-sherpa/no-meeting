import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './lib/context';
import { Layout } from './components/Layout';
import { MockLogin } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewRequest } from './pages/NewRequest';
import { RequestDetail } from './pages/RequestDetail';
import { ReviewerInbox } from './pages/ReviewerInbox';
import { Profile } from './pages/Profile';
import { Analytics } from './pages/Analytics';
import { MeetingInterrupt } from './pages/MeetingInterrupt';

function AppRoutes() {
  const { currentUserId, loading } = useApp();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-neutral-400)', fontSize: 13,
      }}>
        Loading...
      </div>
    );
  }

  if (!currentUserId) {
    return <MockLogin />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/request/new" element={<NewRequest />} />
        <Route path="/request/:id" element={<RequestDetail />} />
        <Route path="/inbox" element={<ReviewerInbox />} />
        <Route path="/interrupt" element={<MeetingInterrupt />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
