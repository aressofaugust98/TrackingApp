import React, { useState } from 'react';
import {
  LayoutDashboard,
  ArrowRightLeft,
  PieChart,
  Settings,
} from 'lucide-react';

const AppLayout = ({ children }) => {
  const [activeLink, setActiveLink] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'transactions', label: 'Giao dịch', icon: ArrowRightLeft },
    { id: 'report', label: 'Báo cáo', icon: PieChart },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const isActive = (id) => activeLink === id;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="w-full flex flex-col sticky top-0 h-screen">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-indigo-600">FinTrack</h1>
            <p className="text-sm text-gray-500 mt-1">Quản lý tài chính cá nhân</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveLink(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.id)
                        ? 'bg-indigo-50 text-indigo-600 font-medium shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around h-20">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveLink(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all duration-200 rounded-t-lg ${
                  isActive(item.id)
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
                title={item.label}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
