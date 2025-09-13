import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  Settings,
  Database,
  FileText,
  Grid3x3,
  Layers,
  ChevronRight,
  Home,
  FileInput
} from 'lucide-react';
import { MenuItem } from '@/types';

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    title: 'الرئيسية',
    icon: <Home className="w-5 h-5" />,
    path: '/'
  },
  {
    key: 'code-definitions',
    title: 'تعريف الأكواد',
    icon: <Settings className="w-5 h-5" />,
    path: '/code-definitions'
  },
  {
    key: 'dimensional-groups',
    title: 'مجموعات الأبعاد',
    icon: <Grid3x3 className="w-5 h-5" />,
    path: '/dimensional-groups'
  },
  {
    key: 'dimensionals',
    title: 'الأبعاد',
    icon: <Layers className="w-5 h-5" />,
    path: '/dimensionals'
  },
  {
    key: 'fields',
    title: 'الحقول',
    icon: <FileText className="w-5 h-5" />,
    path: '/fields'
  },
  {
    key: 'data-management',
    title: 'إدخال البيانات',
    icon: <FileInput className="w-5 h-5" />,
    path: '/data-management'
  },
  {
    key: 'reports',
    title: 'التقارير',
    icon: <Database className="w-5 h-5" />,
    path: '/reports'
  }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="  inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={clsx(
        '  inset-y-0 right-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">
                  نظام إدارة المجموعات
                </h1>
                <p className="text-xs text-blue-100">
                  إدارة وتنظيم البيانات الأبعاد
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                  onClick={() => {
                    // Close sidebar on mobile when item is clicked
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <div className={clsx(
                    'transition-colors duration-200',
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  )}>
                    {item.icon}
                  </div>
                  <span className="flex-1">{item.title}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">م</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">المدير</p>
                  <p className="text-xs text-gray-500">admin@system.com</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                الإصدار 1.0.0 • © 2024
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
