import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { useMovies } from "../utils/useMovies";
import authStore from "../store/authStore";
import { logoutUser } from "../api/authApi";

function HomePage() {
  const navigate = useNavigate();
  const { data: movies = [], isLoading, error } = useMovies();
  const { isAuthenticated, user, logout } = authStore();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    }
    logout();
  };

  if (isLoading) {
    return (
      <div className="text-white p-4 sm:p-6 md:p-10 min-h-screen bg-zinc-900 flex items-center justify-center">
        <p className="text-lg sm:text-xl">Loading movies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white p-4 sm:p-6 md:p-10 min-h-screen bg-zinc-900 flex items-center justify-center">
        <p className="text-lg sm:text-xl text-red-500">Error loading movies: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header with Auth Links */}
      <div className="bg-zinc-800 border-b border-zinc-700 px-4 sm:px-6 md:px-10 py-4 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-red-500">BookMyShow</h1>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-xs sm:text-sm text-gray-300">
                Welcome, {user?.name || "User"}!
              </span>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="text-xs sm:text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded transition"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}

      <div className="p-4 sm:p-6 md:p-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">
          Featured 2026
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomePage;