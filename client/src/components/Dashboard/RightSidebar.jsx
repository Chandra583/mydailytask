import React, { useMemo, useState } from 'react';
import { useHabit, TIME_PERIODS } from '../../context/HabitContext';
import { Trophy, PieChart, Flame, CalendarDays, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * Collapsible Section Component
 */
const CollapsibleSection = ({ icon: Icon, iconColor, title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className={iconColor} />
          <h3 className="text-white font-medium text-sm">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>
      
      <div className={`transition-all duration-300 overflow-hidden ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Right Sidebar Component - TERTIARY visual hierarchy
 * Collapsible sections with muted styling
 * Contains: Top Tasks, Completion Status, Streaks, Last 7 Days
 */
const RightSidebar = () => {
  const {
    habits,
    dailyProgress,
    streaks,
    historicalProgress,
    fetchProgressForDate,
    selectedDate,
    progressResetKey,
  } = useHabit();

  // Widget 1: Top 5 Tasks - sorted by completion
  const top5Tasks = useMemo(() => {
    return habits
      .map(habit => {
        const progress = dailyProgress[habit._id] || {};
        const values = [
          progress.morning || 0,
          progress.afternoon || 0,
          progress.evening || 0,
          progress.night || 0
        ];
        
        // If any period is 100%, task is complete
        const isComplete = values.some(v => v === 100);
        const completion = isComplete ? 100 : (values.filter(v => v > 0).reduce((a, b) => a + b, 0) / Math.max(1, values.filter(v => v > 0).length)) || 0;
        
        return {
          id: habit._id,
          name: habit.name,
          color: habit.color,
          completion: Math.round(completion),
          isComplete
        };
      })
      .sort((a, b) => b.completion - a.completion)
      .slice(0, 5);
  }, [habits, dailyProgress, progressResetKey]);

  // Widget 2: Completion Status Distribution
  const completionStatus = useMemo(() => {
    const categories = {
      complete: 0,      // 100%
      high: 0,          // 80-99%
      medium: 0,        // 50-79%
      low: 0,           // 20-49%
      minimal: 0        // 0-19%
    };

    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      const values = [
        progress.morning || 0,
        progress.afternoon || 0,
        progress.evening || 0,
        progress.night || 0
      ];
      
      const isComplete = values.some(v => v === 100);
      if (isComplete) {
        categories.complete++;
        return;
      }
      
      const avg = values.reduce((a, b) => a + b, 0) / 4;
      if (avg >= 80) categories.high++;
      else if (avg >= 50) categories.medium++;
      else if (avg >= 20) categories.low++;
      else categories.minimal++;
    });

    return categories;
  }, [habits, dailyProgress, progressResetKey]);

  // Widget 3: Streak data from context
  const topStreaks = useMemo(() => {
    return streaks.slice(0, 5);
  }, [streaks]);

  // Widget 4: Last 7 days progress
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const progress = historicalProgress[dateKey] || {};
      
      let total = 0;
      let count = 0;
      Object.values(progress).forEach(p => {
        total += (p.morning || 0) + (p.afternoon || 0) + (p.evening || 0) + (p.night || 0);
        count += 4;
      });
      
      days.push({
        date: dateKey,
        dayName: format(date, 'EEE'),
        dayNum: format(date, 'd'),
        completion: count > 0 ? Math.round(total / count) : 0,
        isToday: i === 0
      });
    }
    return days;
  }, [historicalProgress, progressResetKey]);

  return (
    <div className="space-y-3">
      {/* Section label - TERTIARY */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">📋 Reference Widgets</h3>
          <span className="text-[10px] text-slate-600 bg-slate-800/50 px-2 py-0.5 rounded">Tertiary</span>
        </div>
        <span className="text-slate-600 text-xs">Click to expand</span>
      </div>
      
      {/* Widget 1: Top 5 Tasks Today */}
      <CollapsibleSection 
        icon={Trophy} 
        iconColor="text-amber-400/70" 
        title="Top 5 Tasks"
        defaultOpen={true}
      >
        {top5Tasks.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-2">No tasks yet</p>
        ) : (
          <div className="space-y-2">
            {top5Tasks.map((task, index) => (
              <div key={task.id} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-5 h-5 rounded bg-slate-700/50 flex items-center justify-center text-[10px] font-bold text-slate-500">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: task.color }}
                    />
                    <span className="text-slate-300 text-xs truncate">{task.name}</span>
                  </div>
                  <div className="mt-1 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${task.completion}%`,
                        backgroundColor: task.completion >= 80 ? '#10b981' :
                                        task.completion >= 50 ? '#fbbf24' :
                                        task.completion > 0 ? '#f97316' : '#374151'
                      }}
                    />
                  </div>
                </div>
                <span className={`text-[10px] font-medium ${
                  task.isComplete ? 'text-green-400/80' :
                  task.completion >= 80 ? 'text-green-400/80' :
                  task.completion >= 50 ? 'text-yellow-400/80' :
                  task.completion > 0 ? 'text-orange-400/80' : 'text-slate-600'
                }`}>
                  {task.completion}%
                </span>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Widget 2: Completion Status - Visual Bar Chart */}
      <CollapsibleSection 
        icon={PieChart} 
        iconColor="text-purple-400/70" 
        title="Completion Status"
        defaultOpen={false}
      >
        <div className="space-y-2">
          {[
            { key: 'complete', label: '100%', color: '#10b981' },
            { key: 'high', label: '80%+', color: '#22c55e' },
            { key: 'medium', label: '50%+', color: '#fbbf24' },
            { key: 'low', label: '20%+', color: '#f97316' },
            { key: 'minimal', label: '<20%', color: '#ef4444' },
          ].map(category => {
            const count = completionStatus[category.key];
            const percentage = habits.length > 0 ? (count / habits.length) * 100 : 0;
            
            return (
              <div key={category.key} className="flex items-center gap-2">
                <span className="text-slate-500 text-[10px] w-8">{category.label}</span>
                <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: count > 0 ? category.color : 'transparent'
                    }}
                  />
                </div>
                <span 
                  className="text-[10px] font-medium w-4 text-right"
                  style={{ color: count > 0 ? category.color : '#475569' }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Widget 3: Streak Trends */}
      <CollapsibleSection 
        icon={Flame} 
        iconColor="text-orange-400/70" 
        title="Active Streaks"
        defaultOpen={false}
      >
        {topStreaks.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-2">No active streaks</p>
        ) : (
          <div className="space-y-2">
            {topStreaks.map((streak) => (
              <div key={streak.habitId} className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center text-[10px]"
                  style={{ backgroundColor: `${streak.color}22` }}
                >
                  🔥
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-slate-300 text-xs truncate block">{streak.habitName}</span>
                </div>
                <span className="text-orange-400/80 font-bold text-sm">{streak.currentStreak}d</span>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Widget 4: Last 7 Days */}
      <CollapsibleSection 
        icon={CalendarDays} 
        iconColor="text-cyan-400/70" 
        title="Last 7 Days"
        defaultOpen={true}
      >
        {/* Mini Sparkline Chart */}
        <div className="h-12 mb-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="colorCompletionSidebar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  fontSize: '10px'
                }}
                labelFormatter={(value) => last7Days.find(d => d.date === value)?.dayName || value}
                formatter={(value) => [`${value}%`, 'Completion']}
              />
              <Area
                type="monotone"
                dataKey="completion"
                stroke="#06b6d4"
                strokeWidth={1.5}
                fill="url(#colorCompletionSidebar)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Day Pills - Compact */}
        <div className="grid grid-cols-7 gap-1">
          {last7Days.map((day) => (
            <div
              key={day.date}
              className={`flex flex-col items-center p-1.5 rounded transition-all ${
                day.isToday ? 'ring-1 ring-cyan-400/50 bg-cyan-400/10' : 'bg-slate-700/20'
              }`}
              title={`${day.date}: ${day.completion}%`}
            >
              <span className="text-slate-500 text-[8px]">{day.dayName}</span>
              <span className="text-slate-300 text-[10px] font-medium">{day.dayNum}</span>
              <div
                className="w-3 h-0.5 rounded-full mt-0.5"
                style={{
                  backgroundColor: day.completion >= 80 ? '#10b981' :
                                  day.completion >= 50 ? '#fbbf24' :
                                  day.completion > 0 ? '#f97316' : '#334155'
                }}
              />
            </div>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default RightSidebar;
