import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShowSeats } from "../utils/useShowSeats";
import SvgSeatingLayout from "../components/SvgSeatingLayout";

function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  const { data: seats = [], isLoading, error } = useShowSeats(showId);

  // Calculate total price (assuming ₹200 per seat, or use seat.price if available)
  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => {
      // Assume standard price if not available on seat object
      return sum + 200;
    }, 0);
  }, [selectedSeats]);

  const handleSeatSelect = (seat) => {
    setSelectedSeats([...selectedSeats, seat]);
  };

  const handleSeatDeselect = (seat) => {
    setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }

    // Format selected seat IDs
    const seatIds = selectedSeats.map((s) => s.id);
    const seatLabels = selectedSeats.map((s) => s.seat_label).sort().join(", ");

    // Here you would call the lock seats API
    console.log(`Booking seats: ${seatLabels}`, seatIds);
    
    alert(
      `Booking confirmed for seats: ${seatLabels}\nTotal: ₹${totalPrice}`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <p className="text-lg sm:text-xl">Loading seats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg sm:text-xl text-red-500 mb-4">
            Error loading seats: {error.message}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!seats || seats.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-4">
        <p className="text-lg sm:text-xl">No seats available for this show</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-red-500 hover:text-red-400 font-semibold mb-3 sm:mb-4 text-sm sm:text-base"
        >
          ← Back
        </button>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
          Select Seats
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Click on available seats to select them
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Seating Layout - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          {/* SVG Seating Layout */}
          <div className="bg-zinc-800 rounded-lg p-4 sm:p-6 overflow-x-auto">
            <SvgSeatingLayout
              seats={seats}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              onSeatDeselect={handleSeatDeselect}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded opacity-60"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 rounded opacity-60"></div>
              <span>Locked</span>
            </div>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-800 p-4 sm:p-6 rounded-lg sticky top-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Booking Summary
            </h2>

            {/* Selected Seats */}
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">
                Selected Seats ({selectedSeats.length}):
              </p>
              <div className="bg-zinc-900 p-3 rounded min-h-12 break-words">
                {selectedSeats.length > 0 ? (
                  <p className="text-xs sm:text-sm text-white">
                    {selectedSeats
                      .map((s) => s.seat_label)
                      .sort()
                      .join(", ")}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500">
                    No seats selected
                  </p>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            {selectedSeats.length > 0 && (
              <div className="space-y-3 mb-4 pb-4 border-b border-zinc-700">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">
                    {selectedSeats.length} Seat{selectedSeats.length > 1 ? "s" : ""}
                  </span>
                  <span>₹{selectedSeats.length * 200}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-400">Convenience Fee</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between text-lg sm:text-xl font-bold bg-zinc-700 p-3 rounded">
                  <span>Total:</span>
                  <span className="text-green-400">₹{totalPrice}</span>
                </div>
              </div>
            )}

            {/* Booking Button */}
            <button
              onClick={handleBooking}
              disabled={selectedSeats.length === 0}
              className={`
                w-full py-3 sm:py-4 rounded-lg font-bold text-sm sm:text-base transition
                ${
                  selectedSeats.length > 0
                    ? "bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              {selectedSeats.length > 0
                ? `Proceed to Pay (${selectedSeats.length} seat${
                    selectedSeats.length > 1 ? "s" : ""
                  })`
                : "Select Seats to Continue"}
            </button>

            {/* Info Text */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              Seats will be locked for 10 minutes after selection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatSelectionPage;