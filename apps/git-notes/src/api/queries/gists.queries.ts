import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {
  getGists,
  getStarredGists,
  getGistsByUsername,
  getGistDetails,
  forkGist,
  isGistStarred,
  starGist,
  unStarGist,
  createGist,
  getCurrentUser,
} from '../endpoints/gist.api';
import {
  CreateGistData,
  Gist,
  PaginationParams,
} from '@/api/types/gist-api.types';

// Query Keys
export const gistKeys = {
  all: ['gists'] as const,
  lists: () => [...gistKeys.all, 'list'] as const,
  list: (filters: string, pagination?: PaginationParams) =>
    [...gistKeys.lists(), { filters, pagination }] as const,
  details: () => [...gistKeys.all, 'detail'] as const,
  detail: (id: string) => [...gistKeys.details(), id] as const,
  starred: () => [...gistKeys.all, 'starred'] as const,
  starredPaginated: (pagination?: PaginationParams) =>
    [...gistKeys.starred(), { pagination }] as const,
  starStatus: (id: string) => [...gistKeys.all, 'starStatus', id] as const,
  byUsername: (username: string) =>
    [...gistKeys.all, 'byUsername', username] as const,
  byUsernamePaginated: (username: string, pagination?: PaginationParams) =>
    [...gistKeys.byUsername(username), { pagination }] as const,
};

export const userKeys = {
  all: ['user'] as const,
  current: () => [...userKeys.all, 'current'] as const,
};

// Queries with pagination
export const useGists = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: gistKeys.list('all', params),
    queryFn: () => getGists(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStarredGists = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: gistKeys.starredPaginated(params),
    queryFn: () => getStarredGists(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGistsByUsername = (
  username: string,
  params: PaginationParams = {}
) => {
  return useQuery({
    queryKey: gistKeys.byUsernamePaginated(username, params),
    queryFn: () => getGistsByUsername(username, params),
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Infinite query hooks for continuous scrolling
export const useInfiniteGists = (per_page = 10) => {
  return useInfiniteQuery({
    queryKey: [...gistKeys.lists(), 'infinite', { per_page }],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getGists({ page: pageParam, per_page }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.next) {
        // Extract page number from next URL
        const url = new URL(lastPage.pagination.next);
        const nextPage = url.searchParams.get('page');
        return nextPage ? parseInt(nextPage, 10) : undefined;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useInfiniteStarredGists = (per_page = 10) => {
  return useInfiniteQuery({
    queryKey: [...gistKeys.starred(), 'infinite', { per_page }],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getStarredGists({ page: pageParam, per_page }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.next) {
        const url = new URL(lastPage.pagination.next);
        const nextPage = url.searchParams.get('page');
        return nextPage ? parseInt(nextPage, 10) : undefined;
      }
      return undefined;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useInfiniteGistsByUsername = (username: string, per_page = 10) => {
  return useInfiniteQuery({
    queryKey: [...gistKeys.byUsername(username), 'infinite', { per_page }],
    queryFn: ({ pageParam }: { pageParam: number }) =>
      getGistsByUsername(username, { page: pageParam, per_page }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.next) {
        const url = new URL(lastPage.pagination.next);
        const nextPage = url.searchParams.get('page');
        return nextPage ? parseInt(nextPage, 10) : undefined;
      }
      return undefined;
    },
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  });
};

export const useGistDetails = (id: string) => {
  return useQuery({
    queryKey: gistKeys.detail(id),
    queryFn: () => getGistDetails(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useIsGistStarred = (id: string) => {
  return useQuery({
    queryKey: gistKeys.starStatus(id),
    queryFn: () => isGistStarred(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on 404 (not starred)
  });
};

// User Queries
export const useCurrentUser = () => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: getCurrentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Retry once on failure
  });
};

// Mutations
export const useForkGist = () => {
  return useMutation({
    mutationFn: forkGist,
  });
};

export const useStarGist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: starGist,
    onSuccess: (_, gistId) => {
      // Update star status optimistically
      queryClient.setQueryData(gistKeys.starStatus(gistId), true);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: gistKeys.starred() });
    },
  });
};

export const useUnstarGist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unStarGist,
    onSuccess: (_, gistId) => {
      // Update star status optimistically
      queryClient.setQueryData(gistKeys.starStatus(gistId), false);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: gistKeys.starred() });
    },
  });
};

export const useCreateGist = (data: CreateGistData) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => createGist(data),
    onSuccess: (newGist: Gist) => {
      queryClient.invalidateQueries({ queryKey: gistKeys.list('all') });
    },
  });
};
