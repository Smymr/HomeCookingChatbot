import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import { AUTH_API_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/config"; // Import constants

interface AuthPageProps {
  onLoginSuccess: () => void; // Renamed for clarity
}

const AuthPage = ({ onLoginSuccess }: AuthPageProps) => {
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "", // For registration (username in backend)
    confirmPassword: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    const endpoint = isLogin ? `${AUTH_API_URL}/login` : `${AUTH_API_URL}/register`;
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { username: formData.name, email: formData.email, password: formData.password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (isLogin) {
        if (data.access_token && data.refresh_token) {
          // CHECK if user is admin from token claims (if your backend includes it like 'is_admin')
          // For simplicity, we're assuming the /login endpoint is for admins,
          // or that the backend's `create_access_token` includes an `is_admin` claim.
          // Your backend does include "is_admin" in additional_claims.
          // You might want to decode the token here to check or rely on protected routes later.

          localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
          toast({
            title: "Login Successful",
            description: "Welcome to Yegna Taste Admin Dashboard!",
          });
          onLoginSuccess();
        } else {
          throw new Error("Login failed: No tokens received.");
        }
      } else {
        toast({
          title: "Account Created",
          description: "Admin account created successfully! Please log in.",
        });
        setIsLogin(true); // Switch to login form after registration
        setFormData({ email: formData.email, password: "", name: "", confirmPassword: "" }); // Clear password for login
      }
    } catch (error) {
      toast({
        title: isLogin ? "Login Failed" : "Registration Failed",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-orange-200 shadow-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-yellow-400 text-white rounded-t-lg py-6">
          <CardTitle className="text-3xl font-bold">Yegna Taste</CardTitle>
          <p className="text-orange-100 text-lg">Admin Dashboard</p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
            {isLogin ? "Admin Login" : "Create Admin Account"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name (Username)
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                  required={!isLogin}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 pr-10"
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-orange-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                  required={!isLogin}
                  disabled={isLoading}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-400 hover:from-orange-600 hover:to-yellow-500 text-white font-semibold py-2.5 px-4 rounded-md transition-all duration-200 text-base"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            {/* <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an admin account?" : "Already have an account?"}
              <Button
                variant="link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: "", password: "", name: "", confirmPassword: ""}); // Reset form
                }}
                className="text-orange-600 hover:text-orange-700 font-semibold"
                disabled={isLoading}
              >
                {isLogin ? "Sign Up Here" : "Sign In Here"}
              </Button>
            </p> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;