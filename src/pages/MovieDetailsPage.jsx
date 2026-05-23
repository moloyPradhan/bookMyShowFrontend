import { useParams, useNavigate } from "react-router-dom";
import { useMovies } from "../utils/useMovies";

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
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <p className="text-lg sm:text-xl">Loading...</p>
      </div>
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
    <div className="min-h-screen bg-zinc-900 text-white">
      {/* Header with Back Button */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6">
        <button
          onClick={handleBackToHome}
          className="text-red-500 hover:text-red-400 font-semibold mb-3 sm:mb-4 text-sm sm:text-base"
        >
          ← Back
        </button>
      </div>

      {/* Banner */}
      <div className="relative h-48 sm:h-72 md:h-96 overflow-hidden">
        <img
          src={movie.banner_url}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
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
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg w-full sm:w-fit transition text-sm sm:text-base"
            >
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
  );
}

export default MovieDetailsPage;