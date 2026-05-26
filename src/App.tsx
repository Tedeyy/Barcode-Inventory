import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { InventoryList } from './pages/InventoryList';
import { Generator } from './pages/Generator';
import { Scanner } from './pages/Scanner';

const AppRoutes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return null; // Layout handles loading state already
  }

  return (
    <Routes>
      <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" replace />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/generator" element={<Generator />} />
        <Route path="/scanner" element={<Scanner />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <InventoryProvider>
          <AppRoutes />
        </InventoryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
