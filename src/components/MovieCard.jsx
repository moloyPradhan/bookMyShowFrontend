import { Card, Badge } from "@mantine/core";
import { Link } from "react-router-dom";

function MovieCard({ movie }) {
  const releaseDate = new Date(movie.release_date.date).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

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

        <h2 className="mt-2 text-sm md:text-base font-semibold line-clamp-2">
          {movie.title}
        </h2>

        <div className="mt-2 flex flex-wrap gap-1">
          <Badge size="xs" variant="light">
            {movie.language}
          </Badge>

          <Badge
            size="xs"
            color={movie.status === "upcoming" ? "yellow" : "green"}
            variant="light"
          >
            {movie.status}
          </Badge>
        </div>

        <p className="mt-2 text-xs text-zinc-400">
          Release: {releaseDate}
        </p>
      </Card>
    </Link>
  );
}

export default MovieCard;