import React from 'react';
import { Calendar, CalendarDays, CalendarRange, Sparkles } from 'lucide-react';

/**
 * View Switcher Component
 * Premium switches between Daily, Weekly, and Monthly views
 * Features: Glassmorphism, smooth transitions, keyboard shortcuts
 */
const ViewSwitcher = ({ currentView, onViewChange }) => {
  const views = [
    { 
      id: 'daily', 
      label: 'Daily', 
      icon: Calendar,
      shortcut: 'D',
      description: 'Track today\'s tasks',
      gradient: 'from-cyan-500 to-blue-600',
      glow: 'shadow-cyan-500/30'
    },
    { 
      id: 'weekly', 
      label: 'Weekly', 
      icon: CalendarDays,
      shortcut: 'W',
      description: '7-day overview',
      gradient: 'from-blue-500 to-purple-600',
      glow: 'shadow-blue-500/30'
    },
    { 
      id: 'monthly', 
      label: 'Monthly', 
      icon: CalendarRange,
      shortcut: 'M',
      description: 'Calendar heatmap',
      gradient: 'from-purple-500 to-pink-600',
      glow: 'shadow-purple-500/30'
    }
  ];

  return (
    <div className="glass-card inline-flex items-center gap-1 p-1.5 rounded-2xl">
      {views.map((view, index) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;
        
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              group relative flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold
              transition-all duration-300 ease-out
              ${isActive 
                ? `bg-gradient-to-r ${view.gradient} text-white shadow-lg ${view.glow}` 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
            title={`${view.label} View (${view.shortcut})`}
          >
            {/* Icon with animation */}
            <Icon 
              size={18} 
              className={`transition-transform duration-300 ${
                isActive ? 'text-white scale-110' : 'text-gray-400 group-hover:scale-110'
              }`} 
            />
            
            {/* Label */}
            <span className="hidden sm:inline">{view.label}</span>
            
            {/* Keyboard shortcut badge */}
            <span className={`
              hidden lg:inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold
              transition-all duration-200
              ${isActive 
                ? 'bg-white/20 text-white' 
                : 'bg-gray-700/50 text-gray-500 group-hover:bg-gray-600/50 group-hover:text-gray-300'
              }
            `}>
              {view.shortcut}
            </span>
            
            {/* Active indicator line */}
            {isActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-white/60 rounded-full" />
            )}
            
            {/* Sparkle effect for active */}
            {isActive && (
              <Sparkles 
                size={12} 
                className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" 
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ViewSwitcher;
