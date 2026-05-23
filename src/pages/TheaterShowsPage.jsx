import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMovies } from "../utils/useMovies";
import { useShowsByMovie } from "../utils/useShowsByMovie";

function TheaterShowsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);

  const { data: movies = [], isLoading: moviesLoading } = useMovies();
  const { data: theaters = [], isLoading: showsLoading, error: showsError } = useShowsByMovie(movieId, selectedDate);

  const movie = movies.find((m) => m.id === movieId);

  // Set default date when movie is loaded
  useEffect(() => {
    if (movie && !selectedDate) {
      const releaseDate = movie.release_date?.date?.split(" ")[0];
      if (releaseDate) {
        setSelectedDate(releaseDate);
      }
    }
  }, [movie, selectedDate]);

  const handleBackToMovie = () => {
    navigate(`/movie/${movieId}`);
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
        <p className="text-lg sm:text-xl">
          Loading theaters and shows...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <button
          onClick={handleBackToMovie}
          className="text-red-500 hover:text-red-400 font-semibold mb-3 sm:mb-4 text-sm sm:text-base"
        >
          ← Back
        </button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            {movie?.title || "Movie"}
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Select a theater and showtime
          </p>
        </div>

        {showsError && (
          <div className="bg-red-500 text-white p-3 sm:p-4 rounded-lg mb-6 text-sm sm:text-base">
            Error loading shows: {showsError.message}
          </div>
        )}

        {/* Date Picker */}
        {selectedDate && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-2">Date:</p>
            <p className="text-lg sm:text-xl font-semibold">
              {formatDate(selectedDate)}
            </p>
          </div>
        )}
      </div>

      {/* Theaters and Shows */}
      <div className="px-4 sm:p-6">
        {theaters && theaters.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {theaters.map((theater) => (
              <div
                key={theater.theater_id}
                className="bg-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-700 transition"
              >
                {/* Theater Header */}
                <div className="bg-zinc-700 p-4 sm:p-5">
                  <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                    {theater.theater_name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-300 mb-2">
                    Location : {theater.city}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {theater.address_line_1}
                    {theater.address_line_2 &&
                      `, ${theater.address_line_2}`}
                  </p>
                </div>

                {/* Shows Grid */}
                <div className="p-4 sm:p-5">
                  {theater.shows && theater.shows.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {theater.shows.map((show) => (
                        <div
                          key={show.show_id}
                          className="bg-zinc-900 p-3 sm:p-4 rounded-lg border border-zinc-600 hover:border-red-500 transition"
                        >
                          {/* Screen Info */}
                          <p className="text-xs sm:text-sm text-gray-400 mb-1">
                            {show.screen_name} • {show.screen_type}
                          </p>

                          {/* Show Time */}
                          <p className="text-lg sm:text-xl font-bold mb-2">
                            {formatTime(show.start_time.date)}
                          </p>

                          {/* Details */}
                          <div className="text-xs sm:text-sm text-gray-400 mb-3 space-y-1">
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
                          <div className="flex flex-col gap-2 sm:gap-3">
                            <div className="text-lg sm:text-xl font-bold text-green-400">
                              ₹{show.price}
                            </div>
                            <Link
                              to={`/show/${show.show_id}/seats`}
                              className="block bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-center transition text-sm sm:text-base"
                            >
                              Select Seats
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-4">
                      No shows available for this theater
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-800 p-6 sm:p-8 rounded-lg text-center">
            <p className="text-base sm:text-xl text-gray-400">
              No theaters available for this movie on the
              selected date
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TheaterShowsPage;
