import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShowSeats } from "../utils/useShowSeats";
import SkeletonLoader from "../components/SkeletonLoader";
import SvgSeatingLayout from "../components/SvgSeatingLayout";
import authStore from "../store/authStore";
import { lockSeats, createBooking, completeBooking } from "../api/bookingApi";
import MainLayout from "../layouts/MainLayout";

import { socket } from "../socket";

function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLocking, setIsLocking] = useState(false);
  const [lockError, setLockError] = useState("");
  const { isAuthenticated } = authStore();

  // const { data: seats = [], isLoading, error } = useShowSeats(showId);

  const { data: fetchedSeats = [], isLoading, error } = useShowSeats(showId);
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    setSeats(fetchedSeats);
  }, [fetchedSeats]);

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
            }
            : seat
        )
      );

      if (data.status === "locked") {
        setSelectedSeats((currentSelected) =>
          currentSelected.filter(
            (seat) => !data.seat_ids.includes(seat.id)
          )
        );
      }
    };

    socket.on("seat-update", handleSeatUpdate);

    return () => {
      socket.off("seat-update", handleSeatUpdate);
    };
  }, [showId]);

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
      navigate("/login");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
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

          alert("Booking confirmed! Payment successful.");
          navigate("/bookings");

        } catch (err) {
          alert(
            "Booking confirmation failed: " +
            (err.response?.data?.message || err.message)
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
              className="text-red-400 hover:text-red-300 active:text-red-500 font-semibold mb-3 text-sm sm:text-base transition-colors"
            >
              &lt;- Back
            </button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
              Select Seats
            </h1>
            <p className="text-sm text-gray-400">
              Choose available seats from the map and review your total before
              payment.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-gray-300">
            <span className="h-2.5 w-2.5 rounded-full bg-green-400"></span>
            Rs. 200 per seat
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5 sm:gap-6 md:gap-8">
          <section className="min-w-0">
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-zinc-700 pb-4">
                <div>
                  <p className="text-sm font-semibold">Seat Map</p>
                  <p className="text-xs text-gray-500">Screen is at the top</p>
                </div>
                <span className="rounded-md bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-gray-300">
                  {selectedSeats.length} selected
                </span>
              </div>

              <SvgSeatingLayout
                seats={seats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                onSeatDeselect={handleSeatDeselect}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 sm:mt-5">
              {[
                ["Available", "bg-green-500"],
                ["Selected", "bg-blue-500"],
                ["Booked", "bg-red-500 opacity-60"],
                ["Locked", "bg-amber-500 opacity-60"],
              ].map(([label, colorClass]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs sm:text-sm text-gray-300"
                >
                  <span className={`h-4 w-4 rounded ${colorClass}`}></span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>

          <aside>
            <div className="bg-zinc-800 border border-zinc-700 p-4 sm:p-6 rounded-lg sticky top-4 shadow-xl">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Checkout
                </p>
                <h2 className="text-lg sm:text-xl font-bold">
                  Booking Summary
                </h2>
              </div>

              {!isAuthenticated && (
                <div className="bg-yellow-500/10 border border-yellow-500/60 text-yellow-200 p-3 rounded-lg mb-4 text-xs sm:text-sm">
                  Please log in to continue booking
                </div>
              )}

              {lockError && (
                <div className="bg-red-500/10 border border-red-500/60 text-red-200 p-3 rounded-lg mb-4 text-xs sm:text-sm">
                  {lockError}
                </div>
              )}

              <div className="mb-4">
                <p className="text-xs sm:text-sm text-gray-400 mb-2 flex items-center justify-between">
                  <span>Selected Seats</span>
                  <span>{selectedSeats.length}</span>
                </p>
                <div className="bg-zinc-900 border border-zinc-700 p-3 rounded-lg min-h-16 break-words">
                  {selectedSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {sortedSeatLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-md bg-blue-500 px-2 py-1 text-xs font-semibold text-white"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">
                      No seats selected
                    </p>
                  )}
                </div>
              </div>

              {selectedSeats.length > 0 && (
                <div className="space-y-3 mb-4 pb-4 border-b border-zinc-700">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-400">{seatCountLabel}</span>
                    <span>Rs. {selectedSeats.length * 200}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-400">Convenience Fee</span>
                    <span>Rs. 0</span>
                  </div>
                  <div className="flex justify-between text-lg sm:text-xl font-bold bg-zinc-900 border border-zinc-700 p-3 rounded-lg">
                    <span>Total:</span>
                    <span className="text-green-400">Rs. {totalPrice}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={selectedSeats.length === 0 || isLocking}
                className={`
                  w-full py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base transition
                  ${selectedSeats.length > 0 && !isLocking
                    ? "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white cursor-pointer shadow-lg shadow-red-950/30"
                    : "bg-zinc-700 text-gray-400 cursor-not-allowed"
                  }
                `}
              >
                {isLocking
                  ? "Processing..."
                  : selectedSeats.length > 0
                    ? `Proceed to Pay (${seatCountLabel})`
                    : "Select Seats to Continue"}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
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
