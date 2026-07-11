import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function TopNav() {
  const { user } = useAuth();
  const initials = (user?.full_name || 'U').charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between px-5 pt-5 pb-3 bg-background">
      <div className="flex items-center gap-1">
        <span className="text-2xl">•••</span>
        <span className="text-xl font-bold text-[#4CAF50] ml-1">VitalMás</span>
      </div>
      <Link to="/profile" className="flex flex-col items-center gap-0.5">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4CAF50] to-[#388E3C] flex items-center justify-center text-white font-bold text-sm">
          {initials}
        </div>
        <span className="text-[10px] text-muted-foreground">Mi Perfil</span>
      </Link>
    </header>
  );
}