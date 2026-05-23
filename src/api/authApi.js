import api from "./axios";

export const registerUser = async (userData) => {
  const response = await api.post("/register", {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: "customer",
  });
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/login", {
    email: credentials.email,
    password: credentials.password,
  });
  // Token is set as HttpOnly cookie automatically
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/logout");
  return response.data;
};
