import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  UtensilsCrossed,
  Dumbbell,
  User,
  Plus,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Inicio' },
  { path: '/recipes', icon: UtensilsCrossed, label: 'Recetas' },
  { path: '/exercises', icon: Dumbbell, label: 'Ejercicio' },
  { path: '/profile', icon: User, label: 'Perfil' },
];

export default function BottomNav() {
  const location = useLocation();

  const isActiveRoute = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(path);
  };

  const scannerActive = location.pathname.startsWith('/scanner');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="relative mx-auto max-w-lg">
        <div className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />

        <div className="relative flex h-16 items-center rounded-t-[28px] border-t border-border bg-card px-2 shadow-[0_-4px_14px_rgba(0,0,0,0.08)]">
          <div className="flex h-full flex-1">
            {navItems.slice(0, 2).map(({ path, icon: Icon, label }) => {
              const isActive = isActiveRoute(path);

              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                    isActive
                      ? 'text-[#4CAF50]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? 'stroke-[2.5]' : 'stroke-2'
                    }`}
                  />
                  <span className="text-[10px] font-medium leading-tight">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="w-20 shrink-0" />

          <div className="flex h-full flex-1">
            {navItems.slice(2).map(({ path, icon: Icon, label }) => {
              const isActive = isActiveRoute(path);

              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors ${
                    isActive
                      ? 'text-[#4CAF50]'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? 'stroke-[2.5]' : 'stroke-2'
                    }`}
                  />
                  <span className="text-[10px] font-medium leading-tight">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <Link
          to="/scanner"
          aria-label="Escanear"
          className={`absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[6px] border-background text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
            scannerActive ? 'bg-[#4CAF50]' : 'bg-[#4CAF50]'
          }`}
        >
          <Plus className="h-8 w-8 stroke-[3]" />
        </Link>
      </div>
    </nav>
  );
}