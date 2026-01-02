import React, { useState, useMemo } from 'react';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod, PERCENTAGE_OPTIONS } from '../../context/HabitContext';
import { CheckCircle2, Lock, Trash2, AlertTriangle, Flame, CalendarCheck, X, Palette, Info } from 'lucide-react';

/**
 * Daily Habit Grid Component
 * 4 time period columns with percentage-based completion cells
 * UPDATED: Added quick Complete button and disabled past time periods
 */
const DailyHabitGrid = () => {
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
  const [deleteConfirm, setDeleteConfirm] = useState(null); // {id, name} of habit to delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [newTaskType, setNewTaskType] = useState('ongoing');
  const currentPeriod = getCurrentTimePeriod();

  const timePeriods = Object.values(TIME_PERIODS);
  
  // Period order for reference
  const periodOrder = ['morning', 'afternoon', 'evening', 'night'];

  // Separate habits into ongoing and daily tasks
  const { ongoingTasks, dailyTasks } = useMemo(() => {
    const ongoing = habits.filter(h => !h.taskType || h.taskType === 'ongoing');
    const daily = habits.filter(h => h.taskType === 'daily');
    return { ongoingTasks: ongoing, dailyTasks: daily };
  }, [habits]);

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

  // Keep for backwards compatibility but use isPeriodLocked instead
  const isPeriodInFuture = isPeriodLocked;

  const habitColors = [
    '#e91e63', '#6366f1', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
    '#a855f7',
  ];

  const handleCellClick = (habitId, period) => {
    // Don't allow clicking on locked periods (future periods on today only)
    if (isPeriodLocked(period)) {
      return;
    }
    setSelectedCell({ habitId, period });
  };

  /**
   * Quick Complete button - marks current period as 100%
   */
  const handleQuickComplete = async (habitId) => {
    // Check if current period is already 100%
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

  const closeSelector = () => {
    setSelectedCell(null);
  };

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    
    const result = await addHabit({
      name: newHabitName.trim(),
      color: newHabitColor,
      taskType: newTaskType,
    });
    
    if (result.success) {
      setNewHabitName('');
      setNewHabitColor('#e91e63');
      setNewTaskType('ongoing');
      setShowAddModal(false);
    }
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteClick = (habit) => {
    setDeleteConfirm({ id: habit._id, name: habit.name });
  };

  /**
   * Confirm and execute delete (optimistic UI)
   */
  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    
    setIsDeleting(true);
    const result = await deleteHabit(deleteConfirm.id);
    setIsDeleting(false);
    
    if (result.success) {
      setDeleteConfirm(null);
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
   * Calculate completion display for a habit
   * RULE: Average of ONLY FILLED periods (periods > 0%)
   * If ANY period is 100%, show 100% (task is complete)
   */
  const getHabitDisplayValue = (habitId) => {
    const progress = dailyProgress[habitId] || {};
    const morning = progress.morning || 0;
    const afternoon = progress.afternoon || 0;
    const evening = progress.evening || 0;
    const night = progress.night || 0;

    // If ANY period is 100%, task is complete - show 100%
    if (morning === 100 || afternoon === 100 || evening === 100 || night === 100) {
      return 100;
    }

    // Calculate average of ONLY FILLED periods (> 0%)
    const filledPeriods = [morning, afternoon, evening, night].filter(p => p > 0);
    
    if (filledPeriods.length === 0) {
      return 0;
    }
    
    return Math.round(filledPeriods.reduce((sum, p) => sum + p, 0) / filledPeriods.length);
  };

  /**
   * Check if task is completed (any period is 100%)
   */
  const isTaskCompleted = (habitId) => {
    const progress = dailyProgress[habitId] || {};
    return (progress.morning === 100 || progress.afternoon === 100 || 
            progress.evening === 100 || progress.night === 100);
  };

  /**
   * Get available percentage options for a period
   * Options should be >= highest completion across all periods
   * If task is complete (any period 100%), disable all options
   */
  const getAvailableOptions = (habitId, periodId) => {
    const progress = dailyProgress[habitId] || {};
    const morning = progress.morning || 0;
    const afternoon = progress.afternoon || 0;
    const evening = progress.evening || 0;
    const night = progress.night || 0;

    // If any period is 100%, task is complete - disable all
    if (morning === 100 || afternoon === 100 || evening === 100 || night === 100) {
      return { disabled: true, options: [], message: 'Task Completed' };
    }

    // Get highest completion across all periods
    const highestCompletion = Math.max(morning, afternoon, evening, night);
    const currentValue = progress[periodId] || 0;

    // Available options should be >= highest completion (but always include current value)
    const availableOptions = PERCENTAGE_OPTIONS.filter(
      opt => opt >= highestCompletion || opt === currentValue
    );

    return { disabled: false, options: availableOptions, message: null };
  };

  /**
   * Render a single habit row
   */
  const renderHabitRow = (habit) => {
    const avgCompletion = getHabitDisplayValue(habit._id);
    const isDaily = habit.taskType === 'daily';
    
    return (
      <div 
        key={habit._id} 
        className="flex items-center hover:bg-primary-slate hover:bg-opacity-30 rounded transition"
      >
        {/* Habit Name + Quick Complete Button + Delete */}
        <div className="w-48 flex-shrink-0 px-3 py-3 flex items-center gap-2 group">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: habit.color }}
          ></div>
          <span className="text-white text-sm truncate font-medium flex-1" title={habit.name}>
            {habit.name}
          </span>
          {/* Archive Button - appears on hover */}
          <button
            onClick={() => handleDeleteClick(habit)}
            className="flex-shrink-0 p-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
            title="Archive task (hide from today onwards)"
          >
            <Trash2 size={14} />
          </button>
          {/* Quick Complete Button - marks current period as 100% */}
          {!isTaskCompleted(habit._id) && (
            <button
              onClick={() => handleQuickComplete(habit._id)}
              className="flex-shrink-0 p-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white transition-all hover:scale-110 shadow-lg"
              title={`Mark ${TIME_PERIODS[currentPeriod].name} as 100%`}
            >
              <CheckCircle2 size={14} />
            </button>
          )}
          {isTaskCompleted(habit._id) && (
            <span className="flex-shrink-0 p-1.5 text-green-400" title="Task completed!">
              <CheckCircle2 size={14} />
            </span>
          )}
        </div>

        {/* Task Type Badge */}
        <div className="w-16 flex-shrink-0 px-2 py-3 flex items-center justify-center">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            isDaily 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-green-500/20 text-green-400'
          }`}>
            {isDaily ? '📅' : '🔥'}
          </span>
        </div>

        {/* Time Period Cells */}
        <div className="flex-1 grid grid-cols-4 gap-2">
          {timePeriods.map((period) => {
            const percentage = getHabitProgress(habit._id, period.id);
            const isSelected = selectedCell?.habitId === habit._id && selectedCell?.period === period.id;
            const isCurrent = currentPeriod === period.id && isToday();
            const isLocked = isPeriodLocked(period.id);

            return (
              <div key={period.id} className="relative">
                <button
                  onClick={() => handleCellClick(habit._id, period.id)}
                  disabled={isLocked}
                  className={`w-full h-12 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCurrent ? 'ring-2 ring-white ring-opacity-30' : ''
                  } ${
                    isLocked 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-105 hover:ring-2 hover:ring-white hover:ring-opacity-50'
                  }`}
                  style={getCellStyle(percentage, period.color)}
                  title={isLocked ? 'Future time period - locked' : `Click to set ${period.name} progress`}
                >
                  {isLocked && percentage === 0 ? (
                    <Lock size={14} className="text-gray-500" />
                  ) : percentage === 100 ? (
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
                {isSelected && !isLocked && (() => {
                  const { disabled, options, message } = getAvailableOptions(habit._id, period.id);
                  
                  if (disabled) {
                    return (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50">
                        <div className="bg-primary-slate rounded-lg shadow-xl border border-gray-600 p-3 animate-fade-in text-center">
                          <div className="font-bold flex items-center justify-center gap-2 text-green-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {message}
                          </div>
                          <button
                            onClick={closeSelector}
                            className="w-full mt-2 p-1 text-xs text-gray-400 hover:text-white transition"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50">
                      <div className="bg-primary-slate rounded-lg shadow-xl border border-gray-600 p-2 animate-fade-in">
                        <div className="grid grid-cols-3 gap-1">
                          {PERCENTAGE_OPTIONS.map((pct) => {
                            const isAvailable = options.includes(pct);
                            return (
                              <button
                                key={pct}
                                onClick={() => isAvailable && handlePercentageSelect(pct)}
                                disabled={!isAvailable}
                                className={`p-2 rounded text-xs font-bold transition-all ${
                                  pct === percentage
                                    ? 'bg-accent-pink text-white'
                                    : isAvailable
                                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105'
                                      : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                                }`}
                                title={!isAvailable ? 'Must be >= current highest progress' : ''}
                              >
                                {pct === 100 ? '✓100' : `${pct}%`}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={closeSelector}
                          className="w-full mt-2 p-1 text-xs text-gray-400 hover:text-white transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })()}
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

      {/* Habit Rows - Separated by Task Type */}
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
          <>
            {/* ONGOING TASKS SECTION */}
            {ongoingTasks.length > 0 && (
              <>
                <div className="flex items-center gap-2 py-2 px-3 bg-green-500/10 rounded-lg mb-2">
                  <Flame size={16} className="text-green-400" />
                  <span className="text-green-400 text-sm font-bold">Ongoing Tasks</span>
                  <span className="text-green-400/60 text-xs">({ongoingTasks.length})</span>
                </div>
                {ongoingTasks.map((habit) => renderHabitRow(habit))}
              </>
            )}

            {/* TODAY ONLY TASKS SECTION */}
            {dailyTasks.length > 0 && (
              <>
                <div className="flex items-center gap-2 py-2 px-3 bg-blue-500/10 rounded-lg mb-2 mt-4">
                  <CalendarCheck size={16} className="text-blue-400" />
                  <span className="text-blue-400 text-sm font-bold">Today Only</span>
                  <span className="text-blue-400/60 text-xs">({dailyTasks.length})</span>
                </div>
                {dailyTasks.map((habit) => renderHabitRow(habit))}
              </>
            )}
          </>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={() => !isDeleting && setDeleteConfirm(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-primary-navy rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl animate-fade-in border border-amber-500/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <AlertTriangle size={24} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-white text-lg font-bold">Archive Task</h2>
                <p className="text-gray-400 text-sm">Hide from today onwards</p>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-6">
              Are you sure you want to archive <span className="text-white font-semibold">"{deleteConfirm.name}"</span>?
              <br />
              <span className="text-green-400 text-xs">✓ Task will still appear in past dates with its progress</span>
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>Archiving...</>
                ) : (
                  <><Trash2 size={16} /> Archive</>
                )}
              </button>
            </div>
          </div>
        </div>
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
          <div className="relative bg-primary-navy rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl animate-fade-in border border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Add New Task
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddHabit}>
              {/* Task Name */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Task Name</label>
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
              <div className="mb-4">
                <label className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Palette size={14} />
                  Choose Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {habitColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewHabitColor(color)}
                      className={`w-9 h-9 rounded-full transition-all flex items-center justify-center ${
                        newHabitColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-primary-navy scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {newHabitColor === color && (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Type Selection */}
              <div className="mb-4">
                <label className="block text-gray-400 text-sm mb-2">Task Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Ongoing Option */}
                  <button
                    type="button"
                    onClick={() => setNewTaskType('ongoing')}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      newTaskType === 'ongoing'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Flame size={16} className={newTaskType === 'ongoing' ? 'text-green-400' : 'text-gray-400'} />
                      <span className={`font-bold text-sm ${newTaskType === 'ongoing' ? 'text-green-400' : 'text-gray-300'}`}>
                        Ongoing
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">🔥 Daily with streaks</p>
                  </button>

                  {/* Today Only Option */}
                  <button
                    type="button"
                    onClick={() => setNewTaskType('daily')}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      newTaskType === 'daily'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarCheck size={16} className={newTaskType === 'daily' ? 'text-blue-400' : 'text-gray-400'} />
                      <span className={`font-bold text-sm ${newTaskType === 'daily' ? 'text-blue-400' : 'text-gray-300'}`}>
                        Today Only
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">📅 One-time task</p>
                  </button>
                </div>
              </div>

              {/* Task Type Info */}
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                newTaskType === 'ongoing' ? 'bg-green-500/10' : 'bg-blue-500/10'
              }`}>
                <Info size={16} className={newTaskType === 'ongoing' ? 'text-green-400' : 'text-blue-400'} />
                <span className={`text-sm ${newTaskType === 'ongoing' ? 'text-green-400' : 'text-blue-400'}`}>
                  {newTaskType === 'ongoing' 
                    ? 'Appears daily. Complete to build streaks!' 
                    : 'Only appears today. Gone tomorrow.'}
                </span>
              </div>

              {/* Preview */}
              <div className="mb-5 p-3 bg-primary-slate rounded-lg">
                <p className="text-gray-400 text-xs mb-2">Preview:</p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: newHabitColor }}></div>
                  <span className="text-white font-medium">{newHabitName || 'Your new task'}</span>
                  <span className="text-lg">{newTaskType === 'ongoing' ? '🔥' : '📅'}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newHabitName.trim()}
                  className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  <span>+</span> Add Task
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
