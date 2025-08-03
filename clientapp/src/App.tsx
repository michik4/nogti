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
import Layout from "@/components/Layout";

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
              <Routes>
                {/* Главная страница */}
                <Route path="/" element={<Layout><Index /></Layout>} />
                
                {/* Страница авторизации */}
                <Route path="/auth" element={<Layout showHeader={false}><Auth /></Layout>} />

                {/* Защищенные маршруты с хедером */}
                <Route
                  path="/client-dashboard"
                  element={
                    <ProtectedRoute requiredRole="client">
                      <Layout>
                        <ClientDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/master-dashboard"
                  element={
                    <ProtectedRoute requiredRole="nailmaster">
                      <Layout>
                        <MasterDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Layout>
                        <AdminDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Публичные маршруты с хедером */}
                <Route path="/masters" element={<Layout><MastersPage /></Layout>} />
                <Route path="/master/:masterId" element={<Layout><MasterProfile /></Layout>} />
                <Route path="/designs" element={<Layout><DesignsPage /></Layout>} />
                <Route path="/designs/:id" element={<Layout><DesignPage /></Layout>} />
                
                {/* Страница 404 */}
                <Route path="*" element={<Layout><NotFound /></Layout>} />
              </Routes>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
