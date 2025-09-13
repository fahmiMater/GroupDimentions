import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header onMenuClick={toggleSidebar} />
          
          {/* Main content */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            fontSize: '14px',
            fontFamily: 'Cairo, sans-serif',
            direction: 'rtl',
            textAlign: 'right'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff'
            }
          }
        }}
      />
    </div>
  );
};

export default Layout;