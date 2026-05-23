import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    timeout: 10000,
    withCredentials: true,

    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Log response headers to debug CORS/cookie issues
api.interceptors.response.use(
    (response) => {
        console.log("Response headers:", response.headers);
        console.log("Set-Cookie present:", response.headers['set-cookie']);
        return response;
    },
    (error) => {
        console.error("Response error:", error.response?.headers);
        return Promise.reject(error);
    }
);

export default api;