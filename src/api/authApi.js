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
  return response.data;
};
