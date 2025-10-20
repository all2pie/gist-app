import { useState, useCallback } from 'react';
import { PaginationParams } from '../types/gist-api.types';

export interface UsePaginationReturn {
  pagination: PaginationParams;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  reset: () => void;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
}

/**
 * Hook for managing pagination state
 */
export const usePagination = (
  options: UsePaginationOptions = {}
): UsePaginationReturn => {
  const { initialPage = 1, initialPerPage = 10 } = options;

  const [pagination, setPagination] = useState<PaginationParams>({
    page: initialPage,
    per_page: initialPerPage,
  });

  const nextPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: (prev.page || 1) + 1,
    }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max((prev.page || 1) - 1, 1),
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(page, 1),
    }));
  }, []);

  const setPerPage = useCallback((perPage: number) => {
    setPagination((prev) => ({
      ...prev,
      per_page: perPage,
      page: 1, // Reset to first page when changing per_page
    }));
  }, []);

  const reset = useCallback(() => {
    setPagination({
      page: initialPage,
      per_page: initialPerPage,
    });
  }, [initialPage, initialPerPage]);

  return {
    pagination,
    nextPage,
    prevPage,
    goToPage,
    setPerPage,
    reset,
  };
};
