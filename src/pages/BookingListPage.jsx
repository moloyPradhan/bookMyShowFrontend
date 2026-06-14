import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { fetchBookings } from "../api/bookingApi";
import SkeletonLoader from "../components/SkeletonLoader";
import MainLayout from "../layouts/MainLayout";
import authStore from "../store/authStore";

function BookingListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = authStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
    enabled: isAuthenticated,
  });

  const bookings = response?.data || [];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-white p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Bookings</h1>
              <p className="text-gray-400">View and manage all your movie bookings</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SkeletonLoader count={6} variant="card" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-white flex items-center justify-center p-4 h-full">
          <p className="text-lg sm:text-xl text-red-500">Error loading bookings: {error.message}</p>
        </div>
      </MainLayout>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-900 text-green-200";
      case "pending":
        return "bg-yellow-900 text-yellow-200";
      case "cancelled":
        return "bg-red-900 text-red-200";
      default:
        return "bg-gray-900 text-gray-200";
    }
  };

  return (
    <MainLayout>
      <div className="text-white p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Bookings</h1>
              <p className="text-gray-400">View and manage all your movie bookings</p>
            </div>
            {bookings.length > 0 && (
              <button
                onClick={() => navigate("/")}
                className="sm:hidden inline-flex items-center gap-2 bg-white text-zinc-900 hover:bg-gray-100 px-4 py-2 rounded-lg transition text-sm font-semibold w-fit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book a Movie
              </button>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No bookings found</p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 bg-white text-zinc-900 hover:bg-gray-100 px-6 py-3 rounded-lg transition font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book a Movie
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-zinc-800 rounded-lg overflow-hidden hover:shadow-lg transition hover:shadow-white/20 cursor-pointer group"
                  onClick={() => navigate(`/bookings/${booking.id}`)}
                >
                  <div className="relative h-40 bg-gradient-to-b from-blue-600 to-blue-800">
                    {booking.poster_url && (
                      <img
                        src={booking.poster_url}
                        alt={booking.movie_title}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-800 to-transparent" />
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      {booking.movie_title}
                    </h3>

                    <div className="space-y-2 text-sm text-gray-300 mb-4">
                      <p className="flex items-center">
                        <span className="text-gray-500 mr-2">🎫</span>
                        <span className="font-mono">{booking.booking_number}</span>
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-500 mr-2">🎬</span>
                        {booking.theater_name} - {booking.screen_name}
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-500 mr-2">📅</span>
                        {new Date(booking.start_time).toLocaleDateString()}
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-500 mr-2">🕐</span>
                        {new Date(booking.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                        <p className="text-xl font-bold text-white">
                          ₹{parseFloat(booking.total_amount).toFixed(2)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default BookingListPage;
