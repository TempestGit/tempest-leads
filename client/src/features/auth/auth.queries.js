import { useQuery } from '@tanstack/react-query';
import { getSession } from './auth.api';

export const SESSION_QUERY_KEY = ['auth', 'session'];

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: ({ signal }) => getSession({ signal }),
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
  });
}