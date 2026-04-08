import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; 

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* The sidebar we just created */}
      <Sidebar />
      
      {/* The area where AdminNotifications and other pages will load */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}