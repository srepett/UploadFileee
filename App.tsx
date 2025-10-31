
import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HistoryPage from './pages/HistoryPage';
import ViewFilePage from './pages/ViewFilePage';
import Navbar from './components/Navbar';

// Lazy load the AdminPage to isolate its dependencies and improve initial load time
const AdminPage = lazy(() => import('./pages/AdminPage'));

// A wrapper to protect routes that require authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <i className="fas fa-spinner fa-spin text-cyan-accent text-4xl"></i>
      </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
     return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
    return (
        <HashRouter>
            <div className="min-h-screen bg-dark-bg font-sans">
                <Navbar />
                <main className="pt-20 px-4 md:px-8">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        
                        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                        
                        <Route 
                            path="/admin" 
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <Suspense fallback={<div className="flex justify-center items-center h-screen"><i className="fas fa-spinner fa-spin text-cyan-accent text-4xl"></i></div>}>
                                        <AdminPage />
                                    </Suspense>
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route path="/video/:id" element={<ViewFilePage />} />
                        <Route path="/foto/:id" element={<ViewFilePage />} />

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
