import { Card } from "@mantine/core";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  return (
    <Link to={`/movie/${movie.id}`}>
      <Card
        shadow="md"
        radius="md"
        padding="sm"
        className="bg-zinc-800 hover:scale-105 transition h-full"
      >
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="rounded-md w-full aspect-[2/3] object-cover"
        />

        <h2 className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base font-semibold line-clamp-2">
          {movie.title}
        </h2>
      </Card>
    </Link>
  );
}

export default MovieCard;