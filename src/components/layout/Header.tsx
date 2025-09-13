import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import Button from '../ui/Button';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and title */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden p-2"
            >
              <Menu className="w-6 h-6" />
            </Button>
            
            <div className="hidden lg:block">
              <h1 className="text-lg font-semibold text-gray-900">
                نظام إدارة المجموعات الأبعاد
              </h1>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </Button>

            {/* User menu */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">المدير</p>
                <p className="text-xs text-gray-500">admin@example.com</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;