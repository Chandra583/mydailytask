import React, { useState } from 'react';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod, PERCENTAGE_OPTIONS } from '../../context/HabitContext';
import { CheckCircle2, Lock, Trash2, AlertTriangle, Plus, RotateCw, ArrowUp, Clock } from 'lucide-react';

// Time period colors matching design requirements
const PERIOD_COLORS = {
  morning: '#06b6d4',    // Cyan
  afternoon: '#fbbf24',  // Yellow
  evening: '#fb7185',    // Coral
  night: '#a855f7',      // Purple
};

/**
 * Task Cards Component - Modern card-based habit grid
 * Replaces DailyHabitGrid with a Google Fit inspired design
 */
const TaskCards = ({ activeFilter = 'all' }) => {
  const {
    habits,
    dailyProgress,
    updateHabitProgress,
    getHabitProgress,
    addHabit,
    deleteHabit,
    isToday,
    selectedDate,
  } = useHabit();

  const [selectedCell, setSelectedCell] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#e91e63');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const currentPeriod = getCurrentTimePeriod();
  const timePeriods = Object.values(TIME_PERIODS);
  const periodOrder = ['morning', 'afternoon', 'evening', 'night'];

  const habitColors = [
    '#e91e63', '#06b6d4', '#fbbf24', '#fb7185', '#a855f7',
    '#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899',
  ];

  /**
   * Check if a period should be locked
   * FIXED: Only lock FUTURE time periods when viewing TODAY
   * Past dates and future dates: ALL periods are editable
   */
  const isPeriodLocked = (periodId) => {
    // Only apply time period restrictions when viewing TODAY
    if (!isToday()) {
      return false; // All periods editable for past/future dates
    }
    
    // For today: lock future time periods only
    const currentIndex = periodOrder.indexOf(currentPeriod);
    const periodIndex = periodOrder.indexOf(periodId);
    return periodIndex > currentIndex;
  };

  // Alias for backwards compatibility
  const isPeriodInFuture = isPeriodLocked;

  const handleCellClick = (habitId, period) => {
    if (isPeriodLocked(period)) return;
    setSelectedCell({ habitId, period });
  };

  const handleQuickComplete = async (habitId) => {
    const currentProgress = getHabitProgress(habitId, currentPeriod);
    if (currentProgress === 100) return;
    await updateHabitProgress(habitId, currentPeriod, 100);
  };

  const handlePercentageSelect = async (percentage) => {
    if (selectedCell) {
      await updateHabitProgress(selectedCell.habitId, selectedCell.period, percentage);
      setSelectedCell(null);
    }
  };

  const closeSelector = () => setSelectedCell(null);

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

  const handleDeleteClick = (habit) => {
    setDeleteConfirm({ id: habit._id, name: habit.name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    const result = await deleteHabit(deleteConfirm.id);
    setIsDeleting(false);
    if (result.success) setDeleteConfirm(null);
  };

  // Calculate overall daily completion for a habit
  const getHabitDailyCompletion = (habitId) => {
    const progress = dailyProgress[habitId] || {};
    const values = [
      progress.morning || 0,
      progress.afternoon || 0,
      progress.evening || 0,
      progress.night || 0
    ];
    
    // If any period is 100%, task is complete
    if (values.some(v => v === 100)) return 100;
    
    const filledValues = values.filter(v => v > 0);
    if (filledValues.length === 0) return 0;
    return Math.round(filledValues.reduce((a, b) => a + b, 0) / filledValues.length);
  };

  const isTaskCompleted = (habitId) => {
    const progress = dailyProgress[habitId] || {};
    return progress.morning === 100 || progress.afternoon === 100 || 
           progress.evening === 100 || progress.night === 100;
  };

  // Filter periods based on activeFilter
  const getDisplayPeriods = () => {
    if (activeFilter === 'all') return timePeriods;
    return timePeriods.filter(p => p.id === activeFilter);
  };

  const displayPeriods = getDisplayPeriods();

  return (
    <div className="space-y-4">
      {/* Section Header - PRIMARY FOCUS AREA */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4 rounded-2xl border border-indigo-500/20">
        <div>
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            🎯 Task Tracker
            <span className="text-xs font-normal text-indigo-400 bg-indigo-500/20 px-2 py-1 rounded-full">Primary</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {habits.length} tasks • <span className="text-indigo-300">Click cells to cycle progress (0→10→20→50→80→100)</span>
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium text-sm transition-all hover:scale-105 shadow-lg shadow-indigo-500/25"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {/* Task Cards Grid */}
      {habits.length === 0 ? (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-slate-400 mb-4">No tasks yet. Add your first task to get started!</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg"
          >
            + Add Your First Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const dailyCompletion = getHabitDailyCompletion(habit._id);
            const isCompleted = isTaskCompleted(habit._id);

            return (
              <div
                key={habit._id}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl border transition-all hover:border-slate-600 ${
                  isCompleted ? 'border-green-500/50 bg-green-500/5' : 'border-slate-700/50'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <div>
                      <h3 className="text-white font-semibold text-sm">{habit.name}</h3>
                      <span className="text-slate-500 text-xs">Daily Goal</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Quick Complete Button */}
                    {!isCompleted && (
                      <button
                        onClick={() => handleQuickComplete(habit._id)}
                        className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white transition-all"
                        title={`Mark ${TIME_PERIODS[currentPeriod].name} as 100%`}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    {isCompleted && (
                      <span className="p-2 text-green-400">
                        <CheckCircle2 size={16} />
                      </span>
                    )}
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteClick(habit)}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                      title="Archive task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Time Period Progress Grid */}
                <div className="p-4 space-y-3">
                  <div className={`grid gap-2 ${displayPeriods.length === 1 ? 'grid-cols-1' : displayPeriods.length === 2 ? 'grid-cols-2' : 'grid-cols-4'}`}>
                    {displayPeriods.map((period) => {
                      const percentage = getHabitProgress(habit._id, period.id);
                      const isCurrent = currentPeriod === period.id;
                      const isFuture = isPeriodInFuture(period.id);
                      const isSelected = selectedCell?.habitId === habit._id && selectedCell?.period === period.id;
                      const color = PERIOD_COLORS[period.id];

                      return (
                        <div key={period.id} className="relative group/cell">
                          <button
                            onClick={() => handleCellClick(habit._id, period.id)}
                            disabled={isFuture}
                            className={`w-full p-3 rounded-xl transition-all duration-200 relative ${
                              isCurrent ? 'ring-2 ring-offset-2 ring-offset-slate-800' : ''
                            } ${
                              isFuture 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'cursor-pointer hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 hover:ring-2 hover:ring-white/30'
                            } ${
                              percentage === 0 && !isFuture ? 'animate-pulse-slow' : ''
                            }`}
                            style={{ 
                              backgroundColor: percentage > 0 ? `${color}${Math.max(20, percentage / 100 * 80).toFixed(0).padStart(2, '0')}` : 'rgba(51, 65, 85, 0.5)',
                              ringColor: color
                            }}
                            title={isFuture ? `${period.name} - Coming later today` : `Click to update ${period.name} progress`}
                          >
                            {/* Interaction indicator - shows on hover */}
                            {!isFuture && (
                              <div className="absolute top-1 right-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                <RotateCw size={10} className="text-white/70" />
                              </div>
                            )}
                            
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-xs text-slate-300">{period.icon} {period.name}</span>
                              {isFuture && percentage === 0 ? (
                                <div className="flex items-center gap-1">
                                  <Clock size={12} className="text-slate-500" />
                                  <span className="text-slate-500 text-xs">Later</span>
                                </div>
                              ) : percentage === 100 ? (
                                <span className="text-white font-bold text-sm flex items-center gap-1">
                                  ✓ 100%
                                </span>
                              ) : percentage > 0 ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-white font-bold text-sm">{percentage}%</span>
                                  {!isFuture && (
                                    <ArrowUp size={10} className="text-white/50 group-hover/cell:text-white transition-colors" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-400 font-medium text-sm">Tap to start</span>
                              )}
                            </div>
                          </button>
                          
                          {/* Hover tooltip showing cycle pattern */}
                          {!isFuture && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-50 pointer-events-none">
                              <div className="bg-slate-900 text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl border border-slate-700">
                                <div className="text-white font-medium mb-1">Click to cycle progress</div>
                                <div className="text-slate-400 flex items-center gap-1">
                                  0% → 10% → 20% → 50% → 80% → 100% <RotateCw size={10} />
                                </div>
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                            </div>
                          )}

                          {/* Percentage Selector Dropdown */}
                          {isSelected && !isFuture && (
                            <div className="absolute top-full left-0 right-0 mt-2 z-50">
                              <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-600 p-2 animate-fade-in">
                                <div className="grid grid-cols-3 gap-1">
                                  {PERCENTAGE_OPTIONS.map((pct) => (
                                    <button
                                      key={pct}
                                      onClick={() => handlePercentageSelect(pct)}
                                      className={`p-2 rounded-lg text-xs font-bold transition-all ${
                                        pct === percentage
                                          ? 'bg-indigo-500 text-white'
                                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600 hover:scale-105'
                                      }`}
                                    >
                                      {pct === 100 ? '✓100%' : `${pct}%`}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  onClick={closeSelector}
                                  className="w-full mt-2 p-1 text-xs text-slate-400 hover:text-white transition"
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

                  {/* Overall Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Daily Progress</span>
                      <span className={`font-bold ${
                        dailyCompletion >= 80 ? 'text-green-400' :
                        dailyCompletion >= 50 ? 'text-yellow-400' :
                        dailyCompletion > 0 ? 'text-orange-400' : 'text-slate-500'
                      }`}>
                        {dailyCompletion}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${dailyCompletion}%`,
                          backgroundColor: dailyCompletion >= 80 ? '#10b981' :
                                          dailyCompletion >= 50 ? '#fbbf24' :
                                          dailyCompletion > 0 ? '#f97316' : '#374151'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Overlay to close selector */}
      {selectedCell && (
        <div className="fixed inset-0 z-40" onClick={closeSelector} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => !isDeleting && setDeleteConfirm(null)} />
          <div className="relative bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-fade-in border border-amber-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-white text-lg font-bold">Archive Task</h2>
                <p className="text-slate-400 text-sm">Hide from today onwards</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-6">
              Archive <span className="text-white font-semibold">"{deleteConfirm.name}"</span>?
              <br />
              <span className="text-green-400 text-xs">✓ Task will still appear in past dates</span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition flex items-center justify-center gap-2"
              >
                {isDeleting ? 'Archiving...' : <><Trash2 size={16} /> Archive</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-fade-in border border-slate-700">
            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              ✨ Add New Task
            </h2>
            <form onSubmit={handleAddHabit}>
              <div className="mb-4">
                <label className="block text-slate-400 text-sm mb-2">Task Name</label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Drink 8 glasses of water"
                  className="w-full bg-slate-700/50 text-white p-3 rounded-xl border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="mb-6">
                <label className="block text-slate-400 text-sm mb-2">Color</label>
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
              <div className="mb-6 p-3 bg-slate-700/30 rounded-xl">
                <p className="text-slate-400 text-xs mb-2">Preview:</p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: newHabitColor }} />
                  <span className="text-white">{newHabitName || 'Your new task'}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newHabitName.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl transition disabled:opacity-50"
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

export default TaskCards;
