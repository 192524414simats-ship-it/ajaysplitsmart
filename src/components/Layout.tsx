import { type ReactNode, useState } from 'react';
import {
  Home, LayoutDashboard, Users, Receipt, BarChart3, History,
  Moon, Sun, Plus, Menu, X, Wallet, Calculator, PiggyBank,
} from 'lucide-react';
import { useTheme } from '@/theme';
import { useRouter } from '@/router';

interface LayoutProps {
  children: ReactNode;
  onAddExpense?: () => void;
  onAddGroup?: () => void;
}

const navItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Groups', path: '/groups', icon: Users },
  { label: 'History', path: '/history', icon: History },
];

const mobileNavItems = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Groups', path: '/groups', icon: Users },
  { label: 'Analytics', path: '/history', icon: BarChart3 },
];

export function Layout({ children, onAddExpense, onAddGroup }: LayoutProps) {
  const { theme, toggle } = useTheme();
  const { path, navigate } = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (itemPath: string) => {
    if (itemPath === '/') return path === '/';
    return path === itemPath || path.startsWith(itemPath + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-30">
        <div className="px-6 py-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">SplitSmart</span>
          </button>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 space-y-2">
          {onAddGroup && (
            <button onClick={onAddGroup} className="btn-primary w-full">
              <Plus className="w-4 h-4" /> Create Group
            </button>
          )}
          {onAddExpense && (
            <button onClick={onAddExpense} className="btn-secondary w-full">
              <Receipt className="w-4 h-4" /> Add Expense
            </button>
          )}
        </div>
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <button onClick={toggle} className="btn-ghost w-full justify-start">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-white">SplitSmart</span>
        </button>
        <div className="flex items-center gap-1">
          <button onClick={toggle} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-xl p-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-gray-900 dark:text-white">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive(item.path)
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-4 space-y-2">
              {onAddGroup && (
                <button onClick={() => { onAddGroup(); setMobileOpen(false); }} className="btn-primary w-full">
                  <Plus className="w-4 h-4" /> Create Group
                </button>
              )}
              {onAddExpense && (
                <button onClick={() => { onAddExpense(); setMobileOpen(false); }} className="btn-secondary w-full">
                  <Receipt className="w-4 h-4" /> Add Expense
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
