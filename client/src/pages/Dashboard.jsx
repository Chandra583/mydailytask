import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHabit } from '../context/HabitContext';
import { Zap, TrendingUp, Target, Keyboard } from 'lucide-react';

// ============================================
// PRESERVED EXISTING COMPONENTS - DO NOT REMOVE
// ============================================

// Header
import DashboardHeader from '../components/Dashboard/DashboardHeader';

// Left Sidebar Components (PRESERVED)
import LeftInfoPanel from '../components/Dashboard/LeftInfoPanel';
import TodayProgressDonut from '../components/Charts/TodayProgressDonut';

// Main Content Components (PRESERVED)
import DailyHabitGrid from '../components/Dashboard/DailyHabitGrid';
import NotesSection from '../components/Dashboard/NotesSection';

// Charts (PRESERVED)
import DailyProgressTrendChart from '../components/Charts/DailyProgressTrendChart';
import TimePeriodBarChart from '../components/Charts/TimePeriodBarChart';
import WeeklyOverviewChart from '../components/Charts/WeeklyOverviewChart';
import HabitConsistencyHeatmap from '../components/Charts/HabitConsistencyHeatmap';
import GoalsVsActualChart from '../components/Charts/GoalsVsActualChart';
import HourlyActivityHeatmap from '../components/Charts/HourlyActivityHeatmap';

// NEW: Weekly & Monthly Charts
import WeeklyProgressChart from '../components/Charts/WeeklyProgressChart';
import MonthlyProgressChart from '../components/Charts/MonthlyProgressChart';

// Right Sidebar Components (PRESERVED)
import TopHabitsChart from '../components/Charts/TopHabitsChart';
import CompletionDistributionChart from '../components/Charts/CompletionDistributionChart';
import StreakSparklines from '../components/Charts/StreakSparklines';
import SmartCalendar from '../components/Sidebar/SmartCalendar';
import ActiveStreaks from '../components/Dashboard/ActiveStreaks';
import HabitProgressBars from '../components/Sidebar/HabitProgressBars';

// Other
import AddHabitButton from '../components/Dashboard/AddHabitButton';
import ViewSwitcher from '../components/Dashboard/ViewSwitcher';
import StandingTimer from '../components/Dashboard/StandingTimer';

/**
 * HYBRID Dashboard Layout with RESPONSIVE DESIGN
 * 
 * Desktop (1440px+): 3-column layout (2-7-3)
 * Tablet (768-1439px): 2-column layout  
 * Mobile (<768px): Single column, prioritized order
 * 
 * Mobile Priority Order:
 * 1. Header (sticky)
 * 2. Daily Habit Grid (Primary action area)
 * 3. Today's Progress Donut
 * 4. Daily Trend Chart
 * 5. Notes Section
 * 6. Other widgets (collapsed/tabs on mobile)
 * 
 * CRITICAL: No existing components have been removed!
 */
