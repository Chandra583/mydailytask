import React, { useMemo } from 'react';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod } from '../../context/HabitContext';
import { TrendingUp, AlertCircle, Trophy, ListTodo, Target, Zap, Sun, Sunrise, Sunset, Moon, ArrowRight, ChevronUp, ChevronDown, Minus } from 'lucide-react';

// Time period colors
const PERIOD_COLORS = {
  morning: '#06b6d4',
  afternoon: '#fbbf24',
  evening: '#fb7185',
  night: '#a855f7',
};

const PERIOD_ICONS = {
  morning: Sun,
  afternoon: Sunrise,
  evening: Sunset,
  night: Moon,
};

/**
 * Quick Insights Cards - Redesigned for UX
 * Card 1: Today's Overall Progress with comparison
 * Card 2: ACTION NEEDED - Combined Focus Needed + Best Time
 * Card 3: Tasks Remaining with urgency indicator
 */
const QuickInsightsCards = () => {
  const {
    habits,
    dailyProgress,
    dailyStats,
    progressResetKey,
    historicalProgress,
    selectedDate,
  } = useHabit();

  // Calculate insights from daily progress
  const insights = useMemo(() => {
    if (habits.length === 0) {
      return {
        overallProgress: 0,
        focusPeriod: null,
        bestPeriod: null,
        tasksRemaining: 0,
        tasksCompleted: 0,
        periodStats: { morning: 0, afternoon: 0, evening: 0, night: 0 }
      };
    }

    // Calculate period averages
    const periodTotals = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    const periodCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    let tasksCompleted = 0;

    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      
      ['morning', 'afternoon', 'evening', 'night'].forEach(period => {
        const value = progress[period] || 0;
        periodTotals[period] += value;
        periodCounts[period]++;
        
        // Task is complete if ANY period is 100%
        if (value === 100) {
          // We count unique completed tasks
        }
      });

      // Check if task is completed (any period at 100%)
      if (progress.morning === 100 || progress.afternoon === 100 || 
          progress.evening === 100 || progress.night === 100) {
        tasksCompleted++;
      }
    });

    const periodStats = {
      morning: periodCounts.morning > 0 ? Math.round(periodTotals.morning / periodCounts.morning) : 0,
      afternoon: periodCounts.afternoon > 0 ? Math.round(periodTotals.afternoon / periodCounts.afternoon) : 0,
      evening: periodCounts.evening > 0 ? Math.round(periodTotals.evening / periodCounts.evening) : 0,
      night: periodCounts.night > 0 ? Math.round(periodTotals.night / periodCounts.night) : 0,
    };

    // Find best and worst periods (only for current and past periods)
    const currentPeriod = getCurrentTimePeriod();
    const periodOrder = ['morning', 'afternoon', 'evening', 'night'];
    const currentIndex = periodOrder.indexOf(currentPeriod);
    const activePeriods = periodOrder.slice(0, currentIndex + 1);

    let bestPeriod = null;
    let focusPeriod = null;
    let maxProgress = -1;
    let minProgress = 101;

    activePeriods.forEach(period => {
      const progress = periodStats[period];
      if (progress > maxProgress) {
        maxProgress = progress;
        bestPeriod = period;
      }
      if (progress < minProgress) {
        minProgress = progress;
        focusPeriod = period;
      }
    });

    // Overall progress = % of completed tasks
    const overallProgress = Math.round((tasksCompleted / habits.length) * 100);

    // Calculate yesterday's progress for comparison
    const yesterdayDate = new Date(selectedDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayKey = yesterdayDate.toISOString().split('T')[0];
    const yesterdayProgress = historicalProgress?.[yesterdayKey];
    
    let yesterdayCompletion = 0;
    if (yesterdayProgress) {
      let yesterdayCompleted = 0;
      habits.forEach(habit => {
        const progress = yesterdayProgress[habit._id] || {};
        if (progress.morning === 100 || progress.afternoon === 100 || 
            progress.evening === 100 || progress.night === 100) {
          yesterdayCompleted++;
        }
      });
      yesterdayCompletion = habits.length > 0 ? Math.round((yesterdayCompleted / habits.length) * 100) : 0;
    }

    const progressDiff = overallProgress - yesterdayCompletion;

    return {
      overallProgress,
      yesterdayCompletion,
      progressDiff,
      focusPeriod: focusPeriod && periodStats[focusPeriod] < 100 ? focusPeriod : null,
      bestPeriod: bestPeriod && periodStats[bestPeriod] > 0 ? bestPeriod : null,
      tasksRemaining: habits.length - tasksCompleted,
      tasksCompleted,
      periodStats
    };
  }, [habits, dailyProgress, progressResetKey, historicalProgress, selectedDate]);

  // Circular progress component
  const CircularProgress = ({ value, size = 80, strokeWidth = 8, color = '#8b5cf6' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(100, 116, 139, 0.3)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg">{value}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Section label - SECONDARY */}
      <div className="flex items-center gap-2">
        <h3 className="text-slate-400 text-sm font-medium">📊 Quick Insights</h3>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Secondary</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Overall Progress with Comparison */}
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-indigo-400" />
              <span className="text-slate-400 text-sm font-medium">Today's Progress</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CircularProgress 
                value={insights.overallProgress} 
                size={64}
                strokeWidth={6}
                color={insights.overallProgress >= 80 ? '#10b981' : 
                       insights.overallProgress >= 50 ? '#fbbf24' : 
                       insights.overallProgress > 0 ? '#f97316' : '#64748b'}
              />
              <div>
                <p className="text-white text-sm">
                  <span className="font-bold">{insights.tasksCompleted}</span>/{habits.length} done
                </p>
                {/* Comparison with yesterday */}
                <div className="flex items-center gap-1 mt-1">
                  {insights.progressDiff > 0 ? (
                    <>
                      <ChevronUp size={14} className="text-green-400" />
                      <span className="text-green-400 text-xs">+{insights.progressDiff}% vs yesterday</span>
                    </>
                  ) : insights.progressDiff < 0 ? (
                    <>
                      <ChevronDown size={14} className="text-red-400" />
                      <span className="text-red-400 text-xs">{insights.progressDiff}% vs yesterday</span>
                    </>
                  ) : (
                    <>
                      <Minus size={14} className="text-slate-400" />
                      <span className="text-slate-400 text-xs">Same as yesterday</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: ACTION NEEDED - Combined Widget */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-2xl border border-amber-500/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-bold">ACTION NEEDED</span>
          </div>
          
          {insights.focusPeriod ? (
            <div className="space-y-3">
              {/* Focus area */}
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = PERIOD_ICONS[insights.focusPeriod];
                  return (
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${PERIOD_COLORS[insights.focusPeriod]}22` }}
                    >
                      <Icon size={20} style={{ color: PERIOD_COLORS[insights.focusPeriod] }} />
                    </div>
                  );
                })()}
                <div>
                  <p className="text-white text-sm">
                    <span style={{ color: PERIOD_COLORS[insights.focusPeriod] }} className="font-bold">
                      {TIME_PERIODS[insights.focusPeriod]?.name}
                    </span>
                    {' '}needs attention
                  </p>
                  <p className="text-slate-400 text-xs">Only {insights.periodStats[insights.focusPeriod]}% complete</p>
                </div>
              </div>
              
              {/* Best time hint */}
              {insights.bestPeriod && insights.bestPeriod !== insights.focusPeriod && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
                  <Trophy size={12} className="text-green-400" />
                  <span className="text-slate-400 text-xs">
                    You perform best in <span className="text-green-400">{TIME_PERIODS[insights.bestPeriod]?.name}</span> ({insights.periodStats[insights.bestPeriod]}%)
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Trophy size={20} className="text-green-400" />
              </div>
              <div>
                <p className="text-green-400 font-bold text-sm">All on track!</p>
                <p className="text-slate-400 text-xs">Great job keeping up</p>
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Tasks Remaining with urgency */}
        <div className={`bg-slate-800/30 backdrop-blur-sm rounded-2xl border p-4 ${
          insights.tasksRemaining > 0 
            ? 'border-purple-500/20' 
            : 'border-green-500/30 bg-green-500/5'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <ListTodo size={16} className="text-purple-400" />
            <span className="text-slate-400 text-sm font-medium">Tasks Remaining</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white mb-1">
                {insights.tasksRemaining}
              </div>
              <span className="text-slate-400 text-xs">
                {insights.tasksRemaining === 1 ? 'task left today' : 'tasks left today'}
              </span>
            </div>
            
            {insights.tasksRemaining === 0 && habits.length > 0 ? (
              <div className="text-4xl">🎉</div>
            ) : insights.tasksRemaining <= 2 && habits.length > 0 ? (
              <div className="px-3 py-1 bg-green-500/20 rounded-full">
                <span className="text-green-400 text-xs font-medium">Almost there!</span>
              </div>
            ) : insights.tasksRemaining > habits.length / 2 ? (
              <div className="px-3 py-1 bg-amber-500/20 rounded-full">
                <span className="text-amber-400 text-xs font-medium">Keep going</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickInsightsCards;
