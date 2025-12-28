import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useHabit } from '../../context/HabitContext';
import { format } from 'date-fns';

/**
 * Today Progress Donut Chart
 * Shows overall completion for today with segments
 * RULE: If ANY period is 100%, task is COMPLETE
 */
const TodayProgressDonut = () => {
  const { habits, dailyProgress, dailyStats, progressResetKey, selectedDate, isToday } = useHabit();
  
  // CRITICAL: Check if viewing today or a past date
  const isViewingToday = isToday();
  const displayDate = format(selectedDate, 'MMM d');

  // Calculate task-based completion
  // GOLDEN RULE: ALL values derived from dailyProgress, never from habit properties
  // ANY period at 100% = COMPLETED task
  const taskStatus = useMemo(() => {
    console.log(`🎯 Recalculating taskStatus (resetKey: ${progressResetKey})`);
    
    let completed = 0;      // ANY period at 100%
    let inProgress = 0;     // Some progress but no 100%
    let notStarted = 0;     // ALL periods at 0%

    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      const morning = progress.morning || 0;
      const afternoon = progress.afternoon || 0;
      const evening = progress.evening || 0;
      const night = progress.night || 0;

      // COMPLETED: ANY period is 100%
      if (morning === 100 || afternoon === 100 || evening === 100 || night === 100) {
        completed++;
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

    return { completed, inProgress, notStarted };
  }, [habits, dailyProgress, progressResetKey]);
  const totalTasks = habits.length;

  // Overall percentage = completed tasks / total tasks
  // Use memoized value that depends on progressResetKey
  const overallPercentage = useMemo(() => {
    return totalTasks > 0 
      ? Math.round((taskStatus.completed / totalTasks) * 100) 
      : 0;
  }, [taskStatus.completed, totalTasks]);

  const chartData = [
    { name: 'Completed', value: taskStatus.completed, color: '#4ade80' },
    { name: 'In Progress', value: taskStatus.inProgress, color: '#fbbf24' },
    { name: 'Not Started', value: taskStatus.notStarted, color: '#374151' },
  ].filter(d => d.value > 0);

  // If no data, show empty state
  if (totalTasks === 0) {
    chartData.push({ name: 'No Data', value: 1, color: '#374151' });
  }

  return (
    <div className="bg-primary-navy rounded-lg p-4">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        <span>🎯</span>
        {isViewingToday ? "TODAY'S PROGRESS" : `PROGRESS FOR ${displayDate.toUpperCase()}`}
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

      {/* Legend */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between p-2 bg-primary-slate rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
            <span className="text-white text-sm">✓ Completed</span>
          </div>
          <span className="text-green-400 font-bold">{taskStatus.completed} tasks</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-primary-slate rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#fbbf24]"></div>
            <span className="text-white text-sm">○ In Progress</span>
          </div>
          <span className="text-yellow-400 font-bold">{taskStatus.inProgress} tasks</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-primary-slate rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#374151]"></div>
            <span className="text-white text-sm">✗ Not Started</span>
          </div>
          <span className="text-gray-400 font-bold">{taskStatus.notStarted} tasks</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{totalTasks}</div>
            <div className="text-gray-400 text-xs">Total Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{taskStatus.completed}</div>
            <div className="text-gray-400 text-xs">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{taskStatus.inProgress}</div>
            <div className="text-gray-400 text-xs">In Progress</div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {overallPercentage >= 80 && isViewingToday && (
        <div className="mt-4 p-3 bg-green-900 bg-opacity-30 rounded-lg border border-green-700">
          <p className="text-green-400 text-sm text-center flex items-center justify-center gap-2">
            <span>🎉</span>
            Great progress today! Keep it up!
          </p>
        </div>
      )}
    </div>
  );
};

export default TodayProgressDonut;
