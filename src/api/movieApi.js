import api from "./axios";

export const getMovies = async () => {
    const response = await api.get("/movies");
    return response.data;
};

export const getMovieShows = async (movieId, date = null) => {
    const params = {};
    if (date) {
        params.date = date;
    }
    
    const response = await api.get(
        `/movies/${movieId}/shows`,
        { params }
    );

    return response.data;
};

export const getShowSeats = async (showId) => {
    const response = await api.get(
        `/shows/${showId}/seats`
    );

    return response.data;
};