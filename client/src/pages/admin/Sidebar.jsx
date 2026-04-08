import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Households', path: '/admin/households' },
    { name: 'Analytics', path: '/admin/analytics' },
    { name: 'Reports', path: '/admin/reports' },
    { name: 'Notifications', path: '/admin/notifications' },
  ];

  return (
    <div className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col h-screen sticky top-0">
      <div className="mb-10">
        <h1 className="text-xl font-black text-zinc-900">Admin Panel</h1>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Census Verification</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-3 rounded-2xl font-black transition ${
              location.pathname === item.path
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <button 
        className="mt-auto w-full border-2 border-zinc-900 text-zinc-900 px-4 py-3 rounded-2xl font-black hover:bg-zinc-50 transition"
        onClick={() => {/* add logout logic */}}
      >
        Logout
      </button>
    </div>
  );
}