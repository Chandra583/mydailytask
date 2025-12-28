import React, { useState, useEffect, useMemo } from 'react';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod } from '../../context/HabitContext';
import { format } from 'date-fns';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Flame,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Calendar,
  Zap
} from 'lucide-react';

// Map period IDs to Lucide icons
const PERIOD_ICONS = {
  morning: Sun,
  afternoon: Sunrise,
  evening: Sunset,
  night: Moon,
};

/**
 * Left Info Panel Component - Daily View
 * Modern2026 design with glassmorphism and Lucide icons
 */
const LeftInfoPanel = () => {
  const { 
    habits, 
    dailyProgress,
    dailyStats, 
    selectedDate, 
    getFormattedDate,
    progressResetKey,
    isToday
  } = useHabit();
  
  // CRITICAL: Check if viewing today or a past date
  const isViewingToday = isToday();

  const [currentTime, setCurrentTime] = useState(new Date());
  const currentPeriod = getCurrentTimePeriod();
  const periodInfo = TIME_PERIODS[currentPeriod];
  const CurrentPeriodIcon = PERIOD_ICONS[currentPeriod];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate insights based on COMPLETION RATE (tasks at 100% / total tasks)
  // GOLDEN RULE: ALL derived from dailyProgress, never from habit properties
  const getPeriodCompletionRate = (periodId) => {
    if (habits.length === 0) return 0;
    let completedTasks = 0;
    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      if (progress[periodId] === 100) {
        completedTasks++;
      }
    });
    return Math.round((completedTasks / habits.length) * 100);
  };

  // GOLDEN RULE: Memoize best/worst period calculations
  const { bestPeriod, worstPeriod } = useMemo(() => {
    console.log(`📊 Recalculating LeftInfoPanel insights (resetKey: ${progressResetKey})`);
    
    const getBest = () => {
      const periods = ['morning', 'afternoon', 'evening', 'night'];
      let best = periods[0];
      let maxRate = getPeriodCompletionRate(periods[0]);
      
      periods.forEach(p => {
        const rate = getPeriodCompletionRate(p);
        if (rate > maxRate) {
          maxRate = rate;
          best = p;
        }
      });
      
      return { period: TIME_PERIODS[best], value: maxRate };
    };

    const getWorst = () => {
      const periods = ['morning', 'afternoon', 'evening', 'night'];
      let worst = periods[0];
      let minRate = getPeriodCompletionRate(periods[0]);
      
      periods.forEach(p => {
        const rate = getPeriodCompletionRate(p);
        if (rate < minRate) {
          minRate = rate;
          worst = p;
        }
      });
      
      return { period: TIME_PERIODS[worst], value: minRate };
    };

    return { bestPeriod: getBest(), worstPeriod: getWorst() };
  }, [habits, dailyProgress, progressResetKey]);

  // REMOVED: getTodayCompletionRate is now derived from dailyStats
  
  const BestIcon = PERIOD_ICONS[bestPeriod.period.id];
  const WorstIcon = PERIOD_ICONS[worstPeriod.period.id];

  return (
    <div className="space-y-4">
      {/* Task Tracker Stats Box */}
      <div className="glass-card p-5 hover-lift">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <ClipboardList size={18} className="text-accent-pink" />
          TASK TRACKER
        </h3>

        <div className="space-y-4">
          {/* Today's Date */}
          <div className="flex justify-between items-center">
            <span className="label-text flex items-center gap-2">
              <Calendar size={14} className="text-gray-500" />
              {isViewingToday ? "Today's Date" : 'Selected Date'}
            </span>
            <span className="text-white font-semibold text-sm">{getFormattedDate()}</span>
          </div>

          {/* Current Time */}
          <div className="flex justify-between items-center">
            <span className="label-text flex items-center gap-2">
              <Clock size={14} className="text-gray-500" />
              Current Time
            </span>
            <span className="text-white font-bold text-sm font-mono tabular-nums">
              {format(currentTime, 'h:mm:ss a')}
            </span>
          </div>

          {/* Current Period */}
          <div className="flex justify-between items-center">
            <span className="label-text flex items-center gap-2">
              <Zap size={14} className="text-gray-500" />
              Time Period
            </span>
            <span 
              className="badge text-xs font-semibold"
              style={{ 
                backgroundColor: `${periodInfo.color}25`, 
                color: periodInfo.color,
                border: `1px solid ${periodInfo.color}40`
              }}
            >
              <CurrentPeriodIcon size={12} />
              {periodInfo.name}
            </span>
          </div>

          <div className="divider my-3"></div>

          {/* Daily Tasks Count */}
          <div className="flex justify-between items-center">
            <span className="label-text">Daily Tasks</span>
            <span className="stat-number text-xl">{habits.length}</span>
          </div>
        </div>
      </div>

      {/* Completed / Remaining Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 border-l-4 border-emerald-500 hover-lift stagger-item">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wide">Completed</span>
          </div>
          <div className="stat-number text-2xl text-white">{dailyStats?.completed || 0}</div>
          <div className="badge-success text-[10px] mt-2">100% done</div>
        </div>
        
        <div className="glass-card p-4 border-l-4 border-amber-500 hover-lift stagger-item">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-500" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wide">Remaining</span>
          </div>
          <div className="stat-number text-2xl text-white">{dailyStats?.remaining || 0}</div>
          <div className="badge-warning text-[10px] mt-2">&lt;100%</div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="glass-card p-5 hover-lift">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <Flame size={18} className="text-orange-500" />
          QUICK INSIGHTS
        </h3>

        <div className="space-y-3">
          {/* Best Period */}
          <div 
            className="glass-card-light p-4 rounded-xl border-l-4 transition-all hover:scale-[1.02]"
            style={{ borderLeftColor: bestPeriod.period.color }}
          >
            <div className="flex items-center gap-2 text-white font-medium text-sm">
              <Award size={16} style={{ color: bestPeriod.period.color }} />
              <span>Best time: </span>
              <span style={{ color: bestPeriod.period.color }}>{bestPeriod.period.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <BestIcon size={14} style={{ color: bestPeriod.period.color }} />
              <span className="text-gray-400 text-xs">
                {bestPeriod.value}% tasks completed
              </span>
            </div>
          </div>

          {/* Needs Focus */}
          <div 
            className="glass-card-light p-4 rounded-xl border-l-4 transition-all hover:scale-[1.02]"
            style={{ borderLeftColor: worstPeriod.period.color }}
          >
            <div className="flex items-center gap-2 text-white font-medium text-sm">
              <Target size={16} className="text-red-400" />
              <span>Focus needed: </span>
              <span style={{ color: worstPeriod.period.color }}>{worstPeriod.period.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <WorstIcon size={14} style={{ color: worstPeriod.period.color }} />
              <span className="text-gray-400 text-xs">
                Only {worstPeriod.value}% tasks completed
              </span>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="glass-card-light p-4 rounded-xl border-l-4 border-accent-pink transition-all hover:scale-[1.02]">
            <div className="flex items-center gap-2 text-white font-medium text-sm">
              <BarChart3 size={16} className="text-accent-pink" />
              <span>{isViewingToday ? "Today's Progress" : 'Progress'}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-400 text-xs">
                Completed tasks
              </span>
              <span className="text-accent-pink font-bold text-lg">{dailyStats?.overall || 0}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2 mt-3 overflow-hidden">
              <div 
                className="h-2 rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${dailyStats?.overall || 0}%`,
                  background: 'linear-gradient(90deg, #e91e63, #ec4899)'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Period Legend */}
      <div className="glass-card p-5 hover-lift">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <Clock size={18} className="text-cyan-400" />
          TIME PERIODS
        </h3>
        <div className="space-y-2">
          {Object.values(TIME_PERIODS).map((period) => {
            const Icon = PERIOD_ICONS[period.id];
            const isActive = currentPeriod === period.id;
            
            return (
              <div 
                key={period.id}
                className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                  isActive ? 'ring-2 ring-white/30 scale-[1.02]' : 'hover:bg-white/5'
                }`}
                style={{ 
                  backgroundColor: isActive ? `${period.color}25` : `${period.color}10`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${period.color}30` }}
                  >
                    <Icon size={16} style={{ color: period.color }} />
                  </div>
                  <span className="text-white text-sm font-medium">{period.name}</span>
                </div>
                <span className="text-gray-400 text-xs font-mono">
                  {period.startHour === 22 ? '10 PM - 6 AM' : 
                   `${period.startHour > 12 ? period.startHour - 12 : period.startHour} ${period.startHour >= 12 ? 'PM' : 'AM'} - ${period.endHour > 12 ? period.endHour - 12 : period.endHour} ${period.endHour >= 12 ? 'PM' : 'AM'}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeftInfoPanel;
