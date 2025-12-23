import React from 'react';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod } from '../../context/HabitContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { 
  Clock, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  LayoutGrid
} from 'lucide-react';

// Map period IDs to Lucide icons
const PERIOD_ICONS = {
  morning: Sun,
  afternoon: Sunrise,
  evening: Sunset,
  night: Moon,
};

/**
 * Daily Dashboard Header Component
 * Modern2026 design with Lucide icons and glassmorphism
 */
const DashboardHeader = () => {
  const { 
    selectedDate, 
    getFormattedDate, 
    getDayOfWeek, 
    goToPreviousDay, 
    goToNextDay, 
    goToToday,
    isToday,
    currentTime 
  } = useHabit();
  const { user, logout: authLogout } = useAuth();

  const currentPeriod = getCurrentTimePeriod();
  const periodInfo = TIME_PERIODS[currentPeriod];
  const PeriodIcon = PERIOD_ICONS[currentPeriod];

  const handleLogout = () => {
    authLogout();
  };

  return (
    <div className="relative animate-fade-in">
      {/* Modern Gradient Header */}
      <div className="bg-gradient-to-br from-pink-600 via-rose-500 to-pink-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Header Content */}
        <div className="relative z-10 py-8 px-6">
          {/* Top Bar with User Info */}
          <div className="absolute top-4 right-6 flex items-center gap-3">
            {/* Current Time & Period Indicator */}
            <div 
              className="glass-card-light flex items-center gap-3 px-4 py-2.5 rounded-xl text-white"
              style={{ 
                backgroundColor: `${periodInfo.color}dd`,
                boxShadow: `0 4px 20px ${periodInfo.color}40`
              }}
            >
              <PeriodIcon size={20} className="text-white" />
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight">{format(currentTime, 'h:mm a')}</span>
                <span className="text-xs opacity-80">{periodInfo.name}</span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="btn-ghost flex items-center gap-2 text-white border-white/20 hover:bg-white/10 hover:border-white/30"
            >
              <span className="font-medium text-sm">{user?.username}</span>
              <LogOut size={16} />
            </button>
          </div>

          {/* Title Section */}
          <div className="text-center pt-4">
            <div className="inline-flex items-center gap-2 mb-3">
              <LayoutGrid size={24} className="text-white/80" />
              <span className="text-white/70 text-sm font-medium uppercase tracking-widest">Task Tracker</span>
            </div>
            
            <h1 className="main-title text-white mb-3 tracking-tighter">
              Daily Task Dashboard
            </h1>
            <p className="text-white/80 text-base font-light max-w-md mx-auto">
              Track your tasks throughout the day across four time periods
            </p>
          </div>

          {/* Date Navigation */}
          <div className="flex flex-col items-center gap-4 mt-6">
            {/* Day of Week Badge */}
            <div className="badge badge-info bg-white/10 border-white/20 text-white text-sm">
              {isToday() ? 'Today' : getDayOfWeek()}
            </div>

            {/* Date Navigation Controls */}
            <div className="inline-flex items-center gap-1 glass-card-light rounded-2xl p-1.5">
              <button
                onClick={goToPreviousDay}
                className="btn-icon bg-white/10 border-white/10 text-white hover:bg-white/20"
                title="Previous Day"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="text-center px-6 py-2">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Calendar size={16} className="text-white/70" />
                  <span className="text-white/70 text-xs uppercase tracking-wide">
                    {format(selectedDate, 'EEEE')}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">
                  {getFormattedDate()}
                </div>
              </div>

              <button
                onClick={goToNextDay}
                className="btn-icon bg-white/10 border-white/10 text-white hover:bg-white/20"
                title="Next Day"
              >
                <ChevronRight size={20} />
              </button>

              {!isToday() && (
                <button
                  onClick={goToToday}
                  className="ml-2 btn-ghost text-white border-white/20 hover:bg-white/15 text-sm font-semibold flex items-center gap-1.5"
                >
                  <Clock size={14} />
                  Today
                </button>
              )}
            </div>

            {/* Time Period Indicators */}
            <div className="flex gap-2 mt-2">
              {Object.values(TIME_PERIODS).map((period) => {
                const Icon = PERIOD_ICONS[period.id];
                const isActive = currentPeriod === period.id;
                
                return (
                  <div
                    key={period.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-105 shadow-lg'
                        : 'opacity-60 hover:opacity-80'
                    }`}
                    style={{ 
                      backgroundColor: isActive ? period.color : `${period.color}99`,
                      boxShadow: isActive ? `0 4px 20px ${period.color}60` : 'none'
                    }}
                  >
                    <Icon size={16} className="text-white" />
                    <span className="text-white font-medium">{period.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
