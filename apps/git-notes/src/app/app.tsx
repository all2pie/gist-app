import styles from './app.module.scss';
import { DataTable } from './data-table';
import { columns } from './columns';
import { sampleUsers } from './types';
import { initFirebase, useLoginWithGithub } from '@git-notes/common';

export function App() {
  initFirebase();
  const { loginWithGithub } = useLoginWithGithub();

  const handleGithubLogin = async () => {
    try {
      const result = await loginWithGithub();
      if (result) {
        console.log('Login successful:', result.user);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-gray-600">
          Manage your users with this powerful data table
        </p>
        <button
          onClick={handleGithubLogin}
          className="mt-4 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Login with GitHub
        </button>
      </div>

      <DataTable columns={columns} data={sampleUsers} />
    </div>
  );
}

export default App;
