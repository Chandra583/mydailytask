import React from 'react';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod } from '../../context/HabitContext';

/**
 * Hourly Activity Heatmap
 * Shows which hours you're most productive
 */
const HourlyActivityHeatmap = () => {
  const { dailyStats } = useHabit();
  const currentHour = new Date().getHours();
  const currentPeriod = getCurrentTimePeriod();

  // Define hours with their periods - Compact version (6 key hours)
  const hourlyData = [
    { hour: 7, label: '7 AM', period: 'morning' },
    { hour: 9, label: '9 AM', period: 'morning' },
    { hour: 12, label: '12 PM', period: 'afternoon' },
    { hour: 15, label: '3 PM', period: 'afternoon' },
    { hour: 18, label: '6 PM', period: 'evening' },
    { hour: 21, label: '9 PM', period: 'evening' },
  ].map(h => {
    // Calculate activity based on period stats and hour
    const periodValue = dailyStats?.[h.period] || 0;
    
    // Past hours get calculated activity, future hours are empty
    let activity = 0;
    if (h.hour <= currentHour) {
      // Simulate some variation within the period
      const variance = Math.sin(h.hour * 0.5) * 20;
      activity = Math.max(0, Math.min(100, periodValue + variance));
    }
    
    return { ...h, activity: Math.round(activity), isCurrent: h.hour === currentHour };
  });

  // Get color based on activity level
  const getActivityColor = (activity, periodColor) => {
    if (activity === 0) return '#374151';
    const opacity = Math.max(0.2, activity / 100);
    return periodColor;
  };

  const getActivityOpacity = (activity) => {
    if (activity === 0) return 0.3;
    return Math.max(0.2, activity / 100);
  };

  // Find peak hour
  const peakHour = hourlyData.reduce((max, h) => 
    h.activity > (max?.activity || 0) ? h : max, null
  );

  return (
    <div className="bg-primary-navy rounded-lg p-4">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        <span>⏰</span>
        HOURLY ACTIVITY HEATMAP
      </h3>

      {/* Heatmap Bars */}
      <div className="space-y-1">
        {hourlyData.map((hour) => {
          const periodColor = TIME_PERIODS[hour.period].color;
          
          return (
            <div 
              key={hour.hour}
              className={`flex items-center gap-2 p-1 rounded transition-all ${
                hour.isCurrent ? 'bg-primary-slate ring-1 ring-accent-pink' : ''
              }`}
            >
              {/* Hour Label */}
              <div className="w-12 text-right">
                <span className={`text-xs ${hour.isCurrent ? 'text-accent-pink font-bold' : 'text-gray-400'}`}>
                  {hour.label}
                </span>
              </div>

              {/* Activity Bar */}
              <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${hour.activity}%`,
                    backgroundColor: periodColor,
                    opacity: getActivityOpacity(hour.activity),
                    minWidth: hour.activity > 0 ? '4px' : '0',
                  }}
                ></div>
              </div>

              {/* Activity Value */}
              <div className="w-10 text-right">
                <span 
                  className={`text-xs font-bold ${
                    hour.isCurrent ? 'text-accent-pink' : 
                    hour.activity > 0 ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {hour.activity > 0 ? `${hour.activity}%` : '-'}
                </span>
              </div>

              {/* Current/Peak Indicators */}
              <div className="w-6">
                {hour.isCurrent && <span className="text-accent-pink text-xs">←</span>}
                {hour === peakHour && hour.activity > 0 && !hour.isCurrent && (
                  <span className="text-green-400 text-xs">🏆</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend - Compact */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex justify-between items-center text-xs">
          <div className="flex gap-2">
            {Object.values(TIME_PERIODS).map((period) => (
              <div key={period.id} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded"
                  style={{ backgroundColor: period.color }}
                ></div>
                <span className="text-gray-400">{period.icon}</span>
              </div>
            ))}
          </div>
          {peakHour && peakHour.activity > 0 && (
            <span className="text-green-400">
              🏆 Peak: {peakHour.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HourlyActivityHeatmap;
