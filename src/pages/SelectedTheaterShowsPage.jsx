import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useMovies } from "../utils/useMovies";
import { useShowsByMovie } from "../utils/useShowsByMovie";
import { useMemo } from "react";

function SelectedTheaterShowsPage() {
  const { movieId, theaterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const theater = location.state?.theater;
  const selectedDate = location.state?.selectedDate;

  const { data: movies = [], isLoading: moviesLoading } = useMovies();
  const { data: showsData = [], isLoading: showsLoading, error: showsError } = useShowsByMovie(movieId, selectedDate);

  const movie = movies.find((m) => m.id === movieId);

  // Filter shows for selected theater
  const theaterShows = useMemo(() => {
    const theaterData = showsData.find((t) => t.theater_id === theaterId);
    return theaterData?.shows || [];
  }, [showsData, theaterId]);

  const handleBackToTheaters = () => {
    navigate(`/movie/${movieId}/theaters`);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isLoading = moviesLoading || showsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <p className="text-lg sm:text-xl">Loading shows...</p>
      </div>
    );
  }

  if (!theater) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <p className="text-lg sm:text-xl text-red-500">Theater information not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <button
          onClick={handleBackToTheaters}
          className="text-red-500 hover:text-red-400 font-semibold mb-3 sm:mb-4 text-sm sm:text-base"
        >
          ← Back
        </button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            {movie?.title || "Movie"}
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            {theater.theater_name}
          </p>
        </div>

        {showsError && (
          <div className="bg-red-500 text-white p-3 sm:p-4 rounded-lg mb-6 text-sm sm:text-base">
            Error loading shows: {showsError.message}
          </div>
        )}

        {/* Date and Theater Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {selectedDate && (
            <div>
              <p className="text-gray-400 text-sm mb-1">Date:</p>
              <p className="text-lg sm:text-xl font-semibold">
                {formatDate(selectedDate)}
              </p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-sm mb-1">Location:</p>
            <p className="text-sm sm:text-base text-gray-300">
              {theater.city}
            </p>
          </div>
        </div>
      </div>

      {/* Shows Grid */}
      <div className="px-4 sm:p-6">
        {theaterShows && theaterShows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {theaterShows.map((show) => (
              <div
                key={show.show_id}
                className="bg-zinc-800 p-4 sm:p-5 rounded-lg border border-zinc-600 hover:border-red-500 transition"
              >
                {/* Screen Info */}
                <p className="text-xs sm:text-sm text-gray-400 mb-2">
                  {show.screen_name} • {show.screen_type}
                </p>

                {/* Show Time */}
                <p className="text-2xl sm:text-3xl font-bold mb-3">
                  {formatTime(show.start_time.date)}
                </p>

                {/* Details */}
                <div className="text-xs sm:text-sm text-gray-400 mb-4 space-y-1">
                  <p>
                    Duration:{" "}
                    {Math.round(
                      (new Date(show.end_time.date) -
                        new Date(show.start_time.date)) /
                      (1000 * 60)
                    )}{" "}
                    min
                  </p>
                  <p>Language: {show.language}</p>
                  <p>Format: {show.format}</p>
                </div>

                {/* Price and Button */}
                <div className="flex flex-col gap-3">
                  <div className="text-lg sm:text-xl font-bold text-green-400">
                    ₹{show.price}
                  </div>
                  <button
                    onClick={() => navigate(`/show/${show.show_id}/seats`)}
                    className="block bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-center transition text-sm sm:text-base"
                  >
                    Select Seats
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-800 p-6 sm:p-8 rounded-lg text-center">
            <p className="text-base sm:text-xl text-gray-400">
              No shows available for this theater on the selected date
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SelectedTheaterShowsPage;
