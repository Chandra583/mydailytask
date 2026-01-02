import React, { useState, useEffect, useCallback } from 'react';
import { useHabit } from '../../context/HabitContext';
import { Plus, Sparkles, X, Check, Palette, Command, Flame, CalendarCheck, Info } from 'lucide-react';

/**
 * Floating Add Task Button with Modal
 * Supports two task types:
 * - Ongoing: Shows every day from creation until archived (has streak tracking)
 * - Daily: Only for the specific day, won't appear tomorrow
 */
const AddHabitButton = () => {
  const { addHabit, getFormattedDate } = useHabit();
  const [isOpen, setIsOpen] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitColor, setHabitColor] = useState('#e91e63');
  const [taskType, setTaskType] = useState('ongoing'); // 'ongoing' or 'daily'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keyboard shortcut: Ctrl+N to open
  const handleKeyDown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      setIsOpen(true);
    }
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const colors = [
    '#e91e63', '#06b6d4', '#f59e0b', '#f97316', '#8b5cf6',
    '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#a855f7',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    setIsSubmitting(true);
    const result = await addHabit({
      name: habitName.trim(),
      color: habitColor,
      taskType: taskType,
    });

    if (result.success) {
      setHabitName('');
      setHabitColor('#e91e63');
      setTaskType('ongoing');
      setIsOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Floating Button - Fixed Bottom Right - IMPROVED VISIBILITY */}
      <div className="fixed bottom-8 right-8 z-[9999] group">
        {/* Tooltip Label with Keyboard Shortcut - Always Visible Hint */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2">
          <div className="bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-700/50 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
            <span className="text-white text-sm font-medium whitespace-nowrap flex items-center gap-2">
              Add New Task
            </span>
            <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
              <Command size={10} />
              <span>Ctrl+N</span>
            </div>
          </div>
        </div>
        
        {/* Pulsing Ring Effect */}
        <div className="absolute inset-0 rounded-2xl bg-pink-500/30 animate-ping" style={{ animationDuration: '2s' }} />
        
        {/* Main Button - LARGER with bounce animation */}
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 animate-bounce-subtle"
          style={{ 
            boxShadow: '0 0 50px rgba(233, 30, 99, 0.6), 0 0 100px rgba(233, 30, 99, 0.3)',
            background: 'linear-gradient(135deg, #e91e63 0%, #ec4899 100%)'
          }}
          title="Add New Task (Ctrl+N)"
        >
          <Plus size={32} strokeWidth={2.5} className="text-white" />
        </button>
        
        {/* Keyboard shortcut badge */}
        <div className="absolute -top-2 -right-2 bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-md border border-slate-700 shadow-lg">
          ⌘N
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative glass-card p-6 w-full max-w-md shadow-2xl animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 btn-icon w-8 h-8"
            >
              <X size={16} />
            </button>

            <h2 className="text-white text-xl font-bold mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-pink/20 flex items-center justify-center">
                <Sparkles size={20} className="text-accent-pink" />
              </div>
              Add New Task
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Habit Name */}
              <div className="mb-5">
                <label className="label-text mb-2 block">Task Name</label>
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="e.g., Drink 8 glasses of water"
                  className="input-modern w-full"
                  autoFocus
                />
              </div>

              {/* Color Selection */}
              <div className="mb-4">
                <label className="label-text mb-2 flex items-center gap-2">
                  <Palette size={14} />
                  Choose Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setHabitColor(color)}
                      className={`w-9 h-9 rounded-xl transition-all duration-300 flex items-center justify-center ${
                        habitColor === color 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: color,
                        boxShadow: habitColor === color ? `0 0 20px ${color}60` : 'none'
                      }}
                    >
                      {habitColor === color && <Check size={14} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Type Selection */}
              <div className="mb-4">
                <label className="label-text mb-2">Task Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Ongoing Option */}
                  <button
                    type="button"
                    onClick={() => setTaskType('ongoing')}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      taskType === 'ongoing'
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-primary-slate/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Flame size={16} className={taskType === 'ongoing' ? 'text-green-400' : 'text-gray-400'} />
                      <span className={`font-medium text-sm ${
                        taskType === 'ongoing' ? 'text-green-400' : 'text-gray-300'
                      }`}>
                        Ongoing
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">
                      🔥 Daily with streaks
                    </p>
                  </button>

                  {/* Daily Option */}
                  <button
                    type="button"
                    onClick={() => setTaskType('daily')}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      taskType === 'daily'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-primary-slate/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarCheck size={16} className={taskType === 'daily' ? 'text-blue-400' : 'text-gray-400'} />
                      <span className={`font-medium text-sm ${
                        taskType === 'daily' ? 'text-blue-400' : 'text-gray-300'
                      }`}>
                        Today Only
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">
                      📅 One-time task
                    </p>
                  </button>
                </div>
              </div>

              {/* Info Message */}
              <div className={`p-2 rounded-lg flex items-start gap-2 mb-4 ${
                taskType === 'ongoing' 
                  ? 'bg-green-900/20 border border-green-700/30' 
                  : 'bg-blue-900/20 border border-blue-700/30'
              }`}>
                <Info size={14} className={taskType === 'ongoing' ? 'text-green-400 mt-0.5' : 'text-blue-400 mt-0.5'} />
                <p className={`text-xs ${
                  taskType === 'ongoing' ? 'text-green-300' : 'text-blue-300'
                }`}>
                  {taskType === 'ongoing' 
                    ? 'Appears daily. Complete to build streaks!'
                    : `Only for today (${getFormattedDate()}).`
                  }
                </p>
              </div>

              {/* Preview */}
              <div className="mb-4 glass-card-light p-3 rounded-xl">
                <p className="label-text mb-1 text-xs">Preview:</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-lg"
                    style={{ 
                      backgroundColor: habitColor,
                      boxShadow: `0 0 12px ${habitColor}40`
                    }}
                  ></div>
                  <span className="text-white font-medium text-sm">
                    {habitName || 'Your new task'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    taskType === 'ongoing' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {taskType === 'ongoing' ? '🔥' : '📅'}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-ghost flex-1 py-3 justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !habitName.trim()}
                  className="btn-secondary flex-1 py-3 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddHabitButton;
