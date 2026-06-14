import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { loginUser, googleLogin, getMe } from "../api/authApi";
import authStore from "../store/authStore";
import AuthLayout from "../layouts/AuthLayout";
import { GoogleLogin } from "@react-oauth/google";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, isAuthenticated } = authStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await loginUser(formData);
      const userResponse = await getMe();
      setUser(userResponse.data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");
    try {
      await googleLogin(credentialResponse.credential);
      const userResponse = await getMe();
      setUser(userResponse.data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthLayout>
      <div className="min-h-screen px-4 py-6 sm:px-6 flex flex-col">
        <button
          onClick={() => navigate("/")}
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Home
        </button>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold">Welcome back</h1>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 shadow-2xl sm:p-6">
              {error && (
                <div className="bg-red-500/15 text-red-100 p-3 rounded-lg mb-4 text-sm border border-red-500/30">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white transition"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 text-zinc-900 font-bold py-3 rounded-lg transition mt-6 inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 17l5-5-5-5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3" />
                  </svg>
                  <span>{isLoading ? "Signing in..." : "Sign In"}</span>
                </button>


              </form>

              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-zinc-700" />
                <span className="px-3 text-gray-500 text-sm">OR</span>
                <div className="flex-1 border-t border-zinc-700" />
              </div>

              <div className="flex justify-center mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setError("Google login failed");
                  }}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                  width="300"
                />
              </div>

              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-white hover:text-gray-200 font-semibold transition underline"
                >
                  Sign up here
                </Link>
              </p>
            </div>


          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
