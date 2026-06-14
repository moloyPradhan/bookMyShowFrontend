import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useMovies } from "../utils/useMovies";
import { useShowsByMovie } from "../utils/useShowsByMovie";
import { useMemo, useState, useEffect } from "react";
import SkeletonLoader from "../components/SkeletonLoader";
import MainLayout from "../layouts/MainLayout";

function SelectedTheaterShowsPage() {
  const { movieId, theaterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialTheater = location.state?.theater;
  const initialDate = location.state?.selectedDate;

  // Local interactive filter state
  const [activeDate, setActiveDate] = useState(initialDate || "");
  const [selectedFormat, setSelectedFormat] = useState("All");
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState("All");
  const [sortBy, setSortBy] = useState("time");

  const { data: movies = [], isLoading: moviesLoading } = useMovies();
  const movie = movies.find((m) => m.id === movieId);

  // Set initial activeDate if empty
  useEffect(() => {
    if (!activeDate) {
      if (initialDate) {
        setActiveDate(initialDate);
      } else if (movie) {
        const releaseDate = movie.release_date?.date?.split(" ")[0];
        if (releaseDate) {
          setActiveDate(releaseDate);
        } else {
          setActiveDate(new Date().toISOString().split("T")[0]);
        }
      }
    }
  }, [movie, initialDate, activeDate]);

  const { data: showsData = [], isLoading: showsLoading, error: showsError } = useShowsByMovie(movieId, activeDate || null);

  // Extract / Find theater fallback to support refresh/direct navigation
  const theater = useMemo(() => {
    if (initialTheater) return initialTheater;
    const theaterData = showsData.find((t) => t.theater_id === theaterId);
    if (theaterData) {
      return {
        theater_id: theaterData.theater_id,
        theater_name: theaterData.theater_name,
        address_line_1: theaterData.address_line_1,
        address_line_2: theaterData.address_line_2,
        city: theaterData.city,
      };
    }
    return null;
  }, [initialTheater, showsData, theaterId]);

  // Filter shows for selected theater
  const theaterShows = useMemo(() => {
    const theaterData = showsData.find((t) => t.theater_id === theaterId);
    return theaterData?.shows || [];
  }, [showsData, theaterId]);

  // Generate 7-day date list starting from the original selected date / release date
  const dateList = useMemo(() => {
    const base = initialDate || (movie?.release_date?.date?.split(" ")[0]) || new Date().toISOString().split("T")[0];
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
  }, [initialDate, movie]);

  // Filter and sort shows
  const filteredShows = useMemo(() => {
    let result = [...theaterShows];

    // Filter by Format (2D, 3D, IMAX)
    if (selectedFormat !== "All") {
      result = result.filter((show) =>
        show.format?.toUpperCase().includes(selectedFormat.toUpperCase()) ||
        show.screen_type?.toUpperCase().includes(selectedFormat.toUpperCase())
      );
    }

    // Filter by Time of Day
    if (selectedTimeOfDay !== "All") {
      result = result.filter((show) => {
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
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === "time") {
      result.sort((a, b) => new Date(a.start_time.date) - new Date(b.start_time.date));
    }

    return result;
  }, [theaterShows, selectedFormat, selectedTimeOfDay, sortBy]);

  const handleBackToTheaters = () => {
    navigate(`/movie/${movieId}/theaters`);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <SkeletonLoader count={6} variant="card" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!theater) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 text-zinc-500 mb-4">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Theater Information Not Found</h2>
          <p className="text-gray-400 mb-6 max-w-sm">We couldn't retrieve details for this location. Let's go back and try selecting again.</p>
          <button
            onClick={handleBackToTheaters}
            className="px-6 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg transition-colors font-semibold"
          >
            Back to Theaters
          </button>
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
            onClick={handleBackToTheaters}
            className="group inline-flex items-center gap-2 text-zinc-400 hover:text-white font-semibold mb-6 text-sm sm:text-base transition-colors"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Theaters
          </button>

          {/* Movie & Theater Header Panel */}
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
                  Now Screening
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {movie?.title || "Movie Shows"}
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

            <div className="border-t md:border-t-0 md:border-l border-zinc-700/60 pt-4 md:pt-0 md:pl-8 flex-1 md:flex-initial">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h2 className="text-lg font-bold text-white leading-snug">
                    {theater.theater_name}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {theater.address_line_1}
                    {theater.address_line_2 && `, ${theater.address_line_2}`}
                  </p>
                  <p className="text-xs text-red-400 font-semibold mt-1">
                    {theater.city}
                  </p>
                </div>
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
                const isActive = activeDate === d.formatted;
                return (
                  <button
                    key={d.formatted}
                    onClick={() => setActiveDate(d.formatted)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[76px] transition-all duration-300 border ${isActive
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
              Showing schedule for: {formatDateLabel(activeDate)}
            </p>
          </div>

          {/* Filters and Sorting Strip */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-zinc-800/40 border border-zinc-800/80 p-4 sm:p-5 rounded-2xl mb-8 backdrop-blur">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full lg:w-auto">
              {/* Format Filter */}
              <div className="w-full sm:w-auto">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Format</label>
                <div className="flex sm:inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
                  {["All", "2D", "3D", "IMAX"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFormat(f)}
                      className={`flex-1 sm:flex-initial text-center px-2.5 sm:px-3.5 py-2 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all duration-200 ${selectedFormat === f
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
              <div className="w-full sm:w-auto">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Time of Day</label>
                <div className="flex sm:inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
                  {["All", "Morning", "Afternoon", "Evening", "Night"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTimeOfDay(t)}
                      className={`flex-1 sm:flex-initial text-center px-2 sm:px-3 py-2 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all duration-200 ${selectedTimeOfDay === t
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
            <div className="w-full lg:w-auto">
              <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Sort By</label>
              <div className="flex lg:inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 w-full lg:w-auto">
                <button
                  onClick={() => setSortBy("time")}
                  className={`flex-1 lg:flex-initial text-center px-4.5 py-2 lg:py-1.5 text-[11px] lg:text-xs font-bold rounded-lg transition-all duration-200 ${sortBy === "time" ? "bg-zinc-750 text-white shadow" : "text-zinc-400 hover:text-white"
                    }`}
                >
                  Time
                </button>
                <button
                  onClick={() => setSortBy("price")}
                  className={`flex-1 lg:flex-initial text-center px-4.5 py-2 lg:py-1.5 text-[11px] lg:text-xs font-bold rounded-lg transition-all duration-200 ${sortBy === "price" ? "bg-zinc-750 text-white shadow" : "text-zinc-400 hover:text-white"
                    }`}
                >
                  Price
                </button>
              </div>
            </div>
          </div>

          {/* Shows Grid Section */}
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

          {filteredShows.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredShows.map((show) => {
                // Random occupancy status to simulate live database
                const percentageFilled = Math.floor(40 + (show.show_id.charCodeAt(0) % 55));
                const isFillingFast = percentageFilled > 80;

                return (
                  <div
                    key={show.show_id}
                    className="relative group bg-zinc-850 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Card Top Block */}
                    <div className="p-5 sm:p-6 pb-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-bold text-gray-400 uppercase bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-700/60">
                          {show.screen_name}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded bg-zinc-700 text-zinc-100">
                          {show.screen_type} • {show.format}
                        </span>
                      </div>

                      {/* Main Showtime */}
                      <div className="my-4 flex items-center gap-3">
                        <svg className="w-6 h-6 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-3xl font-extrabold text-white tracking-tight">
                          {formatTime(show.start_time.date)}
                        </h3>
                      </div>

                      {/* Showtime progress / availability pill */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="text-zinc-500 font-semibold">Seat Availability</span>
                          <span className={`font-bold ${isFillingFast ? "text-amber-400" : "text-green-400"}`}>
                            {isFillingFast ? "🔥 Filling Fast" : "✓ Available"}
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isFillingFast ? "bg-amber-400" : "bg-green-400"
                              }`}
                            style={{ width: `${percentageFilled}%` }}
                          />
                        </div>
                      </div>

                      {/* Summary Specs */}
                      <div className="mt-5 border-t border-zinc-800/80 pt-4 flex justify-between text-xs text-zinc-400 font-medium">
                        <div>
                          <span className="block text-[10px] text-zinc-600 uppercase font-bold">Language</span>
                          <span className="text-zinc-300">{show.language}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-zinc-600 uppercase font-bold">Duration</span>
                          <span className="text-zinc-300">
                            {Math.round(
                              (new Date(show.end_time.date) - new Date(show.start_time.date)) /
                              (1000 * 60)
                            )}{" "}
                            mins
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Price / Booking Trigger Section */}
                    <div className="bg-zinc-900/60 p-5 sm:p-6 border-t border-zinc-850 flex items-center justify-between gap-4">
                      <div>
                        <span className="block text-[10px] text-zinc-500 font-bold uppercase">Price per seat</span>
                        <span className="text-2xl font-extrabold text-green-400 tracking-tight">
                          ₹{parseFloat(show.price).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/show/${show.show_id}/seats`)}
                        className="px-5 py-3 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-red-500/20 text-sm flex items-center gap-2 group/btn"
                      >
                        Select Seats
                        <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-zinc-800/35 border border-zinc-800 p-8 sm:p-12 rounded-2xl text-center max-w-lg mx-auto shadow-lg backdrop-blur mt-8">
              <div className="w-12 h-12 text-zinc-500 mx-auto mb-4">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">No Matching Shows Found</h3>
              <p className="text-sm text-gray-400">
                We couldn't find any shows meeting your filters for this date. Try shifting your filters or select a different date card above.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default SelectedTheaterShowsPage;
