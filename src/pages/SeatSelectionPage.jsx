import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useShowSeats } from "../utils/useShowSeats";
import SkeletonLoader from "../components/SkeletonLoader";
import SvgSeatingLayout from "../components/SvgSeatingLayout";
import authStore from "../store/authStore";
import { lockSeats, createBooking, completeBooking } from "../api/bookingApi";
import MainLayout from "../layouts/MainLayout";
import toastStore from "../store/toastStore";

import { socket } from "../socket";

function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLocking, setIsLocking] = useState(false);
  const [lockError, setLockError] = useState("");
  const { isAuthenticated, user } = authStore();
  const { showToast } = toastStore();

  // const { data: seats = [], isLoading, error } = useShowSeats(showId);

  const { data: fetchedSeats = [], isLoading, error } = useShowSeats(showId);
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    if (fetchedSeats && fetchedSeats.length > 0 && user) {
      const myLockedSeats = fetchedSeats.filter(
        (seat) =>
          seat.status === "locked" &&
          (seat.locked_by === user.id || seat.locked_by === user._id)
      );
      if (myLockedSeats.length > 0) {
        setSelectedSeats((current) => {
          const merged = [...current];
          myLockedSeats.forEach((seat) => {
            if (!merged.some((s) => s.id === seat.id)) {
              merged.push(seat);
            }
          });
          return merged;
        });
      }
    }
    setSeats(fetchedSeats);
  }, [fetchedSeats, user]);

  useEffect(() => {
    if (!showId) return;

    socket.connect();

    socket.emit("join-show", showId);

    console.log(`Joined room show-${showId}`);

    const handleSeatUpdate = (data) => {
      console.log("Seat update received:", data);

      setSeats((currentSeats) =>
        currentSeats.map((seat) =>
          data.seat_ids.includes(seat.id)
            ? {
              ...seat,
              status: data.status,
              locked_by: data.status === "locked" ? data.locked_by : seat.locked_by,
            }
            : seat
        )
      );

      if (data.status === "locked") {
        const isLockedByMe = user && (data.locked_by === user.id || data.locked_by === user._id);
        if (!isLockedByMe) {
          setSelectedSeats((currentSelected) =>
            currentSelected.filter(
              (seat) => !data.seat_ids.includes(seat.id)
            )
          );
        }
      }
    };

    socket.on("seat-update", handleSeatUpdate);

    return () => {
      socket.off("seat-update", handleSeatUpdate);
    };
  }, [showId, user]);

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum) => sum + 200, 0);
  }, [selectedSeats]);

  const sortedSeatLabels = useMemo(
    () => selectedSeats.map((seat) => seat.seat_label).sort(),
    [selectedSeats]
  );

  const seatCountLabel = `${selectedSeats.length} seat${selectedSeats.length === 1 ? "" : "s"
    }`;

  const handleSeatSelect = (seat) => {
    setSelectedSeats((currentSeats) => {
      if (currentSeats.some((currentSeat) => currentSeat.id === seat.id)) {
        return currentSeats;
      }
      return [...currentSeats, seat];
    });
  };

  const handleSeatDeselect = (seat) => {
    setSelectedSeats((currentSeats) =>
      currentSeats.filter((currentSeat) => currentSeat.id !== seat.id)
    );
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (selectedSeats.length === 0) {
      showToast("Please select at least one seat", "warning");
      return;
    }

    setIsLocking(true);
    setLockError("");

    try {
      const seatIds = selectedSeats.map((seat) => seat.id);
      const lockResponse = await lockSeats(showId, seatIds);
      console.log("Seats locked:", lockResponse);

      const bookingResponse = await createBooking(showId, seatIds);

      const bookingData = bookingResponse?.data;


      console.log("Booking created:", bookingData);


      initiateRazorpayPayment(bookingData, seatIds);
    } catch (err) {
      setLockError(
        err.response?.data?.message || "Failed to lock seats. Please try again."
      );
      setIsLocking(false);
    }
  };

  const initiateRazorpayPayment = (bookingResponse, seatIds) => {
    const options = {
      key: bookingResponse?.key || null,
      amount: bookingResponse?.amount || null,
      currency: bookingResponse?.currency || null,
      order_id: bookingResponse?.order_id || null,
      name: "BMS",
      description: `Booking for ${seatCountLabel}`,
      handler: async (response) => {
        try {
          await completeBooking({
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });

          showToast("Booking confirmed! Payment successful.", "success");
          navigate("/bookings");

        } catch (err) {
          showToast(
            "Booking confirmation failed: " +
            (err.response?.data?.message || err.message),
            "error"
          );
          navigate("/");
        }
      },
      theme: {
        color: "#ef4444",
      },
      prefill: {
        name: bookingResponse?.user?.name || 'Customer',
        email: bookingResponse?.user?.email || '',
        contact: bookingResponse?.user?.mobile || '',
      },
      modal: {
        ondismiss: () => {
          console.log("Payment popup closed");
          setIsLocking(false);
          showToast("Payment cancelled. You can try paying again.", "warning");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="text-white p-4 sm:p-6 md:p-10">
          <div className="mb-6 sm:mb-8">
            <div className="h-8 bg-zinc-700 rounded w-20 mb-4 animate-pulse" />
            <div className="h-8 bg-zinc-700 rounded w-1/3 mb-2 animate-pulse" />
            <div className="h-4 bg-zinc-700 rounded w-1/2 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 sm:gap-6 md:gap-8">
            <div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 sm:p-6 overflow-x-auto">
                <div className="space-y-4">
                  <SkeletonLoader count={3} variant="grid" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 sm:mt-5">
                <div className="h-10 bg-zinc-800 border border-zinc-700 rounded-lg animate-pulse" />
                <div className="h-10 bg-zinc-800 border border-zinc-700 rounded-lg animate-pulse" />
                <div className="h-10 bg-zinc-800 border border-zinc-700 rounded-lg animate-pulse" />
                <div className="h-10 bg-zinc-800 border border-zinc-700 rounded-lg animate-pulse" />
              </div>
            </div>

            <div className="bg-zinc-800 border border-zinc-700 p-4 sm:p-6 rounded-lg">
              <div className="h-6 bg-zinc-700 rounded w-1/2 mb-4 animate-pulse" />
              <div className="space-y-3">
                <SkeletonLoader count={4} variant="text" />
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
        <div className="min-h-full text-white flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="w-full max-w-md text-center bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <p className="text-lg sm:text-xl text-red-400 mb-4">
              Error loading seats: {error.message}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!seats || seats.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-full text-white flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="w-full max-w-md text-center bg-zinc-800 border border-zinc-700 rounded-lg p-6">
            <p className="text-lg sm:text-xl font-semibold mb-2">
              No seats available
            </p>
            <p className="text-sm text-gray-400 mb-4">
              This show does not have seats to book right now.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="bg-white text-zinc-900 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="text-white p-4 sm:p-6 md:p-10">
        <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/40 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 shadow-md cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 mt-3">
              Select Seats
            </h1>
            <p className="text-sm text-gray-400">
              Choose available seats from the map and review your total before
              payment.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Rs. 200 per seat
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 sm:gap-6 md:gap-8">
          <section className="min-w-0">
            <div className="bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                <div>
                  <p className="text-sm font-bold text-zinc-100">Seat Map</p>
                  <p className="text-xs text-zinc-500">Screen is at the top</p>
                </div>
                <span className="rounded-lg bg-zinc-800 border border-zinc-700/50 px-3 py-1 text-xs font-bold text-zinc-300">
                  {selectedSeats.length} selected
                </span>
              </div>

              <SvgSeatingLayout
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                onSeatDeselect={handleSeatDeselect}
                user={user}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 sm:mt-5">
              {[
                ["Available", "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"],
                ["Selected", "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"],
                ["Booked", "bg-red-500 opacity-60"],
                ["Locked", "bg-amber-500 opacity-60"],
              ].map(([label, colorClass]) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-300 backdrop-blur-sm"
                >
                  <span className={`h-4 w-4 rounded ${colorClass}`}></span>
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </section>

          <aside>
            <div className="bg-zinc-900/80 backdrop-blur-lg border border-zinc-800/80 p-6 sm:p-8 rounded-2xl sticky top-6 shadow-2xl">
              <div className="mb-6">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                  Checkout
                </p>
                <h2 className="text-lg sm:text-xl font-extrabold text-zinc-100">
                  Booking Summary
                </h2>
              </div>

              {!isAuthenticated && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3.5 rounded-xl mb-4 text-xs sm:text-sm font-medium">
                  Please log in to continue booking
                </div>
              )}

              {lockError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3.5 rounded-xl mb-4 text-xs sm:text-sm font-medium">
                  {lockError}
                </div>
              )}

              <div className="mb-5">
                <p className="text-xs sm:text-sm text-zinc-400 mb-2 flex items-center justify-between font-medium">
                  <span>Selected Seats</span>
                  <span className="font-bold text-zinc-200">{selectedSeats.length}</span>
                </p>
                <div className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl min-h-16 break-words shadow-inner">
                  {selectedSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {sortedSeatLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-lg bg-blue-500/10 border border-blue-500/25 px-2.5 py-1 text-xs font-bold text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.05)]"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-zinc-600">
                      No seats selected
                    </p>
                  )}
                </div>
              </div>

              {selectedSeats.length > 0 && (
                <div className="space-y-3.5 mb-5 pb-5 border-b border-zinc-800">
                  <div className="flex justify-between text-xs sm:text-sm text-zinc-400 font-medium">
                    <span>{seatCountLabel}</span>
                    <span>Rs. {selectedSeats.length * 200}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-zinc-400 font-medium">
                    <span>Convenience Fee</span>
                    <span>Rs. 0</span>
                  </div>
                  <div className="flex justify-between text-lg sm:text-xl font-extrabold bg-zinc-950/60 border border-zinc-850 p-4 rounded-xl shadow-inner">
                    <span className="text-zinc-200">Total:</span>
                    <span className="text-green-400">Rs. {totalPrice}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={selectedSeats.length === 0 || isLocking}
                className={`
                  w-full py-3.5 sm:py-4 rounded-xl font-extrabold text-sm sm:text-base transition-all duration-200 active:scale-[0.98]
                  ${selectedSeats.length > 0 && !isLocking
                    ? "bg-red-500 hover:bg-red-655 text-white cursor-pointer shadow-lg shadow-red-950/40 hover:shadow-red-500/20"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/30"
                  }
                `}
              >
                {isLocking
                  ? "Processing..."
                  : selectedSeats.length > 0
                    ? `Proceed to Pay (${seatCountLabel})`
                    : "Select Seats to Continue"}
              </button>

              <p className="text-[10px] text-zinc-500 mt-4.5 text-center leading-relaxed">
                Seats will be locked for 10 minutes after selection
              </p>
            </div>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}

export default SeatSelectionPage;
