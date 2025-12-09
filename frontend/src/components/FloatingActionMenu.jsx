import { useState } from 'react';
import { Plus, Target, Flame, BookOpen, Dumbbell, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const FloatingActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: Target, label: 'New Goal', to: '/goals', color: 'from-amber-500 to-orange-600' },
    { icon: Flame, label: 'Log Habit', to: '/habits', color: 'from-red-500 to-orange-500' },
    { icon: BookOpen, label: 'Journal', to: '/journal', color: 'from-purple-500 to-pink-500' },
    { icon: Dumbbell, label: 'Exercise', to: '/exercises', color: 'from-emerald-500 to-teal-500' }
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {/* Action Buttons */}
      <div className={`flex flex-col-reverse gap-4 mb-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
      }`}>
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link 
              key={action.label} 
              to={action.to}
              className="group"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <span className="bg-[#1a1625] text-white text-sm px-4 py-2 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-[#d4a574]/30">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} hover:scale-110 transition-transform shadow-lg hover:shadow-xl`}
                >
                  <Icon size={20} />
                </Button>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        data-testid="floating-action-button"
        className={`w-16 h-16 rounded-full bg-gradient-to-r from-[#d4a574] to-[#b8885f] hover:from-[#e6b786] hover:to-[#d4a574] shadow-2xl hover:shadow-[#d4a574]/50 transition-all duration-300 ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        {isOpen ? <X size={28} /> : <Plus size={28} />}
      </Button>

      {/* Ripple effect */}
      {isOpen && (
        <div className="absolute inset-0 -z-10">
          <div className="w-16 h-16 rounded-full bg-[#d4a574]/20 animate-ping"></div>
        </div>
      )}
    </div>
  );
};

export default FloatingActionMenu;
