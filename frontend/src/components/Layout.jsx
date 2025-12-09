import { Link, useLocation } from 'react-router-dom';
import { Target, TrendingUp, Image, BookOpen, Dumbbell, Sparkles, BarChart3, LogOut, Menu, X, Mountain, Flame, Library, Clock, User, Shield, FileText, Palette, Users, Mail, Timer, Link2, Sun, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import FloatingActionMenu from '@/components/FloatingActionMenu';

const Layout = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: Target, label: 'Dashboard' },
    { path: '/morning-algorithm', icon: Sun, label: 'Morning Algorithm' },
    { path: '/journey', icon: Mountain, label: 'My Journey' },
    { path: '/timeline', icon: Clock, label: 'Timeline' },
    { path: '/goals', icon: TrendingUp, label: 'Goals' },
    { path: '/habits', icon: Target, label: 'Habits' },
    { path: '/habit-stacking', icon: Link2, label: 'Habit Stacking' },
    { path: '/rituals', icon: Flame, label: 'Rituals' },
    { path: '/identity', icon: User, label: 'Identity' },
    { path: '/obstacle', icon: Shield, label: 'Obstacles' },
    { path: '/premeditatio', icon: Eye, label: 'Premeditatio' },
    { path: '/burning-desire', icon: FileText, label: 'Burning Desire' },
    { path: '/vision-board', icon: Image, label: 'Vision Board' },
    { path: '/journal', icon: BookOpen, label: 'Journal' },
    { path: '/exercises', icon: Dumbbell, label: 'Exercises' },
    { path: '/wisdom', icon: Library, label: 'Wisdom' },
    { path: '/ai-coach', icon: Sparkles, label: 'AI Coach' },
    { path: '/inspiration', icon: Users, label: 'Inspiration' },
    { path: '/letters', icon: Mail, label: 'Mentor Letters' },
    { path: '/legacy', icon: Timer, label: 'Legacy Mode' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/themes', icon: Palette, label: 'Themes' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 glass border-r border-[#d4a574]/10 p-6 h-screen sticky top-0">
        <div className="mb-6">
          <h1 className="text-2xl font-bold gradient-text">Growth Mindset</h1>
          <p className="text-sm text-gray-400 mt-1">Transform Your Life</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#d4a574]/20 scrollbar-track-transparent">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#d4a574]/20 to-[#d4a574]/10 text-[#d4a574] border border-[#d4a574]/30'
                    : 'text-gray-400 hover:text-[#d4a574] hover:bg-[#d4a574]/5'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-[#d4a574]/10">
          <div className="mb-4">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-medium text-[#d4a574]">{user?.name}</p>
          </div>
          <Button
            onClick={onLogout}
            data-testid="logout-button"
            variant="outline"
            className="w-full border-[#d4a574]/30 text-[#d4a574] hover:bg-[#d4a574]/10"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden glass border-b border-[#d4a574]/10 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold gradient-text">Growth Mindset</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass border-b border-[#d4a574]/10 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#d4a574]/20 to-[#d4a574]/10 text-[#d4a574] border border-[#d4a574]/30'
                      : 'text-gray-400 hover:text-[#d4a574] hover:bg-[#d4a574]/5'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 pt-4 border-t border-[#d4a574]/10">
            <p className="text-sm text-gray-400 mb-2">Logged in as {user?.name}</p>
            <Button
              onClick={onLogout}
              data-testid="mobile-logout-button"
              variant="outline"
              className="w-full border-[#d4a574]/30 text-[#d4a574] hover:bg-[#d4a574]/10"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
        <FloatingActionMenu />
      </main>
    </div>
  );
};

export default Layout;
