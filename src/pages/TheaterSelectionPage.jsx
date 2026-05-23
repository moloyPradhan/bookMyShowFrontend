import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMovies } from "../utils/useMovies";
import { useShowsByMovie } from "../utils/useShowsByMovie";

function TheaterSelectionPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [theaters, setTheaters] = useState([]);

  const { data: movies = [], isLoading: moviesLoading } = useMovies();
  const { data: showsData = [], isLoading: showsLoading, error: showsError } = useShowsByMovie(movieId, selectedDate);

  const movie = movies.find((m) => m.id === movieId);

  // Extract unique theaters from shows data
  useEffect(() => {
    if (showsData && showsData.length > 0) {
      const uniqueTheaters = showsData.reduce((acc, theater) => {
        if (!acc.find((t) => t.theater_id === theater.theater_id)) {
          acc.push({
            theater_id: theater.theater_id,
            theater_name: theater.theater_name,
            address_line_1: theater.address_line_1,
            address_line_2: theater.address_line_2,
            city: theater.city,
          });
        }
        return acc;
      }, []);
      setTheaters(uniqueTheaters);
    }
  }, [showsData]);

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

  const handleTheaterSelect = (theater) => {
    setSelectedTheater(theater);
    navigate(`/movie/${movieId}/theater/${theater.theater_id}/shows`, {
      state: { selectedDate, theater },
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
        <p className="text-lg sm:text-xl">Loading theaters...</p>
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
            Select a theater
          </p>
        </div>

        {showsError && (
          <div className="bg-red-500 text-white p-3 sm:p-4 rounded-lg mb-6 text-sm sm:text-base">
            Error loading theaters: {showsError.message}
          </div>
        )}

        {/* Date Display */}
        {selectedDate && (
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-2">Date:</p>
            <p className="text-lg sm:text-xl font-semibold">
              {formatDate(selectedDate)}
            </p>
          </div>
        )}
      </div>

      {/* Theaters List */}
      <div className="px-4 sm:p-6">
        {theaters && theaters.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {theaters.map((theater) => (
              <div
                key={theater.theater_id}
                onClick={() => handleTheaterSelect(theater)}
                className="bg-zinc-800 rounded-lg p-4 sm:p-5 hover:bg-zinc-700 hover:border-red-500 transition cursor-pointer border border-zinc-700"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">
                  {theater.theater_name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mb-2">
                  {theater.city}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">
                  {theater.address_line_1}
                  {theater.address_line_2 && `, ${theater.address_line_2}`}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-800 p-6 sm:p-8 rounded-lg text-center">
            <p className="text-base sm:text-xl text-gray-400">
              No theaters available for this movie on the selected date
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TheaterSelectionPage;
