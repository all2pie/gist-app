import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store';
import {
  useCurrentUser,
  useGistsByUsername,
} from '@/api/queries/gists.queries';
import { usePagination } from '@/api/hooks/usePagination';
import GistGrid from '../gist-list/grid/GistGrid';
import './profile.scss';

export function Profile() {
  const user = useAuthStore((state) => state.user);
  const {
    data: githubUser,
    isLoading: userLoading,
    isError: userError,
    error: userErrorMessage,
  } = useCurrentUser();

  const { pagination, nextPage, prevPage, goToPage } = usePagination({
    initialPage: 1,
    initialPerPage: 10,
  });

  const {
    data: gistsResponse,
    isLoading: gistsLoading,
    error: gistsError,
  } = useGistsByUsername(githubUser?.login || '', pagination);

  if (!user)
    return (
      <div className="flex justify-center items-center h-64">Please Login</div>
    );

  const handleViewGithubProfile = () => {
    if (githubUser?.login) {
      window.open(`https://github.com/${githubUser.login}`, '_blank');
    } else {
      console.error('GitHub username not available');
    }
  };

  if (userLoading)
    return (
      <div className="flex justify-center items-center h-64">
        Loading GitHub profile...
      </div>
    );
  if (userError)
    return (
      <div className="flex justify-center items-center h-64">
        Error loading GitHub profile: {userErrorMessage?.message}
      </div>
    );

  const gistsData = gistsResponse?.data || [];
  const totalGists = gistsData.length;

  return (
    <div className="profile-container">
      {/* Sidebar with user info */}
      <div className="profile-sidebar">
        <div className="user-avatar">
          <img
            src={user.photoURL || githubUser?.avatar_url || ''}
            alt={user.displayName || githubUser?.name || 'User avatar'}
            className="avatar-image"
          />
        </div>
        <div className="user-name">
          {githubUser?.name || user.displayName || 'Anonymous'}
        </div>
        <Button
          onClick={handleViewGithubProfile}
          disabled={!githubUser?.login}
          className="github-profile-btn"
        >
          View GitHub Profile
        </Button>
      </div>

      {/* Main content area */}
      <div className="profile-content">
        <div className="content-header">
          <div className="gists-title">
            <h1 className="title">All Gists</h1>
            {totalGists > 0 && (
              <span className="gists-count">{totalGists}</span>
            )}
          </div>
        </div>

        {/* Gists display */}
        <div className="gists-content profile-grid">
          <GistGrid
            data={gistsData}
            pagination={gistsResponse?.pagination}
            isLoading={gistsLoading}
            error={gistsError}
            onNextPage={nextPage}
            onPrevPage={prevPage}
            onGoToPage={goToPage}
          />
        </div>
      </div>
    </div>
  );
}
