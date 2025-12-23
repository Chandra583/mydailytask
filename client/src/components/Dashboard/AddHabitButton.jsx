import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { Plus, Sparkles, X, Check, Palette } from 'lucide-react';

/**
 * Floating Add Task Button with Modal
 * Modern 2025 design with Lucide icons and glassmorphism
 */
const AddHabitButton = () => {
  const { addHabit } = useHabit();
  const [isOpen, setIsOpen] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitColor, setHabitColor] = useState('#e91e63');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    });

    if (result.success) {
      setHabitName('');
      setHabitColor('#e91e63');
      setIsOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Floating Button - Fixed Bottom Right */}
      <div className="fixed bottom-8 right-8 z-[9999] group">
        {/* Tooltip Label - Shows on Hover */}
        <div className="absolute right-20 top-1/2 -translate-y-1/2 glass-card px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
          <span className="text-white text-sm font-medium whitespace-nowrap flex items-center gap-2">
            <Plus size={14} />
            Add New Task
          </span>
        </div>
        
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 btn-secondary rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-90 animate-bounce-in"
          style={{ 
            boxShadow: '0 0 40px rgba(233, 30, 99, 0.5)',
            background: 'linear-gradient(135deg, #e91e63 0%, #ec4899 100%)'
          }}
        >
          <Plus size={32} strokeWidth={2.5} />
        </button>
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
              <div className="mb-6">
                <label className="label-text mb-3 flex items-center gap-2">
                  <Palette size={14} />
                  Choose Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setHabitColor(color)}
                      className={`w-10 h-10 rounded-xl transition-all duration-300 flex items-center justify-center ${
                        habitColor === color 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: color,
                        boxShadow: habitColor === color ? `0 0 20px ${color}60` : 'none'
                      }}
                    >
                      {habitColor === color && <Check size={18} className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="mb-6 glass-card-light p-4 rounded-xl">
                <p className="label-text mb-2">Preview:</p>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-5 h-5 rounded-lg"
                    style={{ 
                      backgroundColor: habitColor,
                      boxShadow: `0 0 12px ${habitColor}40`
                    }}
                  ></div>
                  <span className="text-white font-medium">
                    {habitName || 'Your new task'}
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
