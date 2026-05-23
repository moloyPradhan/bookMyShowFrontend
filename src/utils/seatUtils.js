// Organize seats by rows and columns
export const organizeSeatsByRows = (seats) => {
  if (!seats || !Array.isArray(seats)) return {};

  const seatsByRow = {};

  seats.forEach((seat) => {
    const row = seat.seat_row;
    if (!seatsByRow[row]) {
      seatsByRow[row] = [];
    }
    seatsByRow[row].push(seat);
  });

  // Sort seats in each row by seat_number numerically
  Object.keys(seatsByRow).forEach((row) => {
    seatsByRow[row].sort((a, b) => parseInt(a.seat_number) - parseInt(b.seat_number));
  });

  return seatsByRow;
};

// Get seat status color
export const getSeatStatusColor = (status) => {
  switch (status) {
    case 'available':
      return '#10b981'; // green-500
    case 'booked':
      return '#ef4444'; // red-500
    case 'locked':
      return '#f59e0b'; // amber-500
    default:
      return '#6b7280'; // gray-500
  }
};

// Get seat status text
export const getSeatStatusText = (status) => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'booked':
      return 'Booked';
    case 'locked':
      return 'Locked';
    default:
      return 'Unknown';
  }
};

// Calculate optimal responsive dimensions
export const getResponsiveDimensions = (screenWidth) => {
  if (screenWidth < 640) {
    // Mobile
    return {
      seatSize: 24,
      seatGap: 6,
      rowGap: 8,
      padding: 16,
      fontSize: 10,
    };
  } else if (screenWidth < 1024) {
    // Tablet
    return {
      seatSize: 32,
      seatGap: 8,
      rowGap: 10,
      padding: 24,
      fontSize: 12,
    };
  } else {
    // Desktop
    return {
      seatSize: 40,
      seatGap: 10,
      rowGap: 12,
      padding: 32,
      fontSize: 14,
    };
  }
};
