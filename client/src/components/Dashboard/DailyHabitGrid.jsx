import React, { useState } from 'react';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod, PERCENTAGE_OPTIONS } from '../../context/HabitContext';

/**
 * Daily Habit Grid Component
 * 4 time period columns with percentage-based completion cells
 */
const DailyHabitGrid = () => {
  const {
    habits,
    dailyProgress,
    updateHabitProgress,
    getHabitProgress,
    addHabit,
  } = useHabit();

  const [selectedCell, setSelectedCell] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#e91e63');
  const currentPeriod = getCurrentTimePeriod();

  const timePeriods = Object.values(TIME_PERIODS);

  const habitColors = [
    '#e91e63', '#00bcd4', '#ffc107', '#ff6b6b', '#7c4dff',
    '#10b981', '#3b82f6', '#f97316', '#06b6d4', '#a855f7',
  ];

  const handleCellClick = (habitId, period) => {
    setSelectedCell({ habitId, period });
  };

  const handlePercentageSelect = async (percentage) => {
    if (selectedCell) {
      await updateHabitProgress(selectedCell.habitId, selectedCell.period, percentage);
      setSelectedCell(null);
    }
  };

  const closeSelector = () => {
    setSelectedCell(null);
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    
    const result = await addHabit({
      name: newHabitName.trim(),
      color: newHabitColor,
    });
    
    if (result.success) {
      setNewHabitName('');
      setNewHabitColor('#e91e63');
      setShowAddModal(false);
    }
  };

  /**
   * Get cell background color based on percentage
   */
  const getCellStyle = (percentage, periodColor) => {
    if (percentage === 0) {
      return {
        backgroundColor: '#374151',
        opacity: 1,
      };
    }
    
    const opacity = percentage / 100;
    return {
      backgroundColor: periodColor,
      opacity: Math.max(0.2, opacity),
    };
  };

  /**
   * Calculate total completion for a habit across all periods
   */
  const getHabitTotal = (habitId) => {
    const progress = dailyProgress[habitId] || {};
    const total = (progress.morning || 0) + (progress.afternoon || 0) + 
                  (progress.evening || 0) + (progress.night || 0);
    return Math.round(total / 4);
  };

  return (
    <div className="bg-primary-navy rounded-lg p-4 relative">
      {/* Time Period Headers */}
      <div className="flex mb-2">
        <div className="w-48 flex-shrink-0"></div>
        <div className="w-16 flex-shrink-0"></div>
        <div className="flex-1 grid grid-cols-4 gap-2">
          {timePeriods.map((period) => (
            <div
              key={period.id}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-white transition-all ${
                currentPeriod === period.id ? 'ring-2 ring-white ring-opacity-50 scale-105' : ''
              }`}
              style={{ backgroundColor: period.color }}
            >
              <span className="text-lg">{period.icon}</span>
              <span className="text-sm">{period.name}</span>
            </div>
          ))}
        </div>
        <div className="w-20 flex-shrink-0 flex items-center justify-center">
          <span className="text-gray-400 text-xs font-bold">AVG</span>
        </div>
      </div>

      {/* Habit Rows */}
      <div className="space-y-1">
        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-400 mb-4">No tasks yet. Add your first task to get started!</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg font-bold transition-all hover:scale-105 shadow-lg"
            >
              + Add Your First Task
            </button>
          </div>
        ) : (
          habits.map((habit) => {
            const avgCompletion = getHabitTotal(habit._id);
            
            return (
              <div 
                key={habit._id} 
                className="flex items-center hover:bg-primary-slate hover:bg-opacity-30 rounded transition"
              >
                {/* Habit Name */}
                <div className="w-48 flex-shrink-0 px-3 py-3 flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: habit.color }}
                  ></div>
                  <span className="text-white text-sm truncate font-medium" title={habit.name}>
                    {habit.name}
                  </span>
                </div>

                {/* Goal */}
                <div className="w-16 flex-shrink-0 px-2 py-3 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Daily</span>
                </div>

                {/* Time Period Cells */}
                <div className="flex-1 grid grid-cols-4 gap-2">
                  {timePeriods.map((period) => {
                    const percentage = getHabitProgress(habit._id, period.id);
                    const isSelected = selectedCell?.habitId === habit._id && selectedCell?.period === period.id;
                    const isCurrent = currentPeriod === period.id;

                    return (
                      <div key={period.id} className="relative">
                        <button
                          onClick={() => handleCellClick(habit._id, period.id)}
                          className={`w-full h-12 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                            isCurrent ? 'ring-2 ring-white ring-opacity-30' : ''
                          } hover:scale-105 hover:ring-2 hover:ring-white hover:ring-opacity-50`}
                          style={getCellStyle(percentage, period.color)}
                        >
                          {percentage === 100 ? (
                            <span className="flex items-center gap-1 text-white">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              100%
                            </span>
                          ) : percentage > 0 ? (
                            <span className="text-white">{percentage}%</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </button>

                        {/* Percentage Selector Dropdown */}
                        {isSelected && (
                          <div className="absolute top-full left-0 right-0 mt-1 z-50">
                            <div className="bg-primary-slate rounded-lg shadow-xl border border-gray-600 p-2 animate-fade-in">
                              <div className="grid grid-cols-3 gap-1">
                                {PERCENTAGE_OPTIONS.map((pct) => (
                                  <button
                                    key={pct}
                                    onClick={() => handlePercentageSelect(pct)}
                                    className={`p-2 rounded text-xs font-bold transition-all hover:scale-105 ${
                                      pct === percentage
                                        ? 'bg-accent-pink text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                  >
                                    {pct === 100 ? '✓100' : `${pct}%`}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={closeSelector}
                                className="w-full mt-2 p-1 text-xs text-gray-400 hover:text-white transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Average Completion */}
                <div className="w-20 flex-shrink-0 px-2 py-3 flex items-center justify-center">
                  <div 
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      avgCompletion >= 80 ? 'bg-green-500 text-white' :
                      avgCompletion >= 50 ? 'bg-yellow-500 text-black' :
                      avgCompletion > 0 ? 'bg-orange-500 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {avgCompletion}%
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-xs">Completion:</span>
          {PERCENTAGE_OPTIONS.map((pct) => (
            <div key={pct} className="flex items-center gap-1">
              <div 
                className="w-4 h-4 rounded"
                style={{
                  backgroundColor: pct === 0 ? '#374151' : '#00bcd4',
                  opacity: pct === 0 ? 1 : Math.max(0.2, pct / 100),
                }}
              ></div>
              <span className="text-gray-400 text-xs">{pct}%</span>
            </div>
          ))}
        </div>
        
        {/* Add Task Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg font-bold text-sm transition-all hover:scale-105 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Overlay to close selector when clicking outside */}
      {selectedCell && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={closeSelector}
        ></div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={() => setShowAddModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-primary-navy rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl animate-fade-in border border-gray-700">
            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <span>✨</span>
              Add New Task
            </h2>

            <form onSubmit={handleAddHabit}>
              {/* Habit Name */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Habit Name</label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Drink 8 glasses of water"
                  className="w-full bg-primary-slate text-white p-3 rounded-lg border border-gray-600 focus:border-accent-pink focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-gray-400 text-sm mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {habitColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewHabitColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${newHabitColor === color ? 'ring-2 ring-white scale-110' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6 p-3 bg-primary-slate rounded-lg">
                <p className="text-gray-400 text-xs mb-2">Preview:</p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: newHabitColor }}></div>
                  <span className="text-white">{newHabitName || 'Your new task'}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newHabitName.trim()}
                  className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg transition disabled:opacity-50"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyHabitGrid;
