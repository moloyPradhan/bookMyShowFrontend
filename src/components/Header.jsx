import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import authStore from "../store/authStore";
import { logoutUser } from "../api/authApi";
import toastStore from "../store/toastStore";

function Header({ onMenuToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = authStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { showToast, showConfirm } = toastStore();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideInteraction = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideInteraction);
    document.addEventListener("focusin", handleOutsideInteraction);
    return () => {
      document.removeEventListener("mousedown", handleOutsideInteraction);
      document.removeEventListener("focusin", handleOutsideInteraction);
    };
  }, []);

  const handleLogout = () => {
    showConfirm(
      "Are you sure you want to log out?",
      async () => {
        try {
          await logoutUser();
          showToast("Logged out successfully.", "success");
        } catch (err) {
          console.error("Logout error:", err);
          showToast("Failed to log out. Please try again.", "error");
        }
        logout();
        setShowUserMenu(false);
        navigate("/");
      }
    );
  };

  return (
    <header className="bg-zinc-800 border-b border-zinc-700 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-10 py-4 flex justify-between items-center">
        {/* Left Section - Logo and Menu Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
            title="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1
            onClick={() => navigate("/")}
            className="text-xl sm:text-2xl font-bold text-white cursor-pointer hover:opacity-80 transition"
          >
            BMS
          </h1>
        </div>

        {/* Right Section - Auth Actions */}
        <div ref={userMenuRef} className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* User Menu Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-zinc-900 hover:bg-gray-100 transition font-semibold"
                  title="User menu"
                >
                  {
                    user?.name
                      ?.split(" ")
                      .map(word => word.charAt(0).toUpperCase())
                      .join("") || "U"
                  }
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-2 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-zinc-700 text-sm text-gray-300">
                      <p className="font-semibold">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 17l5-5-5-5" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12H9" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
               {/* Login Button */}
              <button
                onClick={() => navigate("/login", { state: { from: location.pathname } })}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-100 text-zinc-900 rounded-lg transition text-sm font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 17l5-5-5-5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3" />
                </svg>
                <span>Login</span>
              </button>

              {/* User Menu for Mobile */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-zinc-900 hover:bg-gray-100 transition font-semibold"
                  title="Auth menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <circle cx="12" cy="10" r="3" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20.7a7 7 0 0110 0" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg py-2 animate-in fade-in zoom-in-95">
                    <button
                      onClick={() => {
                        navigate("/login", { state: { from: location.pathname } });
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-300 hover:bg-zinc-700 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 17l5-5-5-5" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H3" />
                      </svg>
                      Login
                    </button>

                    <button
                      onClick={() => {
                        navigate("/register");
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-300 hover:bg-zinc-700 transition border-t border-zinc-700 mt-2 pt-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                        <circle cx="9.5" cy="7" r="4" strokeWidth={2} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 8v6" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 11h-6" />
                      </svg>
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
