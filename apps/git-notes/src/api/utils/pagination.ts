import { PaginationInfo } from '../types/gist-api.types';

/**
 * Parse GitHub's Link header to extract pagination information
 * @param linkHeader - The Link header value from GitHub API response
 * @param currentPage - Current page number
 * @param perPage - Items per page
 * @returns Parsed pagination information
 */
export const parseLinkHeader = (
  linkHeader: string | null,
  currentPage: number,
  perPage: number
): PaginationInfo => {
  const pagination: PaginationInfo = {
    page: currentPage,
    per_page: perPage,
  };

  if (!linkHeader) {
    return pagination;
  }

  // Parse the Link header
  // Example: <https://api.github.com/gists?page=2&per_page=30>; rel="next", <https://api.github.com/gists?page=50>; rel="last"
  const links = linkHeader.split(',').map((link) => link.trim());

  for (const link of links) {
    const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const [, url, rel] = match;

      // Extract page number from URL
      const urlObj = new URL(url);
      const pageParam = urlObj.searchParams.get('page');

      switch (rel) {
        case 'first':
          pagination.first = url;
          break;
        case 'prev':
          pagination.prev = url;
          break;
        case 'next':
          pagination.next = url;
          break;
        case 'last':
          pagination.last = url;
          if (pageParam) {
            pagination.total_pages = parseInt(pageParam, 10);
          }
          break;
      }
    }
  }

  return pagination;
};

/**
 * Extract query parameters from URL
 * @param url - The URL to extract parameters from
 * @returns Object with query parameters
 */
export const extractQueryParams = (url: string): Record<string, string> => {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch {
    return {};
  }
};
