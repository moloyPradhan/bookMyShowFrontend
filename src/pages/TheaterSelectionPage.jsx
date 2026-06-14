import { useParams, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useMovies } from "../utils/useMovies";
import { useShowsByMovie } from "../utils/useShowsByMovie";
import SkeletonLoader from "../components/SkeletonLoader";
import MainLayout from "../layouts/MainLayout";

function TheaterSelectionPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const { data: movies = [], isLoading: moviesLoading } = useMovies();
  const movie = movies.find((m) => m.id === movieId);
  const selectedDate = movie?.release_date?.date?.split(" ")[0] || null;
  const {
    data: showsData = [],
    isLoading: showsLoading,
    error: showsError,
  } = useShowsByMovie(movieId, selectedDate);

  const theaters = useMemo(() => {
    if (!showsData || showsData.length === 0) {
      return [];
    }

    return showsData.reduce((acc, theater) => {
      if (!acc.find((t) => t.theater_id === theater.theater_id)) {
        acc.push({
          theater_id: theater.theater_id,
          theater_name: theater.theater_name,
          address_line_1: theater.address_line_1,
          address_line_2: theater.address_line_2,
          city: theater.city,
          showCount: theater.shows?.length || 0,
        });
      }
      return acc;
    }, []);
  }, [showsData]);

  const handleBackToMovie = () => {
    navigate(`/movie/${movieId}`);
  };

  const handleTheaterSelect = (theater) => {
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
  const hasBanner = Boolean(movie?.banner_url);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-full bg-zinc-900">
          <div className="h-64 sm:h-80 bg-zinc-800 animate-pulse" />
          <div className="-mt-20 px-4 sm:px-6 pb-8 relative z-10">
            <div className="mb-6">
              <div className="h-10 bg-zinc-700 rounded w-40 mb-4 animate-pulse" />
              <div className="h-8 bg-zinc-700 rounded w-2/3 mb-2 animate-pulse" />
              <div className="h-4 bg-zinc-700 rounded w-1/2 animate-pulse" />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <SkeletonLoader count={5} variant="list" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-full bg-zinc-900 text-white">
        <section
          className="relative min-h-64 sm:min-h-80 overflow-hidden bg-zinc-800"
          style={
            hasBanner
              ? {
                  backgroundImage: `url(${movie.banner_url})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-zinc-900/70 to-zinc-900" />
          <div className="relative z-10 px-4 sm:px-6 py-5 sm:py-8">
            <button
              onClick={handleBackToMovie}
              className="inline-flex items-center gap-2 rounded-lg bg-black/45 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-black/65"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="mt-12 sm:mt-20 max-w-3xl">
              <p className="mb-2 text-sm font-semibold uppercase text-red-300">
                Choose your theater
              </p>
              <h1 className="text-3xl sm:text-5xl font-bold">
                {movie?.title || "Movie"}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-200">
                {selectedDate && (
                  <span className="rounded-lg bg-white/12 px-3 py-2 backdrop-blur">
                    {formatDate(selectedDate)}
                  </span>
                )}
                <span className="rounded-lg bg-white/12 px-3 py-2 backdrop-blur">
                  {theaters.length} {theaters.length === 1 ? "theater" : "theaters"} available
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 pt-5 sm:pt-6 pb-8 sm:pb-10 relative z-10">
          {showsError && (
            <div className="bg-red-500/15 text-red-100 p-3 sm:p-4 rounded-lg mb-6 text-sm sm:text-base border border-red-500/40">
              Error loading theaters: {showsError.message}
            </div>
          )}

          {theaters.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {theaters.map((theater) => (
                <button
                  key={theater.theater_id}
                  onClick={() => handleTheaterSelect(theater)}
                  className="group text-left bg-zinc-800/95 rounded-lg p-4 sm:p-5 hover:bg-zinc-800 hover:border-red-400 transition border border-zinc-700 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-red-200 transition">
                        {theater.theater_name}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-300 mb-2">
                        {theater.city}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                        {theater.address_line_1}
                        {theater.address_line_2 && `, ${theater.address_line_2}`}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 border border-red-500/25">
                      {theater.showCount} shows
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-zinc-700 pt-4 text-sm">
                    <span className="text-gray-400">View showtimes</span>
                    <svg className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-800/95 p-6 sm:p-8 rounded-lg text-center border border-zinc-700">
              <p className="text-base sm:text-xl text-gray-400">
                No theaters available for this movie on the selected date
              </p>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}

export default TheaterSelectionPage;
