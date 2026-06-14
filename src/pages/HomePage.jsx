import MovieCard from "../components/MovieCard";
import SkeletonLoader from "../components/SkeletonLoader";
import { useMovies } from "../utils/useMovies";
import MainLayout from "../layouts/MainLayout";

function HomePage() {
  const { data: movies = [], isLoading, error } = useMovies();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-white p-4 sm:p-6 md:p-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">
            Featured 2026
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            <SkeletonLoader count={10} variant="grid" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-white p-4 sm:p-6 md:p-10 flex items-center justify-center h-full">
          <p className="text-lg sm:text-xl text-red-500">Error loading movies: {error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="text-white p-4 sm:p-6 md:p-10">
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
    </MainLayout>
  );
}

export default HomePage;