import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppLayout from './components/layout/AppLayout';
import { ExpenseProvider } from './context/ExpenseContext';
import Budgets from './pages/Budgets';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';

export default function App() {
  return (
    <BrowserRouter>
      <ExpenseProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster richColors position="top-right" />
      </ExpenseProvider>
    </BrowserRouter>
  );
}
