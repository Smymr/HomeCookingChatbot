import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner"; //
import { TooltipProvider } from "@/components/ui/tooltip"; //
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound"; //
import DashboardLayout from "./layouts/DashboardLayout"; //
import { DashboardPage, UsersPage, RecipesPage, BlogsPage, NotificationsPage } from "./pages/admin"; //
import SettingsPage from "./pages/admin/SettingsPage"; //
import AuthPage from "./pages/admin/AuthPage"; //
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/config"; // Import constants

const queryClient = new QueryClient();

// Helper function to check for token (can be moved to a utility file)
const checkAuthStatus = (): boolean => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  // You might want to add more sophisticated checks here, like token expiration,
  // or even a call to a /me endpoint to verify the token with the backend.
  return !!accessToken;
};


const App = () => {
  // Initialize isAuthenticated based on stored token
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuthStatus());
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // To prevent flicker

  useEffect(() => {
    setIsAuthenticated(checkAuthStatus());
    setIsLoadingAuth(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setIsAuthenticated(false);
    // Optionally, redirect to login or home page after logout
    // navigate('/admin/auth'); // if using useNavigate from react-router-dom
  };

  if (isLoadingAuth) {
    // You can return a loading spinner here if you want
    return <div>Loading authentication status...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider> {/* */}
        <Toaster /> {/* */}
        <Sonner /> {/* */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {!isAuthenticated ? (
              <>
                <Route path="/admin/auth" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
                {/* Redirect any other /admin/* routes to auth if not authenticated */}
                <Route path="/admin/*" element={<Navigate to="/admin/auth" replace />} />
              </>
            ) : (
              <Route path="/admin" element={<DashboardLayout onLogout={handleLogout} />}>
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="recipes" element={<RecipesPage />} />
                <Route path="blogs" element={<BlogsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                 {/* Redirect from /admin/auth to /admin/dashboard if already authenticated */}
                <Route path="auth" element={<Navigate to="/admin" replace />} />
              </Route>
            )}
            
            <Route path="*" element={<NotFound />} /> {/* */}
          </Routes>
        </BrowserRouter>
      </TooltipProvider> {/* */}
    </QueryClientProvider>
  );
};

export default App;