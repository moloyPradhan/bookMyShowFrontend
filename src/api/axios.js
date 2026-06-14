import axios from "axios";
import authStore from "../store/authStore";

// const baseURL = "https://bookmyshowclone.infinityfreeapp.com/api/";
const baseURL = "http://localhost:8080/api/";

const api = axios.create({
    // baseURL: "https://bookmyshowclone.infinityfreeapp.com/api",
    baseURL,
    timeout: 10000,
    withCredentials: true,

    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

const refreshApi = axios.create({
    baseURL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

let refreshPromise = null;

const shouldSkipRefresh = (url = "") => {
    const authEndpoints = ["/login", "/register", "/logout", "/refresh"];
    return authEndpoints.some((endpoint) => url.includes(endpoint));
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            shouldSkipRefresh(originalRequest.url)
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            refreshPromise = refreshPromise || refreshApi.post("/refresh");
            await refreshPromise;
            refreshPromise = null;

            return api(originalRequest);
        } catch (refreshError) {
            refreshPromise = null;
            authStore.getState().logout();
            return Promise.reject(refreshError);
        }
    }
);

export default api;
