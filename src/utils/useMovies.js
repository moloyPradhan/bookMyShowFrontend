import { useQuery } from '@tanstack/react-query';
import { getMovies } from '../api/movieApi';

export const useMovies = () => {
  return useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const response = await getMovies();
      return response.data.items || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,   // 30 minutes
  });
};
