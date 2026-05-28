import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import PostGenerator from './pages/PostGenerator';
import FlyerGenerator from './pages/FlyerGenerator';
import CampaignPlanner from './pages/CampaignPlanner';
import History from './pages/History';
import AuthCallback from './pages/AuthCallback';
import AuthError from './pages/AuthError';

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/generator/post" element={<PostGenerator />} />
    <Route path="/generator/flyer" element={<FlyerGenerator />} />
    <Route path="/generator/campaign" element={<CampaignPlanner />} />
    <Route path="/history" element={<History />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/auth/error" element={<AuthError />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
export { AppRoutes };