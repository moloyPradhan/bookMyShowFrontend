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

export const completeBooking = async (data) => {
  const response = await api.post(
    `/bookings/complete`,
    data
  );
  return response.data;
};

export const fetchBookings = async () => {
  const response = await api.get("/bookings");
  return response.data;
};

export const fetchBookingDetails = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`);
  return response.data;
};

export const cancelBooking = async (bookingId) => {
  const response = await api.post(`/bookings/${bookingId}/cancel`);
  return response.data;
};