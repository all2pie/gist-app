import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useStarredGists } from '@/api/queries/gists.queries';
import { usePagination } from '@/api/hooks/usePagination';
import { useSearchStore } from '@/store';
import { Gist } from '@/api/types/gist-api.types';
import GistTable from '../gist-list/table/GistTable';
import GistGrid from '../gist-list/grid/GistGrid';

export function StarredGists() {
  const [viewMode, setViewMode] = useState<string>('list');

  const { pagination, nextPage, prevPage, goToPage } = usePagination({
    initialPage: 1,
    initialPerPage: 10,
  });

  const { data: response, isLoading, error } = useStarredGists(pagination);
  const { searchQuery } = useSearchStore();

  // Filter gists based on search text
  const filteredGists = useMemo(() => {
    const gists = response?.data || [];
    if (!gists) return [];
    if (!searchQuery) return gists;

    return gists.filter(
      (gist: Gist) =>
        gist.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gist.user?.login?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        Object.keys(gist.files).some((filename) =>
          filename.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [response?.data, searchQuery]);

  const handleViewModeChange = (mode: string) => {
    if (mode) setViewMode(mode);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="title">Starred Gists</h1>

        <ToggleGroup
          type="single"
          variant="outline"
          value={viewMode}
          onValueChange={handleViewModeChange}
        >
          <ToggleGroupItem value="grid">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {viewMode === 'list' ? (
        <GistTable
          data={filteredGists}
          pagination={response?.pagination}
          isLoading={isLoading}
          error={error}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onGoToPage={goToPage}
        />
      ) : (
        <GistGrid
          data={filteredGists}
          pagination={response?.pagination}
          isLoading={isLoading}
          error={error}
          onNextPage={nextPage}
          onPrevPage={prevPage}
          onGoToPage={goToPage}
        />
      )}
    </div>
  );
}
