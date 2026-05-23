import MovieCard from "../components/MovieCard";
import { useMovies } from "../utils/useMovies";

function HomePage() {
  const { data: movies = [], isLoading, error } = useMovies();

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
    <div className="min-h-screen bg-zinc-900 text-white p-4 sm:p-6 md:p-10">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">
        Book My Show Clone
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
  );
}

export default HomePage;