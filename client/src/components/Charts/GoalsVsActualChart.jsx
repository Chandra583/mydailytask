import React, { useMemo } from 'react';
import { useHabit, TIME_PERIODS } from '../../context/HabitContext';

/**
 * Goals vs Actual Chart
 * Comparison bar chart showing target vs actual completion
 */
const GoalsVsActualChart = () => {
  const { dailyStats, progressResetKey } = useHabit();

  const GOAL_PERCENTAGE = 100; // Target is always 100% for each period

  // GOLDEN RULE: Derived from dailyStats (which comes from dailyProgress)
  const periodData = useMemo(() => {
    console.log(`🎯 Recalculating GoalsVsActualChart (resetKey: ${progressResetKey})`);
    
    return [
      {
        name: 'Morning',
        icon: TIME_PERIODS.morning.icon,
        color: TIME_PERIODS.morning.color,
        goal: GOAL_PERCENTAGE,
        actual: dailyStats?.morning || 0,
      },
      {
        name: 'Afternoon',
        icon: TIME_PERIODS.afternoon.icon,
        color: TIME_PERIODS.afternoon.color,
        goal: GOAL_PERCENTAGE,
        actual: dailyStats?.afternoon || 0,
      },
      {
        name: 'Evening',
        icon: TIME_PERIODS.evening.icon,
        color: TIME_PERIODS.evening.color,
        goal: GOAL_PERCENTAGE,
        actual: dailyStats?.evening || 0,
      },
      {
        name: 'Night',
        icon: TIME_PERIODS.night.icon,
        color: TIME_PERIODS.night.color,
        goal: GOAL_PERCENTAGE,
        actual: dailyStats?.night || 0,
      },
    ];
  }, [dailyStats, progressResetKey]);

  // Calculate overall stats
  const totalGoal = periodData.reduce((sum, p) => sum + p.goal, 0);
  const totalActual = periodData.reduce((sum, p) => sum + p.actual, 0);
  const overallPercentage = Math.round((totalActual / totalGoal) * 100);
  const goalsMetCount = periodData.filter(p => p.actual >= p.goal).length;

  return (
    <div className="bg-primary-navy rounded-lg p-4">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <span>🎯</span>
        GOALS VS ACTUAL
      </h3>

      {/* Period Comparison */}
      <div className="space-y-4">
        {periodData.map((period) => {
          const difference = period.actual - period.goal;
          const isGoalMet = period.actual >= period.goal;
          
          return (
            <div key={period.name} className="space-y-2">
              {/* Period Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{period.icon}</span>
                  <span className="text-white font-medium">{period.name}</span>
                </div>
                {isGoalMet ? (
                  <span className="text-green-400 text-sm font-bold">✓ Goal Met!</span>
                ) : (
                  <span className="text-gray-400 text-sm">
                    {Math.abs(difference)}% to go
                  </span>
                )}
              </div>

              {/* Goal Bar (Background) */}
              <div className="relative">
                <div className="h-6 bg-gray-700 rounded-lg overflow-hidden">
                  {/* Goal Indicator */}
                  <div 
                    className="absolute inset-0 flex items-center justify-end pr-2"
                    style={{ width: '100%' }}
                  >
                    <span className="text-gray-500 text-xs">Goal {period.goal}%</span>
                  </div>
                  
                  {/* Actual Bar */}
                  <div
                    className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.min(period.actual, 100)}%`,
                      backgroundColor: period.color,
                    }}
                  >
                    <span className="text-white text-xs font-bold">
                      {period.actual}%
                    </span>
                  </div>
                </div>
                
                {/* Goal Line Marker */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white"
                  style={{ left: `${period.goal}%` }}
                ></div>
              </div>

              {/* Labels */}
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Actual: {period.actual}%</span>
                <span 
                  className={`font-bold ${
                    isGoalMet ? 'text-green-400' : 
                    period.actual >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}
                >
                  {isGoalMet ? '✓' : difference < 0 ? `${Math.abs(difference)}% below` : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-primary-slate rounded-lg">
            <div className="text-2xl font-bold text-white">{overallPercentage}%</div>
            <div className="text-gray-400 text-xs">Overall Progress</div>
          </div>
          <div className="p-3 bg-primary-slate rounded-lg">
            <div className="text-2xl font-bold text-green-400">{goalsMetCount}/4</div>
            <div className="text-gray-400 text-xs">Goals Met</div>
          </div>
          <div className="p-3 bg-primary-slate rounded-lg">
            <div className="text-2xl font-bold" style={{
              color: overallPercentage >= 75 ? '#4ade80' : 
                     overallPercentage >= 50 ? '#fbbf24' : '#ef4444'
            }}>
              {overallPercentage >= 75 ? '🌟' : overallPercentage >= 50 ? '💪' : '📈'}
            </div>
            <div className="text-gray-400 text-xs">
              {overallPercentage >= 75 ? 'Excellent!' : 
               overallPercentage >= 50 ? 'Good Work' : 'Keep Going'}
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 rounded-lg" style={{
        backgroundColor: goalsMetCount >= 3 ? '#22c55e20' : 
                         goalsMetCount >= 1 ? '#fbbf2420' : '#ef444420',
        borderLeft: `3px solid ${
          goalsMetCount >= 3 ? '#22c55e' : 
          goalsMetCount >= 1 ? '#fbbf24' : '#ef4444'
        }`
      }}>
        <p className="text-sm" style={{
          color: goalsMetCount >= 3 ? '#22c55e' : 
                 goalsMetCount >= 1 ? '#fbbf24' : '#ef4444'
        }}>
          {goalsMetCount === 4 && '🎉 Perfect! You met all your daily goals!'}
          {goalsMetCount === 3 && '🌟 Almost there! 3 out of 4 goals met!'}
          {goalsMetCount === 2 && '💪 Halfway there! Keep pushing!'}
          {goalsMetCount === 1 && '📈 Good start! Focus on the remaining periods.'}
          {goalsMetCount === 0 && '🚀 Start completing tasks to reach your goals!'}
        </p>
      </div>
    </div>
  );
};

export default GoalsVsActualChart;
