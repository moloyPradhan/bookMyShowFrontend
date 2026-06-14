import { useParams, useNavigate } from "react-router-dom";
import { useMovies } from "../utils/useMovies";
import SkeletonLoader from "../components/SkeletonLoader";
import MainLayout from "../layouts/MainLayout";

function MovieDetailsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const { data: movies = [], isLoading, error } = useMovies();

  const handleBackToHome = () => {
    navigate("/");
  };

  const movie = movies.find((m) => m.id === movieId);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-white min-h-screen">
          <div className="relative h-48 sm:h-72 md:h-96 bg-zinc-800 animate-pulse" />
          <div className="px-4 sm:px-6 pb-8 sm:pb-10">
            <div className="-mt-20 sm:-mt-32 relative z-10 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="w-32 h-48 sm:w-48 sm:h-72 bg-zinc-700 rounded-lg animate-pulse flex-shrink-0 mx-auto sm:mx-0" />
                <div className="flex-1">
                  <div className="h-8 bg-zinc-700 rounded animate-pulse w-2/3 mb-3" />
                  <div className="flex gap-2 mb-4">
                    <div className="h-6 w-16 bg-zinc-700 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-zinc-700 rounded animate-pulse" />
                  </div>
                  <div className="h-10 w-40 bg-white/10 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-zinc-700 rounded animate-pulse w-full" />
              <div className="h-4 bg-zinc-700 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-zinc-700 rounded animate-pulse w-4/5" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <p className="text-lg sm:text-xl text-red-500">Error loading movie details: {error.message}</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <p className="text-lg sm:text-xl">Movie not found</p>
      </div>
    );
  }

  const handleBookShow = () => {
    navigate(`/movie/${movieId}/theaters`);
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.match(
      /(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/
    )?.[1];
    return videoId
      ? `https://www.youtube.com/embed/${videoId}`
      : null;
  };

  return (
    <MainLayout>
      <div className="text-white">
        {/* Banner */}
        <div className="relative h-48 sm:h-72 md:h-96 overflow-hidden">
          <button
            onClick={handleBackToHome}
            className="absolute left-4 top-4 sm:left-6 sm:top-6 z-20 flex items-center gap-2 rounded-lg bg-black/55 px-3 py-2 text-sm text-white backdrop-blur transition hover:bg-black/75"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>

          {movie.banner_url && (
            <img
              src={movie.banner_url}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900"></div>
        </div>



      <div className="px-4 sm:px-6 pb-8 sm:pb-10">
        {/* Movie Info Section */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 -mt-20 sm:-mt-32 relative z-10 mb-6 sm:mb-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-32 h-48 sm:w-48 sm:h-72 object-cover rounded-lg shadow-lg"
            />
          </div>

          {/* Movie Details */}
          <div className="flex-1 flex flex-col justify-end pb-0 sm:pb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
              {movie.title}
            </h1>

            <div className="flex flex-wrap gap-2 mb-3 sm:mb-4 text-xs sm:text-sm">
              <span className="bg-yellow-500 text-black px-2 py-1 rounded">
                {movie.censor_rating}
              </span>
              <span className="bg-zinc-700 px-2 py-1 rounded">
                {movie.language}
              </span>
              <span className="bg-zinc-700 px-2 py-1 rounded">
                {movie.genre}
              </span>
              <span className="bg-zinc-700 px-2 py-1 rounded">
                {movie.duration_minutes} min
              </span>
            </div>

            <button
              onClick={handleBookShow}
              className="bg-white hover:bg-gray-100 text-zinc-900 font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg w-full sm:w-fit transition text-sm sm:text-base inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7a2 2 0 012-2h12a2 2 0 012 2v2a3 3 0 010 6v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2a3 3 0 000-6V7z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8v8" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9h3" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 15h3" />
              </svg>
              Book Show
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">
            About the Movie
          </h2>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            {movie.description}
          </p>
        </div>

        {/* Trailer */}
        {movie.trailer_url && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">
              Trailer
            </h2>
            <div className="w-full bg-black rounded-lg overflow-hidden aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={getYouTubeEmbedUrl(movie.trailer_url)}
                title={`${movie.title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        )}
        </div>
      </div>
    </MainLayout>
  );
}

export default MovieDetailsPage;
