import { useQuery } from '@tanstack/react-query';
import { getMovieShows } from '../api/movieApi';

export const useShowsByMovie = (movieId, date = null) => {
  return useQuery({
    queryKey: ['shows', movieId, date],
    queryFn: async () => {
      const response = await getMovieShows(movieId, date);
      return response.data || [];
    },
    enabled: !!movieId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,   // 30 minutes
  });
};
