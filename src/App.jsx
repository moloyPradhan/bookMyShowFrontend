import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import HomePage from "./pages/HomePage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import TheaterShowsPage from "./pages/TheaterShowsPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";

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
            path="/movie/:movieId/shows"
            element={<TheaterShowsPage />}
          />

          <Route
            path="/show/:showId/seats"
            element={<SeatSelectionPage />}
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;