const Dashboard = () => {
  const { user } = useAuth();
  const { dailyStats, habits } = useHabit();
  const [currentView, setCurrentView] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle view change with transition
  const handleViewChange = (newView) => {
    if (newView === currentView) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(newView);
      setIsTransitioning(false);
    }, 150);
  };

  // Keyboard shortcuts for view switching
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key.toLowerCase() === 'd' && !e.metaKey && !e.ctrlKey) {
        handleViewChange('daily');
      } else if (e.key.toLowerCase() === 'w' && !e.metaKey && !e.ctrlKey) {
        handleViewChange('weekly');
      } else if (e.key.toLowerCase() === 'm' && !e.metaKey && !e.ctrlKey) {
        handleViewChange('monthly');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get motivational message based on progress
  const getMotivation = () => {
    const progress = dailyStats?.overall || 0;
    if (progress >= 80) return "You're crushing it today! 🔥";
    if (progress >= 50) return "Great progress, keep going! 💪";
    if (progress >= 20) return "Nice start, you've got this! ⭐";
    return "Let's make today count! 🚀";
  };

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* ========================================
          HEADER - Preserved DashboardHeader (Sticky on mobile)
          ======================================== */}
      <DashboardHeader />

      {/* ========================================
          VIEW SWITCHER - Daily/Weekly/Monthly toggle
          ======================================== */}
      <div className="max-w-[1920px] mx-auto px-3 sm:px-4 pt-4 pb-2">
        {/* Welcome Bar with Quick Stats */}
        <div className="glass-card p-4 sm:p-5 mb-4 animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Welcome Message */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <span className="text-xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() || '👋'}
                </span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
                </h2>
                <p className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Zap size={14} className="text-yellow-400" />
                  {getMotivation()}
                </p>
              </div>
            </div>

            {/* Center: Quick Stats Pills */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <TrendingUp size={14} className="text-green-400" />
                <span className="text-xs font-semibold text-green-400">
                  {dailyStats?.overall || 0}% Today
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                <Target size={14} className="text-blue-400" />
                <span className="text-xs font-semibold text-blue-400">
                  {habits?.length || 0} Tasks
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                <Keyboard size={14} className="text-purple-400" />
                <span className="text-xs font-semibold text-purple-400">
                  D / W / M
                </span>
              </div>
            </div>

            {/* Right: View Switcher */}
            <div className="flex items-center justify-center lg:justify-end">
              <ViewSwitcher currentView={currentView} onViewChange={handleViewChange} />
            </div>
          </div>
        </div>

        {/* ========================================
            STANDING TIMER - Pomodoro-style health reminder
            ======================================== */}
        <div className="mb-4 animate-fadeIn">
          <StandingTimer />
        </div>
      </div>

      {/* ========================================
          MAIN LAYOUT - Responsive Grid
          Mobile: 1 col, Tablet: 2 col, Desktop: 12 col
          ======================================== */}
      <div className={`max-w-[1920px] mx-auto px-3 sm:px-4 pb-4 sm:pb-6 transition-opacity duration-150 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}>
        
        {/* ========================================
            DAILY VIEW - Original dashboard layout
            ======================================== */}
        {currentView === 'daily' && (
          <div className="animate-fadeIn">
            {/* Mobile Quick Stats - Only visible on mobile */}
            <div className="lg:hidden mb-4">
              <TodayProgressDonut />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
              
              {/* ========================================
                  LEFT SIDEBAR - Desktop only (2 columns)
                  Hidden on mobile, shows in desktop
                  ======================================== */}
              <div className="hidden lg:block lg:col-span-2 space-y-4">
                {/* PRESERVED: Left Info Panel with Time Periods, Quick Insights */}
                <LeftInfoPanel />
                
                {/* PRESERVED: Today's Progress Donut Chart */}
                <TodayProgressDonut activeView="daily" />
                
                {/* HIDDEN: Goals vs Actual Widget - Commented out per user request */}
                {/* <GoalsVsActualChart /> */}
                
                {/* PRESERVED: Hourly Activity Heatmap */}
                <HourlyActivityHeatmap />
              </div>

              {/* ========================================
                  MAIN CONTENT - Responsive columns
                  Mobile: full width, Desktop: 7 cols
                  ======================================== */}
              <div className="md:col-span-2 lg:col-span-7 space-y-3 sm:space-y-4 order-1 lg:order-2">
                {/* PRESERVED: Main Habit Grid - PRIMARY ACTION AREA */}
                {/* Shows first on mobile for immediate interaction */}
                <div className="lg:hidden">
                  <DailyHabitGrid />
                </div>
                
                {/* PRESERVED: Daily Progress Trend Chart */}
                <DailyProgressTrendChart />

                {/* Desktop version of habit grid */}
                <div className="hidden lg:block">
                  <DailyHabitGrid />
                </div>

                {/* PRESERVED: Time Period & Weekly Charts */}
                {/* Stack on mobile, side by side on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <TimePeriodBarChart />
                  <WeeklyOverviewChart />
                </div>

                {/* HIDDEN: Consistency Heatmap - Commented out per user request */}
                {/* <div className="hidden sm:block">
                  <HabitConsistencyHeatmap />
                </div> */}

                {/* PRESERVED: Daily Notes Section */}
                <NotesSection />
              </div>

              {/* ========================================
                  RIGHT SIDEBAR - Responsive columns
                  Mobile: full width below main, Desktop: 3 cols
                  ======================================== */}
              <div className="md:col-span-2 lg:col-span-3 space-y-3 sm:space-y-4 order-3">
                {/* PRESERVED: Top Habits Chart */}
                <TopHabitsChart />

                {/* PRESERVED: Completion Distribution Chart */}
                <CompletionDistributionChart />

                {/* PRESERVED: Streak Sparklines */}
                <StreakSparklines />

                {/* PRESERVED: Active Streaks */}
                <ActiveStreaks />

                {/* HIDDEN: Habit Progress by Period - Commented out per user request */}
                {/* <HabitProgressBars /> */}
                
                {/* Mobile: Left sidebar widgets moved here */}
                <div className="lg:hidden space-y-3">
                  <LeftInfoPanel />
                  {/* <GoalsVsActualChart /> - Hidden per user request */}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            WEEKLY VIEW - Weekly progress chart
            ======================================== */}
        {currentView === 'weekly' && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Main Weekly Chart */}
              <div className="lg:col-span-8">
                <WeeklyProgressChart />
              </div>
              
              {/* Side Widgets */}
              <div className="lg:col-span-4 space-y-4">
                <TodayProgressDonut activeView="weekly" />
                <ActiveStreaks />
                <TopHabitsChart />
                <div className="hidden lg:block">
                  <SmartCalendar />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            MONTHLY VIEW - Calendar heatmap
            ======================================== */}
        {currentView === 'monthly' && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Main Monthly Chart */}
              <div className="lg:col-span-8">
                <MonthlyProgressChart />
              </div>
              
              {/* Side Widgets */}
              <div className="lg:col-span-4 space-y-4">
                <TodayProgressDonut activeView="monthly" />
                <ActiveStreaks />
                <StreakSparklines />
                {/* HabitConsistencyHeatmap hidden per user request */}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================
          FLOATING ADD BUTTON - Always visible
          ======================================== */}
      <AddHabitButton />
    </div>
  );
};

export default Dashboard;
