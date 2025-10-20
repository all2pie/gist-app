import { useState, useEffect } from 'react';
import { Gist, GistList, PaginationInfo } from '@/api/types/gist-api.types';
import { Button } from '@/components/ui/Button';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { CodeViewer } from '@/components/ui/CodeViewer';
import { Star, GitFork } from 'lucide-react';
import { getGistFileContent } from '@/api/endpoints/gist.api';
import { useAuthStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import {
  useIsGistStarred,
  useStarGist,
  useUnstarGist,
  useForkGist,
} from '@/api/queries/gists.queries';

// Helper component for action buttons with dynamic star state
const GistCardActions = ({ gist }: { gist: Gist }) => {
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
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-lg"
        className="text-gray-400 hover:text-gray-600 p-1 h-6 w-6"
        onClick={handleFork}
        disabled={forkGist.isPending}
        title="Fork this gist"
      >
        <GitFork className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon-lg"
        className={`p-1 h-6 w-6 ${
          isStarred
            ? 'text-yellow-500 hover:text-yellow-600'
            : 'text-gray-400 hover:text-gray-600'
        }`}
        onClick={handleStar}
        disabled={starGist.isPending || unstarGist.isPending}
        title={isStarred ? 'Unstar this gist' : 'Star this gist'}
      >
        <Star className={`h-3 w-3 ${isStarred ? 'fill-current' : ''}`} />
      </Button>
    </div>
  );
};

const GistCard = ({ gist }: { gist: Gist }) => {
  const navigate = useNavigate();
  const user = gist.owner;
  const fileName = Object.keys(gist.files)[0] || 'untitled';
  const firstFile = Object.values(gist.files)[0];
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const { isLoggedIn } = useAuthStore();

  const handleCardClick = () => {
    navigate(`/gist/${gist.id}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) {
      return 'Created less than an hour ago';
    } else if (diffHours < 24) {
      return `Created ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return `Created ${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      const fallback = `// Unable to load file content`;
      if (firstFile && firstFile.raw_url) {
        try {
          setIsLoadingContent(true);
          const content = await getGistFileContent(firstFile.raw_url);
          // Truncate content to show only first few lines for preview
          const lines = content.split('\n').slice(0, 12);
          setFileContent(lines.join('\n'));
        } catch {
          setFileContent(fallback);
        } finally {
          setIsLoadingContent(false);
        }
      } else {
        setFileContent(fallback);
      }
    };

    fetchContent();
  }, [firstFile, fileName]);

  return (
    <div
      className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Header with filename */}
      <div className="relative">
        <div className="px-4 py-3 border-b border-gray-200 ">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 truncate">
              {fileName}
            </span>
          </div>
        </div>

        {/* Hover overlay with View button - positioned only over header */}
        <div className="absolute inset-0 bg-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-t-lg">
          <Button
            className="bg-white text-teal-600 hover:bg-gray-50 border-0 font-medium px-4 py-2 rounded-md text-sm max-w-[200px] truncate"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/gist/${gist.id}`);
            }}
          >
            View {fileName}
          </Button>
        </div>
      </div>

      {/* Code Preview */}
      <div className="bg-gray-50">
        <div className="relative">
          <CodeViewer
            code={isLoadingContent ? '// Loading...' : fileContent}
            filename={fileName}
            isLoading={isLoadingContent}
            maxHeight="180px"
            minHeight="180px"
            className="text-sm"
          />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={user?.avatar_url}
            alt={user?.login}
            className="h-6 w-6 rounded-full border border-gray-200"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="font-medium text-gray-900 truncate">
                {user?.login || 'Anonymous'}
              </span>
              <span className="text-gray-400">/</span>
              <span className="font-medium text-gray-700 truncate">
                {fileName.includes('.') ? fileName.split('.')[0] : fileName}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-3">
          {formatTimeAgo(gist.created_at)}
        </p>

        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed flex-1">
            {gist.description || 'No description provided'}
          </p>

          {isLoggedIn && (
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <GistCardActions gist={gist} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface GistGridProps {
  data: GistList;
  pagination?: PaginationInfo;
  isLoading: boolean;
  error: Error | null;
  onNextPage: () => void;
  onPrevPage: () => void;
  onGoToPage: (page: number) => void;
}

const GistGrid = ({
  data,
  pagination: paginationInfo,
  isLoading,
  error,
  onNextPage,
  onPrevPage,
  onGoToPage,
}: GistGridProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {data.map((gist: Gist) => (
          <GistCard key={gist.id} gist={gist} />
        ))}
      </div>

      {data.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-gray-400 mb-3">
              <svg
                className="h-16 w-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">No gists found</p>
            <p className="text-gray-400 text-sm mt-1">
              Try adjusting your search criteria
            </p>
          </div>
        </div>
      )}

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

export default GistGrid;
