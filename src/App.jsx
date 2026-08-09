import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PasswordGate from './components/PasswordGate';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LogTrade from './pages/LogTrade';
import TradeList from './pages/TradeList';
import TradeDetail from './pages/TradeDetail';
import Setups from './pages/Setups';

export default function App() {
  return (
    <AuthProvider>
      <PasswordGate>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/log" element={<LogTrade />} />
              <Route path="/log/:id" element={<LogTrade />} />
              <Route path="/trades" element={<TradeList />} />
              <Route path="/trades/:id" element={<TradeDetail />} />
              <Route path="/setups" element={<Setups />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PasswordGate>
    </AuthProvider>
  );
}
