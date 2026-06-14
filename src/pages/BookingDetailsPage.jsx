import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import SkeletonLoader from "../components/SkeletonLoader";
import { fetchBookingDetails, cancelBooking } from "../api/bookingApi";
import MainLayout from "../layouts/MainLayout";
import toastStore from "../store/toastStore";
import authStore from "../store/authStore";

function BookingDetailsPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const qrCanvasRef = useRef(null);
  const queryClient = useQueryClient();
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const { showToast, showConfirm } = toastStore();
  const { isAuthenticated } = authStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => fetchBookingDetails(bookingId),
    enabled: isAuthenticated,
  });

  const booking = response?.data || null;

  const handleCancelBooking = () => {
    showConfirm(
      "Are you sure you want to cancel this booking? This action cannot be undone.",
      async () => {
        setIsCancelling(true);
        setCancelError("");

        try {
          await cancelBooking(bookingId);
          showToast("Booking cancelled successfully.", "success");
          queryClient.invalidateQueries({ queryKey: ["bookings"] });
          queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
        } catch (err) {
          const errMsg = err.response?.data?.message || "Failed to cancel booking. Please try again.";
          setCancelError(errMsg);
          showToast(errMsg, "error");
        } finally {
          setIsCancelling(false);
        }
      }
    );
  };

  useEffect(() => {
    if (booking && qrCanvasRef.current) {
      const qrData = JSON.stringify({
        booking_id: booking.id,
        booking_number: booking.booking_number,
        movie: booking.movie_title,
        theater: booking.theater_name,
        screen: booking.screen_name,
        seats: booking.seats.map((s) => s.seat_label).join(", "),
        start_time: booking.start_time,
      });

      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 256,
        errorCorrectionLevel: "H",
        margin: 1,
      });
    }
  }, [booking]);

  const handleDownloadQR = () => {
    if (!qrCanvasRef.current || !booking) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const width = 400;
    const height = 580;
    canvas.width = width;
    canvas.height = height;

    // Background - transparent canvas with centered rounded ticket stub
    ctx.clearRect(0, 0, width, height);

    const cardX = 15;
    const cardY = 15;
    const cardWidth = width - 30;
    const cardHeight = height - 30;
    const radius = 16;
    const cutoutY = 160;
    const cutoutRadius = 14;

    ctx.beginPath();
    ctx.moveTo(cardX + radius, cardY);
    ctx.lineTo(cardX + cardWidth - radius, cardY);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius);
    ctx.lineTo(cardX + cardWidth, cutoutY - cutoutRadius);
    ctx.arc(cardX + cardWidth, cutoutY, cutoutRadius, -Math.PI / 2, Math.PI / 2, true);
    ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
    ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight);
    ctx.lineTo(cardX + radius, cardY + cardHeight);
    ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius);
    ctx.lineTo(cardX, cutoutY + cutoutRadius);
    ctx.arc(cardX, cutoutY, cutoutRadius, Math.PI / 2, -Math.PI / 2, true);
    ctx.lineTo(cardX, cardY + radius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
    ctx.closePath();

    ctx.fillStyle = "#18181b"; // zinc-900 (ticket body)
    ctx.fill();

    ctx.strokeStyle = "#3f3f46"; // zinc-700 (border)
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text details formatting
    const dateStr = new Date(booking.start_time).toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeStr = new Date(booking.start_time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // 1. Digital Ticket Label
    ctx.fillStyle = "#ef4444"; // red-500
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("DIGITAL TICKET", width / 2, 48);

    // 2. Movie Title
    const movieTitle = booking.movie_title;
    ctx.font = movieTitle.length > 20 ? "bold 16px sans-serif" : "bold 20px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(movieTitle, width / 2, 78);

    // 3. Theater Name
    ctx.fillStyle = "#a1a1aa"; // zinc-400
    ctx.font = "13px sans-serif";
    ctx.fillText(booking.theater_name, width / 2, 104);

    // 4. Screen, Date & Time details
    ctx.fillStyle = "#d4d4d8"; // zinc-300
    ctx.font = "12px sans-serif";
    ctx.fillText(`${booking.screen_name}  •  ${dateStr}  •  ${timeStr}`, width / 2, 126);

    // 5. Dashed divider
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(cardX + 20, cutoutY);
    ctx.lineTo(cardX + cardWidth - 20, cutoutY);
    ctx.stroke();
    ctx.setLineDash([]); // reset line dash

    // 6. QR Code Wrapper & Canvas Draw
    const qrBoxSize = 170;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = 185;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 12);
    } else {
      ctx.rect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
    }
    ctx.fill();

    ctx.drawImage(qrCanvasRef.current, qrBoxX + 6, qrBoxY + 6, qrBoxSize - 12, qrBoxSize - 12);

    // 7. Dashed divider 2
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(cardX + 20, 385);
    ctx.lineTo(cardX + cardWidth - 20, 385);
    ctx.stroke();
    ctx.setLineDash([]);

    // 8. Booking Number
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "10px sans-serif";
    ctx.fillText("BOOKING NUMBER", width / 2, 420);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px monospace";
    ctx.fillText(booking.booking_number, width / 2, 442);

    // 9. Seats
    const seatLabels = booking.seats.map((s) => s.seat_label).join(", ");
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(`SEATS: ${seatLabels}`, width / 2, 485);

    // 10. Status
    const statusText = `STATUS: ${booking.status.toUpperCase()}`;
    ctx.font = "bold 12px sans-serif";
    ctx.fillStyle = booking.status === "confirmed" ? "#4ade80" : booking.status === "pending" ? "#fbbf24" : "#f87171";
    ctx.fillText(statusText, width / 2, 515);

    // 11. Footer note
    ctx.fillStyle = "#52525b";
    ctx.font = "10px sans-serif";
    ctx.fillText("Please present this QR code at the theater entrance.", width / 2, 550);

    // Download action
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${booking.booking_number}_ticket.png`;
    link.click();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-white p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="h-8 bg-zinc-700 rounded w-1/3 animate-pulse" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Movie Poster Skeleton */}
                <div className="bg-zinc-800 rounded-lg overflow-hidden">
                  <div className="h-40 sm:h-48 bg-zinc-700 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-zinc-700 rounded w-2/3 animate-pulse" />
                    <div className="h-4 bg-zinc-700 rounded w-full animate-pulse" />
                    <div className="h-4 bg-zinc-700 rounded w-5/6 animate-pulse" />
                  </div>
                </div>

                {/* Show Details Skeleton */}
                <div className="bg-zinc-800 rounded-lg p-6">
                  <div className="h-6 bg-zinc-700 rounded w-1/4 mb-4 animate-pulse" />
                  <div className="space-y-4">
                    <SkeletonLoader count={4} variant="text" />
                  </div>
                </div>

                {/* Theater Address Skeleton */}
                <div className="bg-zinc-800 rounded-lg p-6">
                  <div className="h-6 bg-zinc-700 rounded w-1/3 mb-4 animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-4 bg-zinc-700 rounded w-full animate-pulse" />
                    <div className="h-4 bg-zinc-700 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-zinc-700 rounded w-1/2 animate-pulse" />
                  </div>
                </div>

                {/* Seats Skeleton */}
                <div className="bg-zinc-800 rounded-lg p-6">
                  <div className="h-6 bg-zinc-700 rounded w-1/4 mb-4 animate-pulse" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-20 bg-zinc-700 rounded animate-pulse" />
                    ))}
                  </div>
                </div>

                {/* Billing Skeleton */}
                <div className="bg-zinc-800 rounded-lg p-6">
                  <div className="h-6 bg-zinc-700 rounded w-1/4 mb-4 animate-pulse" />
                  <div className="space-y-3">
                    <SkeletonLoader count={3} variant="text" />
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-zinc-800 rounded-lg p-6 sticky top-6">
                  <div className="h-6 bg-zinc-700 rounded w-1/2 mb-4 animate-pulse" />
                  <div className="h-4 bg-zinc-700 rounded w-full mb-4 animate-pulse" />
                  <div className="h-64 bg-zinc-700 rounded mb-4 animate-pulse" />
                  <div className="space-y-3">
                    <SkeletonLoader count={2} variant="text" />
                  </div>
                </div>
              </div>
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
          <div className="text-center">
            <p className="text-lg sm:text-xl text-red-500 mb-4">
              Error loading booking details: {error.message}
            </p>
            <button
              onClick={() => navigate("/bookings")}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
            >
              Back to Bookings
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!booking) {
    return (
      <MainLayout>
        <div className="text-white flex items-center justify-center p-4 h-full">
          <div className="text-center">
            <p className="text-lg sm:text-xl mb-4">Booking not found</p>
            <button
              onClick={() => navigate("/bookings")}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
            >
              Back to Bookings
            </button>
          </div>
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

  // Generate QR code data - include available seats information (removed - handled in useEffect now)

  return (
    <MainLayout>
      <div className="text-white p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/bookings")}
              className="text-red-500 hover:text-red-400 active:text-red-600 font-semibold mb-4 text-sm sm:text-base transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold">Booking Details</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Movie Poster and Status */}
            <div className="bg-zinc-800 rounded-lg overflow-hidden">
              <div className="relative h-40 sm:h-48 bg-gradient-to-b from-blue-600 to-blue-800">
                {booking.poster_url && (
                  <img
                    src={booking.poster_url}
                    alt={booking.movie_title}
                    className="w-full h-full object-cover opacity-70"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-800 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold uppercase ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {booking.movie_title}
                </h2>
                <p className="text-gray-300 mb-4">{booking.description}</p>
              </div>
            </div>

            {/* Movie Details */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Show Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Theater</p>
                  <p className="text-lg font-semibold">{booking.theater_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Screen</p>
                  <p className="text-lg font-semibold">{booking.screen_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Date & Time</p>
                  <p className="text-lg font-semibold">
                    {new Date(booking.start_time).toLocaleDateString([], {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(booking.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(booking.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Duration</p>
                  <p className="text-lg font-semibold">
                    {booking.duration_minutes} mins
                  </p>
                </div>
              </div>
            </div>

            {/* Theater Address */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Theater Address</h3>
              <p className="text-gray-300 mb-1">{booking.address_line_1}</p>
              <p className="text-gray-300 mb-3">{booking.address_line_2}</p>
              <p className="text-sm text-gray-500">
                Postal Code: {booking.postal_code}
              </p>
            </div>

            {/* Seats Information */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Booked Seats</h3>
              <div className="space-y-3">
                {booking.seats.length === 0 ? (
                  <p className="text-gray-400">No seats booked</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {booking.seats.map((seat, index) => (
                        <div
                          key={index}
                          className="bg-red-600 text-white p-3 rounded-lg text-center font-bold"
                        >
                          <p className="text-sm text-red-100">Seat</p>
                          <p className="text-lg">{seat.seat_label}</p>
                          <p className="text-xs text-red-100 mt-1">
                            ₹{parseFloat(seat.price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-zinc-700 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">
                          Available Seats ({booking.seats.length})
                        </span>
                        <span className="font-mono text-white">
                          {booking.seats.map((s) => s.seat_label).join(", ")}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Billing */}
            <div className="bg-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Billing Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>₹{parseFloat(booking.total_amount).toFixed(2)}</span>
                </div>
                <div className="border-t border-zinc-700 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-red-500">
                      ₹{parseFloat(booking.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - QR Code */}
          <div className="lg:col-span-1">
            <div className="relative bg-zinc-850/80 backdrop-blur-md border border-zinc-700/50 rounded-2xl p-6 shadow-2xl sticky top-6 overflow-visible">
              
              {/* Ticket header styling */}
              <div className="text-center mb-6">
                <span className="inline-block bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                  Digital Ticket
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">
                  {booking.movie_title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                  {booking.theater_name}
                </p>
              </div>

              {/* QR Code Canvas Card wrapper */}
              <div className="bg-white p-4 rounded-xl shadow-lg flex justify-center mb-6 mx-auto max-w-[200px]">
                <canvas ref={qrCanvasRef} className="w-full h-full max-w-[170px] max-h-[170px]" />
              </div>

              {/* Ticket stub puncture separator */}
              <div className="relative my-6">
                <div className="border-t border-dashed border-zinc-700/80"></div>
                <div className="absolute -left-[37px] -top-3 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700/50"></div>
                <div className="absolute -right-[37px] -top-3 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700/50"></div>
              </div>

              {/* Booking Number */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 mb-4 text-center">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Booking Number</p>
                <p className="text-lg font-mono font-bold text-white tracking-widest">
                  {booking.booking_number}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleDownloadQR}
                className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white py-3.5 px-4 rounded-xl transition-all duration-200 font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/25 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Ticket
              </button>

              {booking.status !== "cancelled" && (
                <button
                  onClick={handleCancelBooking}
                  disabled={isCancelling}
                  className={`w-full py-3 px-4 rounded-xl border border-zinc-700 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-3
                    ${isCancelling 
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                      : "bg-transparent text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 active:scale-[0.98]"
                    }`}
                >
                  {isCancelling ? (
                    <span>Cancelling...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Cancel Booking</span>
                    </>
                  )}
                </button>
              )}

              {cancelError && (
                <p className="text-xs text-red-400 mt-2 text-center">{cancelError}</p>
              )}

              <p className="text-[10px] text-zinc-500 mt-4 text-center leading-normal">
                Show this ticket and QR code at the screen entry check-in.
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}

export default BookingDetailsPage;
