import React, { Component } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import MasterDashboard from "./pages/dashboard/MasterDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "sonner";
import MasterProfile from "./pages/MasterProfile";
import { MastersPage } from "./pages/masters";
import { DesignsPage } from "./pages/designs";
import "./App.css";
import { DesignPage } from "./pages/design";

// Создаем QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут (заменили cacheTime на gcTime)
    },
  },
});

// Компонент для отлова ошибок
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Что-то пошло не так</h1>
            <button
              className="px-4 py-2 bg-primary text-white rounded"
              onClick={() => this.setState({ hasError: false })}
            >
              Попробовать снова
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ThemeProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  <Route path="/" element={<Index />} />

                  <Route path="/auth" element={<Auth />} />
                  
                  <Route 
                    path="/client-dashboard" 
                    element={
                      <ProtectedRoute requiredRole="client">
                        <ClientDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/master-dashboard" 
                    element={
                      <ProtectedRoute requiredRole="nailmaster">
                        <MasterDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/admin-dashboard" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  <Route path="/masters" element={<MastersPage />} />
                  <Route path="/master/:masterId" element={<MasterProfile />} />
                  <Route path="/designs" element={<DesignsPage />} />
                  <Route path="/designs/:id" element={<DesignPage />} />
                  <Route path="*" element={<NotFound />} />
                  
                </Routes>
                <Toaster />
              </div>
            </AuthProvider>
          </ThemeProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
