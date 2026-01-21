import React, { useMemo, useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useHabit } from '../../context/HabitContext';
import { format, startOfWeek } from 'date-fns';
import { Calendar, CalendarDays, CalendarRange, Loader2 } from 'lucide-react';
import api from '../../utils/api';

/**
 * Progress Donut Chart
 * Shows progress based on current view:
 * - Daily: Today's task completion
 * - Weekly: Weekly average
 * - Monthly: Monthly average
 * RULE: If ANY period is 100%, task is COMPLETE
 */
const TodayProgressDonut = ({ activeView = 'daily' }) => {
  const { habits, dailyProgress, dailyStats, progressResetKey, selectedDate, isToday } = useHabit();
  
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(false);

  // CRITICAL: Check if viewing today or a past date
  const isViewingToday = isToday();
  const displayDate = format(selectedDate, 'MMM d');

  // Fetch weekly data when in weekly view
  useEffect(() => {
    if (activeView === 'weekly') {
      const fetchWeeklyData = async () => {
        setLoading(true);
        try {
          const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
          const response = await api.get(`/progress/weekly/${weekStart}`);
          setWeeklyData(response.data);
        } catch (err) {
          console.error('Failed to fetch weekly data:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchWeeklyData();
    }
  }, [activeView, progressResetKey]);

  // Fetch monthly data when in monthly view
  useEffect(() => {
    if (activeView === 'monthly') {
      const fetchMonthlyData = async () => {
        setLoading(true);
        try {
          const now = new Date();
          const response = await api.get(`/progress/monthly-overview/${now.getFullYear()}/${now.getMonth() + 1}`);
          setMonthlyData(response.data);
        } catch (err) {
          console.error('Failed to fetch monthly data:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchMonthlyData();
    }
  }, [activeView, progressResetKey]);

  // Calculate task-based completion
  // GOLDEN RULE: ALL values derived from dailyProgress, never from habit properties
  // ANY period at 100% = COMPLETED task
  const taskStatus = useMemo(() => {
    console.log(`🎯 Recalculating taskStatus (resetKey: ${progressResetKey})`);
    
    let completed = 0;      // ANY period at 100%
    let inProgress = 0;     // Some progress but no 100%
    let notStarted = 0;     // ALL periods at 0%

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/d5edf7f6-514f-4bb3-8251-880135d8f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TodayProgressDonut.jsx:75',message:'Starting taskStatus calculation',data:{totalHabits:habits.length,resetKey:progressResetKey},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      const morning = progress.morning || 0;
      const afternoon = progress.afternoon || 0;
      const evening = progress.evening || 0;
      const night = progress.night || 0;

      // COMPLETED: ANY period is 100%
      if (morning === 100 || afternoon === 100 || evening === 100 || night === 100) {
        completed++;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/d5edf7f6-514f-4bb3-8251-880135d8f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TodayProgressDonut.jsx:88',message:'Task marked COMPLETED',data:{habitId:habit._id,habitName:habit.name,morning,afternoon,evening,night},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
      } 
      // Not started: ALL periods are 0%
      else if (morning === 0 && afternoon === 0 && evening === 0 && night === 0) {
        notStarted++;
      } 
      // In progress: has some progress but no 100%
      else {
        inProgress++;
      }
    });

    // #region agent log
    const percentage = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
    fetch('http://127.0.0.1:7242/ingest/d5edf7f6-514f-4bb3-8251-880135d8f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'TodayProgressDonut.jsx:105',message:'TODAY PROGRESS calculation complete',data:{completed,inProgress,notStarted,totalHabits:habits.length,percentage},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion

    return { completed, inProgress, notStarted };
  }, [habits, dailyProgress, progressResetKey]);

  const totalTasks = habits.length;

  // Get data based on active view
  const getViewData = () => {
    if (activeView === 'weekly' && weeklyData) {
      // Calculate completed/in-progress from weekly data
      const daysWithData = weeklyData.days.filter(d => d.progress > 0);
      const completedDays = daysWithData.filter(d => d.progress >= 80).length;
      const inProgressDays = daysWithData.filter(d => d.progress > 0 && d.progress < 80).length;
      const notStartedDays = 7 - daysWithData.length;
      
      return {
        overallPercentage: weeklyData.weeklyAverage || 0,
        completed: completedDays,
        inProgress: inProgressDays,
        notStarted: notStartedDays,
        totalItems: 7,
        label: 'days',
      };
    }
    
    if (activeView === 'monthly' && monthlyData) {
      const daysWithData = monthlyData.dailyProgress?.filter(d => d.hasData) || [];
      const completedDays = daysWithData.filter(d => d.progress >= 80).length;
      const inProgressDays = daysWithData.filter(d => d.progress > 0 && d.progress < 80).length;
      const totalDays = monthlyData.dailyProgress?.length || 31;
      
      return {
        overallPercentage: monthlyData.monthlyAverage || 0,
        completed: completedDays,
        inProgress: inProgressDays,
        notStarted: totalDays - daysWithData.length,
        totalItems: totalDays,
        label: 'days',
      };
    }
    
    // Daily view - use task status
    return {
      overallPercentage: totalTasks > 0 ? Math.round((taskStatus.completed / totalTasks) * 100) : 0,
      completed: taskStatus.completed,
      inProgress: taskStatus.inProgress,
      notStarted: taskStatus.notStarted,
      totalItems: totalTasks,
      label: 'tasks',
    };
  };

  const viewData = getViewData();
  const overallPercentage = viewData.overallPercentage;

  const chartData = [
    { name: activeView === 'daily' ? 'Completed' : 'Days 80%+', value: viewData.completed, color: '#4ade80' },
    { name: activeView === 'daily' ? 'In Progress' : 'Days < 80%', value: viewData.inProgress, color: '#fbbf24' },
    { name: activeView === 'daily' ? 'Not Started' : 'No Data', value: viewData.notStarted, color: '#374151' },
  ].filter(d => d.value > 0);

  // If no data, show empty state
  if (chartData.length === 0) {
    chartData.push({ name: 'No Data', value: 1, color: '#374151' });
  }

  // Get title and icon based on view
  const getViewTitle = () => {
    switch (activeView) {
      case 'weekly': return { title: 'WEEKLY PROGRESS', icon: CalendarDays };
      case 'monthly': return { title: 'MONTHLY PROGRESS', icon: CalendarRange };
      default: return { title: isViewingToday ? "TODAY'S PROGRESS" : `PROGRESS FOR ${displayDate.toUpperCase()}`, icon: Calendar };
    }
  };

  const { title: viewTitle, icon: ViewIcon } = getViewTitle();

  if (loading) {
    return (
      <div className="bg-primary-navy rounded-lg p-4">
        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
          <ViewIcon size={16} className="text-accent-pink" />
          {viewTitle}
        </h3>
        <div className="h-48 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-pink" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary-navy rounded-lg p-4">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        <ViewIcon size={16} className="text-accent-pink" />
        {viewTitle}
      </h3>

      {/* Donut Chart */}
      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              animationDuration={800}
              animationBegin={0}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="transparent"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{overallPercentage}%</span>
          <span className="text-gray-400 text-xs">Complete</span>
        </div>
      </div>

      {/* Legend - Compact */}
      <div className="space-y-1.5 mt-3">
        <div className="flex items-center justify-between p-1.5 bg-primary-slate/50 rounded">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4ade80]"></div>
            <span className="text-white text-xs">{activeView === 'daily' ? 'Completed' : '80%+'}</span>
          </div>
          <span className="text-green-400 font-bold text-sm">{viewData.completed}</span>
        </div>
        
        <div className="flex items-center justify-between p-1.5 bg-primary-slate/50 rounded">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div>
            <span className="text-white text-xs">{activeView === 'daily' ? 'In Progress' : '<80%'}</span>
          </div>
          <span className="text-yellow-400 font-bold text-sm">{viewData.inProgress}</span>
        </div>
        
        <div className="flex items-center justify-between p-1.5 bg-primary-slate/50 rounded">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#374151]"></div>
            <span className="text-white text-xs">{activeView === 'daily' ? 'Not Started' : 'No Data'}</span>
          </div>
          <span className="text-gray-400 font-bold text-sm">{viewData.notStarted}</span>
        </div>
      </div>

      {/* Success Message - Only when 80%+ */}
      {overallPercentage >= 80 && (
        <div className="mt-3 p-2 bg-green-900/30 rounded text-center">
          <span className="text-green-400 text-xs">
            {activeView === 'daily' ? '🎉 Great progress!' : activeView === 'weekly' ? '🔥 Great week!' : '🏆 Great month!'}
          </span>
        </div>
      )}
    </div>
  );
};

export default TodayProgressDonut;
