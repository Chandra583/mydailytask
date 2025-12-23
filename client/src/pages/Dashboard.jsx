import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import ProgressCircles from '../components/Dashboard/ProgressCircles';
import DailyProgressTrendChart from '../components/Charts/DailyProgressTrendChart';
import DailyHabitGrid from '../components/Dashboard/DailyHabitGrid';
import LeftInfoPanel from '../components/Dashboard/LeftInfoPanel';
import TopHabitsChart from '../components/Charts/TopHabitsChart';
import ActiveStreaks from '../components/Dashboard/ActiveStreaks';
import SmartCalendar from '../components/Sidebar/SmartCalendar';
import HabitProgressBars from '../components/Sidebar/HabitProgressBars';
import TimePeriodBarChart from '../components/Charts/TimePeriodBarChart';
import WeeklyOverviewChart from '../components/Charts/WeeklyOverviewChart';
import CompletionDistributionChart from '../components/Charts/CompletionDistributionChart';
import HabitConsistencyHeatmap from '../components/Charts/HabitConsistencyHeatmap';
import StreakSparklines from '../components/Charts/StreakSparklines';
import TodayProgressDonut from '../components/Charts/TodayProgressDonut';
import HourlyActivityHeatmap from '../components/Charts/HourlyActivityHeatmap';
import GoalsVsActualChart from '../components/Charts/GoalsVsActualChart';
import NotesSection from '../components/Dashboard/NotesSection';
import AddHabitButton from '../components/Dashboard/AddHabitButton';
import SecretSantaBanner from '../components/Dashboard/SecretSantaBanner';

/**
 * Complete Daily Dashboard Page
 * Full-featured view with all charts and visualizations
 */
const Dashboard = () => {
  const { user } = useAuth();
  const [showSecretSanta, setShowSecretSanta] = useState(false);

  // Check if user is Naagamma and should see the Secret Santa banner
  useEffect(() => {
    if (user?.email) {
      const isNaagamma = user.email.toLowerCase() === 'naagu@gmail.com';
      const bannerShown = localStorage.getItem('secretSantaBannerShown_naagu');

      if (isNaagamma && !bannerShown) {
        // Show banner after a short delay for better UX
        const timer = setTimeout(() => {
          setShowSecretSanta(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-primary-dark">
      {/* Secret Santa Banner - Only for Naagamma */}
      {showSecretSanta && (
        <SecretSantaBanner onClose={() => setShowSecretSanta(false)} />
      )}

      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 py-6">
        {/* Progress Circles Row */}
        <ProgressCircles />

        {/* Daily Trend Chart - Full Width */}
        <div className="mt-6">
          <DailyProgressTrendChart />
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-6">
          
          {/* Left Sidebar - 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <LeftInfoPanel />
            <TodayProgressDonut />
          </div>

          {/* Main Content - 7 columns */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Habit Grid */}
            <DailyHabitGrid />

            {/* Time Period & Weekly Charts - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TimePeriodBarChart />
              <WeeklyOverviewChart />
            </div>

            {/* Consistency Heatmap & Goals Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <HabitConsistencyHeatmap />
              <GoalsVsActualChart />
            </div>

            {/* Notes Section */}
            <NotesSection />
          </div>

          {/* Right Sidebar - 3 columns */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Habits Today */}
            <TopHabitsChart />

            {/* Completion Distribution */}
            <CompletionDistributionChart />

            {/* Streak Sparklines */}
            <StreakSparklines />

            {/* Smart Calendar */}
            <SmartCalendar />

            {/* Hourly Activity */}
            <HourlyActivityHeatmap />

            {/* Habit Progress by Period */}
            <HabitProgressBars />
          </div>
        </div>
      </div>

      {/* Floating Add Habit Button */}
      <AddHabitButton />
    </div>
  );
};

export default Dashboard;
