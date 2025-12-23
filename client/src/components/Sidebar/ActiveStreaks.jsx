import React from 'react';
import { useHabit } from '../../context/HabitContext';

/**
 * Active Streaks Component
 */
const ActiveStreaks = () => {
  const { streaks } = useHabit();

  return (
    <div className="bg-primary-navy rounded-lg p-6">
      <h3 className="text-accent-pink font-semibold text-lg mb-4">TOP 10 ACTIVE STREAKS</h3>
      
      {streaks && streaks.length > 0 ? (
        <div className="space-y-3">
          {streaks.map((streak, index) => (
            <div 
              key={streak.habitId} 
              className="flex items-center justify-between p-3 bg-primary-slate rounded-lg hover:bg-opacity-80 transition"
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: streak.color }}
                ></div>
                <span className="text-white text-sm truncate">{streak.habitName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent-pink font-bold text-lg">
                  {streak.currentStreak}
                </span>
                <svg 
                  className="w-5 h-5 text-accent-pink" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No active streaks yet</p>
      )}
    </div>
  );
};

export default ActiveStreaks;
