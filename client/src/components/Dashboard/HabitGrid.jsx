import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { getDaysArray, getWeekOfMonth, getWeekColor, isToday } from '../../utils/dateUtils';

/**
 * Enhanced Habit Grid Component - Matches reference design
 * Main heat map with week indicator bars and larger cells
 */
const HabitGrid = () => {
  const {
    habits,
    selectedYear,
    selectedMonth,
    isHabitCompleted,
    toggleHabitCompletion,
    progressData,
  } = useHabit();

  const [hoveredCell, setHoveredCell] = useState(null);

  const days = getDaysArray(selectedYear, selectedMonth);
  const daysInMonth = days.length;

  // Calculate week boundaries
  const getWeekDays = (weekNum) => {
    const start = (weekNum - 1) * 7 + 1;
    const end = Math.min(weekNum * 7, daysInMonth);
    return { start, end, count: end - start + 1 };
  };

  const weeks = [1, 2, 3, 4];
  if (daysInMonth > 28) weeks.push(5);

  const weekColors = {
    1: '#3b82f6', // Blue
    2: '#10b981', // Green  
    3: '#a855f7', // Purple
    4: '#f59e0b', // Yellow
    5: '#ef4444', // Red/Orange (Extra Days)
  };

  const weekLabels = {
    1: 'Week 1',
    2: 'Week 2',
    3: 'Week 3',
    4: 'Week 4',
    5: 'Extra Days',
  };

  const handleCellClick = async (habitId, day) => {
    const date = new Date(selectedYear, selectedMonth - 1, day);
    await toggleHabitCompletion(habitId, date);
  };

  // Calculate completed count per day
  const getCompletedCount = (day) => {
    return habits.filter((habit) => isHabitCompleted(habit._id, day)).length;
  };

  return (
    <div className="bg-primary-navy rounded-lg p-4 overflow-x-auto">
      <div className="min-w-max">
        {/* Week Indicator Bars */}
        <div className="flex mb-2">
          <div className="w-36 flex-shrink-0"></div>
          <div className="w-12 flex-shrink-0"></div>
          <div className="flex gap-0.5">
            {weeks.map((week) => {
              const { count } = getWeekDays(week);
              return (
                <div
                  key={week}
                  className="flex items-center justify-center h-6 rounded text-xs font-bold text-white"
                  style={{
                    width: `${count * 28}px`,
                    backgroundColor: weekColors[week],
                  }}
                >
                  {weekLabels[week]}
                </div>
              );
            })}
          </div>
        </div>

        {/* Header Row with Days */}
        <div className="flex mb-1">
          <div className="w-36 flex-shrink-0 px-2 py-2">
            <span className="text-accent-pink font-bold text-xs">DAILY HABITS</span>
          </div>
          <div className="w-12 flex-shrink-0 px-1 py-2 text-center">
            <span className="text-gray-400 font-bold text-xs">GOALS</span>
          </div>
          <div className="flex gap-0.5">
            {days.map((day) => (
              <div
                key={day}
                className={`w-7 py-1 text-center ${
                  isToday(selectedYear, selectedMonth, day)
                    ? 'bg-accent-pink rounded-t'
                    : ''
                }`}
              >
                <span
                  className={`text-xs font-semibold ${
                    isToday(selectedYear, selectedMonth, day)
                      ? 'text-white'
                      : 'text-gray-400'
                  }`}
                >
                  {day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Habit Rows */}
        <div className="space-y-0.5">
          {habits.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No habits yet. Add your first habit to get started!</p>
            </div>
          ) : (
            habits.map((habit) => (
              <div key={habit._id} className="flex hover:bg-primary-slate hover:bg-opacity-30 rounded transition">
                {/* Habit Name */}
                <div className="w-36 flex-shrink-0 px-2 py-1.5 flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: habit.color }}
                  ></div>
                  <span className="text-white text-xs truncate" title={habit.name}>
                    {habit.name}
                  </span>
                </div>

                {/* Goal */}
                <div className="w-12 flex-shrink-0 px-1 py-1.5 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">{habit.goal === 'Daily' ? '31' : habit.goal === 'Weekly' ? '4' : '1'}</span>
                </div>

                {/* Day Cells */}
                <div className="flex gap-0.5">
                  {days.map((day) => {
                    const completed = isHabitCompleted(habit._id, day);
                    const week = getWeekOfMonth(day);
                    const cellKey = `${habit._id}-${day}`;

                    return (
                      <button
                        key={day}
                        onClick={() => handleCellClick(habit._id, day)}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`w-7 h-6 rounded-sm transition-all duration-150 flex items-center justify-center ${
                          completed ? 'scale-100' : 'opacity-40'
                        } hover:scale-110 hover:opacity-100`}
                        style={{
                          backgroundColor: completed ? weekColors[week] : '#374151',
                        }}
                        title={`${habit.name} - Day ${day}`}
                      >
                        {completed && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Rows */}
        {habits.length > 0 && (
          <>
            {/* Completed Row */}
            <div className="flex mt-3 pt-3 border-t border-gray-700">
              <div className="w-36 flex-shrink-0 px-2 py-1">
                <span className="text-green-400 font-bold text-xs">COMPLETED</span>
              </div>
              <div className="w-12 flex-shrink-0"></div>
              <div className="flex gap-0.5">
                {days.map((day) => {
                  const count = getCompletedCount(day);
                  return (
                    <div key={day} className="w-7 py-1 text-center">
                      <span className="text-green-400 font-bold text-xs">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remaining Row */}
            <div className="flex">
              <div className="w-36 flex-shrink-0 px-2 py-1">
                <span className="text-red-400 font-bold text-xs">REMAINING</span>
              </div>
              <div className="w-12 flex-shrink-0"></div>
              <div className="flex gap-0.5">
                {days.map((day) => {
                  const completed = getCompletedCount(day);
                  const remaining = habits.length - completed;
                  return (
                    <div key={day} className="w-7 py-1 text-center">
                      <span className="text-red-400 font-bold text-xs">{remaining}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HabitGrid;
