import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';
import { initFirebase } from '@git-notes/common';
import { Header } from '@/components/ui/header/Header';
import { GitList } from './gist-list/GistList';
import { Profile } from './profile/Profile';
import { CreateGist } from './create-gist/CreateGist';
import { GistDetail } from './gist-detail/GistDetail';
import { StarredGists } from './starred-gists/StarredGists';
import './styles.scss';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Root Layout Component
function RootLayout() {
  return (
    <>
      <Header />
      <div className="my-8 mx-32">
        <Outlet />
      </div>
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootLayout />,
      children: [
        {
          path: '/',
          element: <GitList />,
        },
        {
          path: '/profile',
          element: <Profile />,
        },
        {
          path: '/create',
          element: <CreateGist />,
        },
        {
          path: '/starred',
          element: <StarredGists />,
        },
        {
          path: '/gist/:id',
          element: <GistDetail />,
        },
      ],
    },
  ],
  {
    basename: '/gist-app',
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

const queryClient = new QueryClient();

export function App() {
  initFirebase();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
