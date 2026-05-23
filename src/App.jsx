import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import HomePage from "./pages/HomePage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import TheaterSelectionPage from "./pages/TheaterSelectionPage";
import SelectedTheaterShowsPage from "./pages/SelectedTheaterShowsPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/movie/:movieId"
            element={<MovieDetailsPage />}
          />

          <Route
            path="/movie/:movieId/theaters"
            element={<TheaterSelectionPage />}
          />

          <Route
            path="/movie/:movieId/theater/:theaterId/shows"
            element={<SelectedTheaterShowsPage />}
          />

          <Route
            path="/show/:showId/seats"
            element={<SeatSelectionPage />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;