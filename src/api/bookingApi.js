import api from "./axios";

export const lockSeats = async (payload) => {

  const response = await api.post(
    "/booking/lock",
    payload
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