import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useMovies } from "../utils/useMovies";
import { useShowsByMovie } from "../utils/useShowsByMovie";
import MainLayout from "../layouts/MainLayout";
import SkeletonLoader from "../components/SkeletonLoader";

function TheaterShowsPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  
  // Local filter states
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState("All");
  const [sortBy, setSortBy] = useState("time");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: movies = [], isLoading: moviesLoading } = useMovies();
  const movie = movies.find((m) => m.id === movieId);

  // Set default date when movie is loaded
  useEffect(() => {
    if (movie && !selectedDate) {
      const releaseDate = movie.release_date?.date?.split(" ")[0];
      if (releaseDate) {
        setSelectedDate(releaseDate);
      } else {
        setSelectedDate(new Date().toISOString().split("T")[0]);
      }
    }
  }, [movie, selectedDate]);

  const { data: theaters = [], isLoading: showsLoading, error: showsError } = useShowsByMovie(movieId, selectedDate || null);

  // Generate 7-day date list starting from the movie release date or original selected date
  const dateList = useMemo(() => {
    const base = (movie?.release_date?.date?.split(" ")[0]) || new Date().toISOString().split("T")[0];
    if (!base) return [];

    const baseDate = new Date(base);
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const formatted = `${yyyy}-${mm}-${dd}`;
      list.push({
        formatted,
        dayName: d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase(),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
      });
    }
    return list;
  }, [movie]);

  // Process theaters (filter shows internally, sort, and search theaters)
  const processedTheaters = useMemo(() => {
    if (!theaters || theaters.length === 0) return [];

    return theaters
      .map((theater) => {
        let filteredShows = theater.shows ? [...theater.shows] : [];

        // Filter by Format (2D, 3D, IMAX)
        if (selectedFormat !== "All") {
          filteredShows = filteredShows.filter((show) =>
            show.format?.toUpperCase().includes(selectedFormat.toUpperCase()) ||
            show.screen_type?.toUpperCase().includes(selectedFormat.toUpperCase())
          );
        }

        // Filter by Time of Day
        if (selectedTimeOfDay !== "All") {
          filteredShows = filteredShows.filter((show) => {
            const timeStr = show.start_time.date;
            const hours = new Date(timeStr).getHours();
            if (selectedTimeOfDay === "Morning") return hours < 12;
            if (selectedTimeOfDay === "Afternoon") return hours >= 12 && hours < 16;
            if (selectedTimeOfDay === "Evening") return hours >= 16 && hours < 20;
            if (selectedTimeOfDay === "Night") return hours >= 20;
            return true;
          });
        }

        // Sort shows
        if (sortBy === "price") {
          filteredShows.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        } else if (sortBy === "time") {
          filteredShows.sort((a, b) => new Date(a.start_time.date) - new Date(b.start_time.date));
        }

        return {
          ...theater,
          shows: filteredShows,
        };
      })
      .filter((theater) => {
        const matchesSearch =
          theater.theater_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          theater.city?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch && theater.shows.length > 0;
      });
  }, [theaters, selectedFormat, selectedTimeOfDay, sortBy, searchQuery]);

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

  const formatDateLabel = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isLoading = moviesLoading || showsLoading;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-6 w-16 bg-zinc-800 rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-zinc-800 rounded w-1/3 animate-pulse" />
            <div className="h-6 bg-zinc-800 rounded w-1/2 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mt-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-20 bg-zinc-800 rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="space-y-6 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-zinc-800 rounded-xl p-6 space-y-4 animate-pulse">
                <div className="h-6 bg-zinc-700 rounded w-1/4" />
                <div className="h-4 bg-zinc-700 rounded w-1/2" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="h-32 bg-zinc-700 rounded-lg" />
                  <div className="h-32 bg-zinc-700 rounded-lg" />
                  <div className="h-32 bg-zinc-700 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="relative text-white min-h-screen bg-zinc-900">
        {/* Banner Backdrop Blurry Overlay */}
        {movie?.banner_url && (
          <div className="absolute top-0 left-0 right-0 h-[400px] overflow-hidden pointer-events-none z-0">
            <img
              src={movie.banner_url}
              alt=""
              className="w-full h-full object-cover blur-2xl opacity-15 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/60 to-zinc-900" />
          </div>
        )}

        <div className="relative z-10 px-4 sm:px-6 md:px-10 py-6 max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBackToMovie}
            className="group inline-flex items-center gap-2 text-zinc-400 hover:text-white font-semibold mb-6 text-sm sm:text-base transition-colors"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Movie
          </button>

          {/* Movie Header Panel */}
          <div className="bg-zinc-800/65 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-5 sm:p-8 mb-8 shadow-xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex gap-4 sm:gap-6 items-center">
              {movie?.poster_url && (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-16 sm:w-20 rounded-lg object-cover shadow-lg border border-zinc-700"
                />
              )}
              <div>
                <span className="inline-block bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-semibold px-2 py-0.5 rounded mb-2">
                  All Showtimes
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {movie?.title || "Movie Showtimes"}
                </h1>
                <p className="text-sm text-gray-400 mt-1 flex flex-wrap gap-2 items-center">
                  <span>{movie?.genre}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                  <span>{movie?.language}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                  <span className="bg-zinc-700 text-zinc-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {movie?.censor_rating}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Date Select Strip */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
              Select Booking Date
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {dateList.map((d) => {
                const isActive = selectedDate === d.formatted;
                return (
                  <button
                    key={d.formatted}
                    onClick={() => setSelectedDate(d.formatted)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[76px] transition-all duration-300 border ${
                      isActive
                        ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/25 scale-105"
                        : "bg-zinc-800/60 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className="text-[10px] font-bold tracking-wider">{d.dayName}</span>
                    <span className="text-2xl font-extrabold my-1">{d.dayNum}</span>
                    <span className="text-[10px] font-bold tracking-wider">{d.monthName}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-zinc-500 text-xs mt-2 italic">
              Showing schedule for: {formatDateLabel(selectedDate)}
            </p>
          </div>

          {/* Filters, Search and Sorting Strip */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-zinc-800/40 border border-zinc-800 p-4 sm:p-5 rounded-2xl mb-8 backdrop-blur">
            <div className="flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-center flex-1 w-full">
              {/* Theater Search */}
              <div className="relative w-full md:flex-1 md:max-w-sm">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Search Theater</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-red-500 transition-colors text-white placeholder-zinc-500"
                  />
                  <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Format Filter */}
              <div className="w-full md:w-auto">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Format</label>
                <div className="flex md:inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
                  {["All", "2D", "3D", "IMAX"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFormat(f)}
                      className={`flex-1 md:flex-initial text-center px-2.5 md:px-3.5 py-2 md:py-1.5 text-[11px] md:text-xs font-bold rounded-lg transition-all duration-200 ${
                        selectedFormat === f
                          ? "bg-zinc-750 text-white shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Showtime Shift Filter */}
              <div className="w-full md:w-auto">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Time of Day</label>
                <div className="flex md:inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
                  {["All", "Morning", "Afternoon", "Evening", "Night"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTimeOfDay(t)}
                      className={`flex-1 md:flex-initial text-center px-2 md:px-3 py-2 md:py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all duration-200 ${
                        selectedTimeOfDay === t
                          ? "bg-zinc-750 text-white shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort Controls */}
            <div className="w-full xl:w-auto">
              <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Sort By</label>
              <div className="flex xl:inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 w-full xl:w-auto">
                <button
                  onClick={() => setSortBy("time")}
                  className={`flex-1 xl:flex-initial text-center px-4.5 py-2 xl:py-1.5 text-[11px] xl:text-xs font-bold rounded-lg transition-all duration-200 ${
                    sortBy === "time" ? "bg-zinc-750 text-white shadow" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Time
                </button>
                <button
                  onClick={() => setSortBy("price")}
                  className={`flex-1 xl:flex-initial text-center px-4.5 py-2 xl:py-1.5 text-[11px] xl:text-xs font-bold rounded-lg transition-all duration-200 ${
                    sortBy === "price" ? "bg-zinc-750 text-white shadow" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Price
                </button>
              </div>
            </div>
          </div>

          {/* Theaters List */}
          {showsError && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-200 p-4 rounded-xl mb-8 flex items-center gap-3">
              <svg className="w-6 h-6 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-sm">Failed to retrieve schedules</p>
                <p className="text-xs text-red-300/80 mt-0.5">{showsError.message}</p>
              </div>
            </div>
          )}

          {processedTheaters.length > 0 ? (
            <div className="space-y-8">
              {processedTheaters.map((theater) => (
                <div
                  key={theater.theater_id}
                  className="bg-zinc-800/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg backdrop-blur"
                >
                  {/* Theater Details Header */}
                  <div className="bg-zinc-800/80 p-5 sm:p-6 border-b border-zinc-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex gap-3 items-start">
                      <svg className="w-5 h-5 text-red-400 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {theater.theater_name}
                        </h2>
                        <p className="text-xs text-gray-400 mt-1">
                          {theater.address_line_1}
                          {theater.address_line_2 && `, ${theater.address_line_2}`}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/25 w-fit">
                      📍 {theater.city}
                    </span>
                  </div>

                  {/* Shows Grid */}
                  <div className="p-5 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {theater.shows.map((show) => {
                        const percentageFilled = Math.floor(40 + (show.show_id.charCodeAt(0) % 55));
                        const isFillingFast = percentageFilled > 80;

                        return (
                          <div
                            key={show.show_id}
                            className="bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-500/30 hover:shadow-xl transition-all duration-350 flex flex-col justify-between"
                          >
                            <div className="p-4 sm:p-5">
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700/50">
                                  {show.screen_name}
                                </span>
                                <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                                  {show.screen_type} • {show.format}
                                </span>
                              </div>

                              <div className="my-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="text-2xl font-black text-white tracking-tight">
                                  {formatTime(show.start_time.date)}
                                </h3>
                              </div>

                              {/* Simulated occupancy status */}
                              <div className="mt-3">
                                <div className="flex justify-between items-center text-[11px] mb-1">
                                  <span className="text-zinc-500">Seat Status</span>
                                  <span className={`font-bold ${isFillingFast ? "text-amber-400" : "text-green-400"}`}>
                                    {isFillingFast ? "Filling Fast" : "Available"}
                                  </span>
                                </div>
                                <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      isFillingFast ? "bg-amber-400" : "bg-green-400"
                                    }`}
                                    style={{ width: `${percentageFilled}%` }}
                                  />
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex justify-between text-[11px] text-zinc-400">
                                <span>Lang: {show.language}</span>
                                <span>
                                  {Math.round(
                                    (new Date(show.end_time.date) - new Date(show.start_time.date)) /
                                      (1000 * 60)
                                  )}{" "}
                                  mins
                                </span>
                              </div>
                            </div>

                            {/* CTA block */}
                            <div className="bg-zinc-950/40 p-4 sm:p-5 border-t border-zinc-900/60 flex items-center justify-between gap-4">
                              <span className="text-lg font-black text-green-400">
                                ₹{parseFloat(show.price).toFixed(2)}
                              </span>
                              <Link
                                to={`/show/${show.show_id}/seats`}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg text-xs transition shadow-md hover:shadow-red-500/20 text-center flex items-center gap-1 group/btn"
                              >
                                Select Seats
                                <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-800/35 border border-zinc-800 p-8 sm:p-12 rounded-2xl text-center max-w-lg mx-auto shadow-lg backdrop-blur mt-8">
              <div className="w-12 h-12 text-zinc-500 mx-auto mb-4">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">No Matching Theater Shows Found</h3>
              <p className="text-sm text-gray-400">
                Try searching for another theater or adjust format/time filters to see available showtimes.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default TheaterShowsPage;
