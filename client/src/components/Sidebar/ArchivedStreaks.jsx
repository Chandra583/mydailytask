import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';

/**
 * Archived Streaks Component
 * Displays streak history from deleted tasks
 */
const ArchivedStreaks = () => {
  const { archivedStreaks } = useHabit();
  const [showAll, setShowAll] = useState(false);

  if (!archivedStreaks || archivedStreaks.length === 0) {
    return (
      <div className="bg-primary-navy rounded-lg p-6">
        <h3 className="text-accent-pink font-semibold text-lg mb-4">🗄️ ARCHIVED STREAKS</h3>
        <p className="text-gray-400 text-sm text-center py-4">
          No archived streaks yet
        </p>
        <p className="text-gray-500 text-xs text-center mt-2">
          Streak history from deleted tasks will appear here
        </p>
      </div>
    );
  }

  const displayStreaks = showAll ? archivedStreaks : archivedStreaks.slice(0, 5);

  return (
    <div className="bg-primary-navy rounded-lg p-6">
      <h3 className="text-accent-pink font-semibold text-lg mb-4">🗄️ ARCHIVED STREAKS</h3>
      <p className="text-gray-500 text-xs mb-3">
        Streak history from deleted tasks
      </p>
      
      <div className="space-y-3">
        {displayStreaks.map((streak, index) => (
          <div 
            key={streak._id || index}
            className="flex items-center justify-between p-3 bg-primary-slate rounded-lg opacity-75 hover:opacity-100 transition"
            style={{ 
              borderLeft: `3px solid ${streak.habitColor || '#3b82f6'}`,
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: streak.habitColor || '#3b82f6' }}
              ></div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm truncate">
                  {streak.habitName}
                </div>
                {streak.archivedAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    Archived: {new Date(streak.archivedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="text-accent-pink font-bold text-lg">
                🔥 {streak.longestStreak || 0}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {archivedStreaks.length > 5 && (
        <button 
          onClick={() => setShowAll(!showAll)}
          className="mt-4 w-full text-sm text-accent-pink hover:text-accent-coral transition py-2"
        >
          {showAll ? 'Show Less' : `View all (${archivedStreaks.length})`}
        </button>
      )}
    </div>
  );
};

export default ArchivedStreaks;
