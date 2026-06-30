import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, Layers, Settings } from 'lucide-react';
import { clsx } from 'clsx';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Home', exact: true },
  { to: '/browse', icon: Search, label: 'Browse', exact: false },
  { to: '/decks', icon: Layers, label: 'Decks', exact: false },
  { to: '/settings', icon: Settings, label: 'Settings', exact: false },
];

export function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex sm:relative sm:bottom-auto sm:border-t-0 sm:border-b sm:flex-row">
      <div className="flex w-full max-w-2xl mx-auto">
        {NAV.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors',
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
