import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}