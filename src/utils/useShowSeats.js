import { useQuery } from '@tanstack/react-query';
import { getShowSeats } from '../api/movieApi';

export const useShowSeats = (showId) => {
  return useQuery({
    queryKey: ['seats', showId],
    queryFn: async () => {
      const response = await getShowSeats(showId);
      return response.data || [];
    },
    enabled: !!showId,
    staleTime: 1000 * 60 * 2, // 2 minutes (seats change frequently)
    gcTime: 1000 * 60 * 10,   // 10 minutes
  });
};
