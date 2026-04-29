import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewRequest } from './pages/NewRequest';
import { RequestDetail } from './pages/RequestDetail';
import { ReviewerInbox } from './pages/ReviewerInbox';
import { Profile } from './pages/Profile';
import { Analytics } from './pages/Analytics';
import { MeetingInterrupt } from './pages/MeetingInterrupt';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
