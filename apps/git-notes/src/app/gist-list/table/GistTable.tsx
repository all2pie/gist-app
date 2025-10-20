import { Gist, GistList, PaginationInfo } from '@/api/types/gist-api.types';
import DataTable, { TableColumn } from 'react-data-table-component';
import { Button } from '@/components/ui/Button';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { Star, GitFork } from 'lucide-react';
import { useAuthStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import {
  useIsGistStarred,
  useStarGist,
  useUnstarGist,
  useForkGist,
} from '@/api/queries/gists.queries';
import './gistTable.scss';

interface GistTableProps {
  data: GistList;
  pagination?: PaginationInfo;
  isLoading: boolean;
  error: Error | null;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage: (page: number) => void;
}

// Helper component for action buttons with dynamic star state
const GistActions = ({ gist }: { gist: Gist }) => {
  const { data: isStarred } = useIsGistStarred(gist.id);
  const starGist = useStarGist();
  const unstarGist = useUnstarGist();
  const forkGist = useForkGist();

  const handleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isStarred) {
        await unstarGist.mutateAsync(gist.id);
      } else {
        await starGist.mutateAsync(gist.id);
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleFork = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await forkGist.mutateAsync(gist.id);
    } catch (error) {
      console.error('Failed to fork gist:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-gray-600 p-1.5"
        onClick={handleFork}
        disabled={forkGist.isPending}
      >
        <GitFork className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={`p-1.5 ${
          isStarred
            ? 'text-yellow-500 hover:text-yellow-600'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        onClick={handleStar}
        disabled={starGist.isPending || unstarGist.isPending}
      >
        <Star className={`h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
      </Button>
    </div>
  );
};

const GistTable = ({
  data,
  pagination: paginationInfo,
  isLoading,
  error,
  onNextPage,
  onPrevPage,
  onGoToPage,
}: GistTableProps) => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  const baseColumns: TableColumn<Gist>[] = [
    {
      name: 'Name',
      selector: (row) => row.owner?.login || 'Anonymous',
      cell: (row) => {
        const user = row.owner;
        return (
          <div className="flex items-center gap-3 py-2">
            <img
              src={user?.avatar_url}
              alt={user?.login}
              className="h-10 w-10 rounded-full border border-gray-200"
            />
            <span className="font-medium text-gray-900">
              {user?.login || 'Anonymous'}
            </span>
          </div>
        );
      },
      sortable: true,
      width: '200px',
    },
    {
      name: 'Notebook Name',
      selector: (row) => row.description || 'Untitled Gist',
      sortable: false,
      wrap: true,
    },
    {
      name: 'Keyword',
      selector: (row) => Object.keys(row.files)[0] || 'Unknown',
      cell: (row) => {
        const firstFileName = Object.keys(row.files)[0] || 'Unknown';
        const fileExtension =
          firstFileName.split('.').pop()?.toLowerCase() || '';

        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full keyword">
            {fileExtension}
          </span>
        );
      },
      width: '150px',
    },
    {
      name: 'Updated',
      selector: (row) => row.updated_at,
      cell: (row) => {
        const date = new Date(row.updated_at);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let timeAgo = '';
        if (diffHours < 1) {
          timeAgo = 'Less than an hour ago';
        } else if (diffHours < 24) {
          timeAgo = `Last updated ${diffHours} hour${
            diffHours !== 1 ? 's' : ''
          } ago`;
        } else if (diffDays < 7) {
          timeAgo = `Last updated ${diffDays} day${
            diffDays !== 1 ? 's' : ''
          } ago`;
        } else {
          timeAgo = `Last updated on ${date.toLocaleDateString()}`;
        }

        return <span className="text-sm text-gray-600">{timeAgo}</span>;
      },
      sortable: true,
      width: '200px',
    },
  ];

  const actionsColumn: TableColumn<Gist> = {
    name: 'Actions',
    cell: (row) => <GistActions gist={row} />,
    ignoreRowClick: true,
    width: '120px',
  };

  const columns: TableColumn<Gist>[] = isLoggedIn
    ? [...baseColumns, actionsColumn]
    : baseColumns;

  const customStyles = {
    table: {
      style: {
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
      },
    },
    headCells: {
      style: {
        fontWeight: '600',
        color: '#374151',
      },
    },
    rows: {
      style: {
        '&:hover': {
          backgroundColor: '#f9fafb',
        },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading gists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-500">
          <p>Error loading gists: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        pagination={false} // Disable built-in pagination
        customStyles={customStyles}
        onRowClicked={(row) => navigate(`/gist/${row.id}`)}
        pointerOnHover
        noDataComponent={
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">No gists found.</p>
          </div>
        }
        progressPending={isLoading}
        progressComponent={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      />

      {/* Custom pagination controls */}
      {paginationInfo && (
        <PaginationControls
          currentPage={paginationInfo.page}
          totalPages={paginationInfo.total_pages}
          hasNextPage={Boolean(paginationInfo.next)}
          hasPrevPage={Boolean(paginationInfo.prev)}
          onNextPage={onNextPage}
          onPrevPage={onPrevPage}
          onGoToPage={onGoToPage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default GistTable;
