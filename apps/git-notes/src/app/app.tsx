import styles from './app.module.scss';
import { DataTable } from './data-table';
import { columns } from './columns';
import { sampleUsers } from './types';
import { initFirebase } from '@git-notes/common';
import { Header } from '@/components/ui/header/header';

export function App() {
  initFirebase();

  return (
    <>
      <Header></Header>

      <div className="container mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Manage your users with this powerful data table
          </p>
        </div>

        <DataTable columns={columns} data={sampleUsers} />
      </div>
    </>
  );
}

export default App;
