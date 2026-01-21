import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from 'recharts';
import { useHabit } from '../../context/HabitContext';
import { format, subDays, isToday as checkIsToday, startOfDay } from 'date-fns';
import { Calendar, Loader2 } from 'lucide-react';
import api from '../../utils/api';

/**
 * Weekly Overview Chart
 * Horizontal bar chart showing last 7 days progress
 * Uses the SAME backend API as WeeklyProgressChart for consistency
 */
const WeeklyOverviewChart = () => {
  const { dailyStats, progressResetKey } = useHabit();
  
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get start of current week (Sunday)
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayNum}`;
  };

  // Fetch weekly data from backend API (SAME as WeeklyProgressChart)
  const fetchWeeklyData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const weekStart = getStartOfWeek(new Date());
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d5edf7f6-514f-4bb3-8251-880135d8f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'WeeklyOverviewChart.jsx:47',message:'Fetching weekly data from backend',data:{weekStart},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      
      const response = await api.get(`/progress/weekly/${weekStart}`);
      
      // #region agent log
      const todayData = response.data.days.find(d => d.isToday);
      fetch('http://127.0.0.1:7242/ingest/d5edf7f6-514f-4bb3-8251-880135d8f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'WeeklyOverviewChart.jsx:57',message:'Backend response received',data:{weeklyAverage:response.data.weeklyAverage,todayProgress:todayData?.progress,todayCompleted:todayData?.completedTasks,todayTotal:todayData?.totalTasks},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
      
      setWeekData(response.data);
    } catch (err) {
      console.error('Failed to fetch weekly progress:', err);
      setError('Failed to load weekly data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeeklyData();
  }, [fetchWeeklyData, progressResetKey]);

  // Re-fetch when dailyStats changes (for today's progress)
  useEffect(() => {
    if (weekData) {
      // Update today's progress from dailyStats
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d5edf7f6-514f-4bb3-8251-880135d8f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'WeeklyOverviewChart.jsx:68',message:'Updating today progress from dailyStats',data:{today,dailyStatsOverall:dailyStats?.overall,beforeUpdate:weekData.days.find(d=>d.date===today)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      
      setWeekData(prev => ({
        ...prev,
        days: prev.days.map(d => 
          d.date === today 
            ? { ...d, progress: dailyStats?.overall || d.progress, isToday: true }
            : d
        )
      }));
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/d5edf7f6-514f-4bb3-8251-880135d8f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'WeeklyOverviewChart.jsx:79',message:'After updating today progress',data:{today,afterUpdate:weekData.days.find(d=>d.date===today)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
    }
  }, [dailyStats?.overall]);

  // Get color based on completion percentage
  const getBarColor = (completion) => {
    if (completion >= 90) return '#4ade80'; // Bright green
    if (completion >= 70) return '#fbbf24'; // Yellow
    if (completion >= 50) return '#fb923c'; // Orange
    if (completion > 0) return '#ef4444'; // Red
    return '#374151'; // No data gray
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-primary-slate p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-bold">
            {data.dayName}, {data.date}
          </p>
          <p className="text-2xl font-bold" style={{ color: getBarColor(data.progress) }}>
            {data.progress}%
          </p>
          {data.isToday && (
            <p className="text-accent-pink text-xs mt-1">Today</p>
          )}
          {data.completedTasks !== undefined && (
            <p className="text-gray-400 text-xs mt-1">
              {data.completedTasks}/{data.totalTasks} tasks
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="glass-card p-5 flex items-center justify-center h-80">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error || !weekData) {
    return (
      <div className="glass-card p-5 h-80 flex items-center justify-center">
        <p className="text-red-400 text-sm">{error || 'No data available'}</p>
      </div>
    );
  }

  // Calculate weekly average
  const weeklyAverage = weekData.weeklyAverage || 
    (weekData.days.reduce((sum, d) => sum + d.progress, 0) / weekData.days.length);

  return (
    <div className="glass-card p-5 hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            LAST 7 DAYS TASK PROGRESS
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            Weekly completion overview
          </p>
        </div>
        <div className="text-right">
          <div className="label-text">7-Day Completion</div>
          <div className="stat-number text-xl">{Math.round(weeklyAverage)}%</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weekData.days}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            
            <YAxis 
              type="category" 
              dataKey="dayName"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              width={40}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            
            <ReferenceLine 
              x={80} 
              stroke="#22c55e" 
              strokeDasharray="5 5" 
              label={{ value: 'Goal', fill: '#22c55e', fontSize: 10, position: 'top' }} 
            />
            
            <Bar 
              dataKey="progress" 
              radius={[0, 4, 4, 0]}
              maxBarSize={25}
              animationDuration={800}
            >
              {weekData.days.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.progress)}
                  stroke={entry.isToday ? '#fff' : 'transparent'}
                  strokeWidth={entry.isToday ? 2 : 0}
                  style={{
                    filter: entry.isToday ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Day Details */}
      <div className="grid grid-cols-7 gap-1 mt-4 pt-4 border-t border-gray-700">
        {weekData.days.map((day, index) => (
          <div 
            key={index}
            className={`text-center p-2 rounded-lg transition-all cursor-pointer hover:bg-gray-700 ${
              day.isToday ? 'bg-accent-pink bg-opacity-20 ring-1 ring-accent-pink' : ''
            }`}
          >
            <div className="text-gray-400 text-xs">{day.dayName}</div>
            <div className="font-bold text-sm text-white">
              {new Date(day.date + 'T00:00:00').getDate()}
            </div>
            <div 
              className="text-xs font-bold mt-1"
              style={{ color: getBarColor(day.progress) }}
            >
              {day.progress}%
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#4ade80' }}></div>
          <span className="text-gray-400 text-xs">90%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
          <span className="text-gray-400 text-xs">70-89%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fb923c' }}></div>
          <span className="text-gray-400 text-xs">50-69%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-gray-400 text-xs">1-49%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#374151' }}></div>
          <span className="text-gray-400 text-xs">0%</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyOverviewChart;
