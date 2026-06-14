import { useNavigate, useLocation } from "react-router-dom";
import authStore from "../store/authStore";
import { logoutUser } from "../api/authApi";
import toastStore from "../store/toastStore";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = authStore();
  const { showToast, showConfirm } = toastStore();

  const isActive = (path) => location.pathname === path;

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
        onClose();
        navigate("/");
      }
    );
  };

  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5L12 3l9 7.5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10v10h14V10" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20v-6h6v6" />
        </svg>
      ),
    },
    ...(isAuthenticated
      ? [
          {
            label: "My Bookings",
            path: "/bookings",
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-zinc-800 border-r border-zinc-700 shadow-2xl transform transition-all duration-200 ease-in-out z-50 md:static md:h-full md:shrink-0 md:overflow-hidden md:shadow-none md:transform-none flex flex-col justify-between ${
          isOpen
            ? "translate-x-0 md:w-64 md:border-r"
            : "-translate-x-full md:translate-x-0 md:w-0 md:border-r-0"
        }`}
      >
        <nav className="px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive(item.path)
                  ? "bg-white text-zinc-900 font-semibold"
                  : "text-gray-300 hover:bg-zinc-700"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {isAuthenticated && (
          <div className="px-4 py-6 border-t border-zinc-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-zinc-700/50 transition font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
