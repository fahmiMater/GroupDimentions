import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
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
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/code-definitions" element={<CodeDefinitions />} />
              <Route path="/dimensional-groups" element={<DimensionalGroups />} />
              <Route path="/dimensionals" element={<Dimensionals />} />
              <Route path="/fields" element={<Fields />} />
              <Route path="/data-management" element={<DataManagement />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
