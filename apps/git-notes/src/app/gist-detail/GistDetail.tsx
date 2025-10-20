import { useParams, useNavigate } from 'react-router-dom';
import {
  useGistDetails,
  useIsGistStarred,
  useStarGist,
  useUnstarGist,
  useForkGist,
} from '@/api/queries/gists.queries';
import { Button } from '@/components/ui/Button';
import { Star, GitFork, ArrowLeft, Eye } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store';
import { getGistFileContent } from '@/api/endpoints/gist.api';
import { GistFile } from '@/api/types/gist-api.types';

export function GistDetail() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();

  const { data: gist, isLoading, error } = useGistDetails(id || '');
  const { data: isStarred } = useIsGistStarred(id || '');
  const starGist = useStarGist();
  const unstarGist = useUnstarGist();
  const forkGist = useForkGist();

  const [activeFile, setActiveFile] = useState<string>('');
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});

  // Set the first file as active when gist loads
  useEffect(() => {
    if (gist && Object.keys(gist.files).length > 0 && !activeFile) {
      setActiveFile(Object.keys(gist.files)[0]);
    }
  }, [gist, activeFile]);

  const loadFileContent = useCallback(
    async (filename: string, file: GistFile) => {
      if (loadingFiles[filename] || fileContents[filename]) return;

      setLoadingFiles((prev) => ({ ...prev, [filename]: true }));
      try {
        const content = await getGistFileContent(file.raw_url);
        setFileContents((prev) => ({ ...prev, [filename]: content }));
      } catch (error) {
        console.error('Failed to load file content:', error);
      } finally {
        setLoadingFiles((prev) => ({ ...prev, [filename]: false }));
      }
    },
    [loadingFiles, fileContents]
  );

  // Load file content when activeFile changes
  useEffect(() => {
    if (activeFile && gist?.files[activeFile] && !fileContents[activeFile]) {
      loadFileContent(activeFile, gist.files[activeFile]);
    }
  }, [activeFile, gist, fileContents, loadFileContent]);

  const handleStar = async () => {
    if (!id) return;
    try {
      if (isStarred) {
        await unstarGist.mutateAsync(id);
      } else {
        await starGist.mutateAsync(id);
      }
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleFork = async () => {
    if (!id) return;
    try {
      await forkGist.mutateAsync(id);
    } catch (error) {
      console.error('Failed to fork gist:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) {
      return 'less than an hour ago';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const getLanguageFromFilename = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      json: 'json',
      css: 'css',
      scss: 'scss',
      html: 'html',
      md: 'markdown',
      yml: 'yaml',
      yaml: 'yaml',
      sh: 'bash',
      sql: 'sql',
    };
    return languageMap[extension || ''] || 'text';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading gist...</p>
        </div>
      </div>
    );
  }

  if (error || !gist) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500">
          <p>Error loading gist</p>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const files = Object.entries(gist.files);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to gists
      </Button>

      {/* Gist Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <img
              src={gist.owner?.avatar_url}
              alt={gist.owner?.login}
              className="h-12 w-12 rounded-full border border-gray-200"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">
                  {gist.owner?.login}
                </span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-900 font-medium">
                  {gist.description || 'gist_name'}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Created {formatTimeAgo(gist.created_at)}
              </div>
              {gist.description && (
                <p className="text-gray-700 text-sm max-w-2xl">
                  {gist.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFork}
                  disabled={forkGist.isPending}
                  className="flex items-center gap-2"
                >
                  <GitFork className="h-4 w-4" />
                  Fork
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs ml-1">
                    {gist.forks?.length}
                  </span>
                </Button>
                <Button
                  variant={isStarred ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleStar}
                  disabled={starGist.isPending || unstarGist.isPending}
                  className="flex items-center gap-2"
                >
                  <Star
                    className={`h-4 w-4 ${isStarred ? 'fill-white' : ''}`}
                  />
                  Star
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* File Tabs and Content */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* File Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {files.map(([filename, file]) => (
              <button
                key={filename}
                onClick={() => setActiveFile(filename)}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeFile === filename
                    ? 'border-teal-600 text-teal-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{filename}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {file.language || getLanguageFromFilename(filename)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* File Content */}
        {activeFile && (
          <div className="relative">
            {/* File Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="h-4 w-4" />
                <span>{activeFile}</span>
                {gist.files[activeFile]?.size && (
                  <span className="text-gray-400">
                    ({gist.files[activeFile].size} bytes)
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-0">
              {loadingFiles[activeFile] ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                </div>
              ) : (
                <pre className="p-4 text-sm font-mono bg-gray-50 overflow-x-auto min-h-[300px] max-h-[600px] overflow-y-auto">
                  <code className="language-javascript text-gray-800">
                    {fileContents[activeFile] || 'Unable to load file content'}
                  </code>
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
