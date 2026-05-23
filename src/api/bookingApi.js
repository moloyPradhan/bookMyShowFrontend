import api from "./axios";

export const lockSeats = async (showId, seatIds) => {
  const response = await api.post(
    `/shows/${showId}/lock-seats`,
    { seat_ids: seatIds }
  );
  return response.data;
};

export const unlockSeats = async (payload) => {
  const response = await api.post(
    "/booking/unlock",
    payload
  );
  return response.data;
};

export const createBooking = async (showId, seatIds) => {
  const response = await api.post(
    `/shows/${showId}/create-booking`,
    { seat_ids: seatIds }
  );
  return response.data;
};

export const completeBooking = async (bookingId, seatIds) => {
  const response = await api.post(
    `/bookings/${bookingId}/complete`,
    { seat_ids: seatIds }
  );
  return response.data;
};