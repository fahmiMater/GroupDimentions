import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import CodeDefinitions from './pages/CodeDefinitions/CodeDefinitions';
import DimensionalGroups from './pages/DimensionalGroups/DimensionalGroups';
import Dimensionals from './pages/Dimensionals/Dimensionals';
import Fields from './pages/Fields/Fields';
import DataManagement from './pages/DataManagement/DataManagement';
import './styles/globals.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/code-definitions" element={<CodeDefinitions />} />
            <Route path="/dimensional-groups" element={<DimensionalGroups />} />
            <Route path="/dimensionals" element={<Dimensionals />} />
            <Route path="/fields" element={<Fields />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

// 404 Page component
const NotFound: React.FC = () => (
  <div className="text-center py-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">الصفحة غير موجودة</h2>
    <p className="text-gray-600 mb-6">لم يتم العثور على الصفحة المطلوبة</p>
    <button
      onClick={() => window.history.back()}
      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition"
    >
      العودة للخلف
    </button>
  </div>
);

export default App;
