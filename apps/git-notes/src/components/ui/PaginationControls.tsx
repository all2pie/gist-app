import React, { useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage: (page: number) => void;
  isLoading?: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onNextPage,
  onPrevPage,
  onGoToPage,
  isLoading = false,
}) => {
  const handlePageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const page = parseInt(e.target.value);
      // Validate the input: must be a valid number and within bounds
      if (
        !isNaN(page) &&
        page >= 1 &&
        (totalPages ? page <= totalPages : true)
      ) {
        onGoToPage(page);
      }
    },
    [totalPages, onGoToPage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur(); // Remove focus to trigger onChange if needed
      }
    },
    []
  );

  // Early return if pagination is not needed
  const shouldShowPagination = totalPages
    ? totalPages > 1
    : hasNextPage || hasPrevPage;
  if (!shouldShowPagination) return null;

  return (
    <div
      className="flex items-center justify-end gap-4 py-4"
      role="navigation"
      aria-label="Pagination"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrevPage}
        disabled={!hasPrevPage || isLoading}
        className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1 text-sm text-gray-600">
        <label htmlFor="page-input" className="sr-only">
          Current page
        </label>
        <span>Page</span>
        <input
          id="page-input"
          type="number"
          min="1"
          max={totalPages || undefined}
          value={currentPage}
          onChange={handlePageInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className="w-12 px-1 text-center border-0 bg-transparent text-sm text-gray-600 font-medium focus:outline-none focus:bg-gray-50 focus:border focus:border-gray-300 focus:rounded"
          aria-label={
            totalPages
              ? `Page ${currentPage} of ${totalPages}`
              : `Page ${currentPage}`
          }
        />
        {totalPages && <span>of {totalPages}</span>}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNextPage}
        disabled={!hasNextPage || isLoading}
        className="p-1 text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed"
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
