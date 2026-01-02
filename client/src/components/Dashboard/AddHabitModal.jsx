import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { Sparkles, CalendarCheck, Flame, Calendar, Info } from 'lucide-react';

/**
 * Add Task Modal Component
 * Supports two task types:
 * - Ongoing: Shows every day from creation until archived (has streak tracking)
 * - Daily: Only for the specific day, won't appear tomorrow
 */
const AddHabitModal = ({ isOpen, onClose }) => {
  const { addHabit, getFormattedDate } = useHabit();
  const [formData, setFormData] = useState({
    name: '',
    color: '#ef4444',
    taskType: 'ongoing', // 'ongoing' or 'daily'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#fbbf24', // Yellow/Amber
    '#84cc16', // Lime
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#ec4899', // Pink
    '#14b8a6', // Teal
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    const result = await addHabit({
      name: formData.name,
      color: formData.color,
      taskType: formData.taskType,
    });
    
    if (result.success) {
      setFormData({ name: '', color: '#ef4444', taskType: 'ongoing' });
      onClose();
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-primary-navy rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-700/50">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles size={20} className="text-accent-pink" />
            Add New Task
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition p-1 hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Task Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Drink 8 glasses of water"
              className="w-full px-4 py-3 bg-primary-slate border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-transparent transition"
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: formData.color }}></span>
              Choose Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`h-10 rounded-xl transition-all duration-200 ${
                    formData.color === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-primary-navy scale-110'
                      : 'hover:scale-105 hover:opacity-80'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Task Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Task Type
            </label>
            <div className="space-y-3">
              {/* Ongoing Task Option */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, taskType: 'ongoing' })}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  formData.taskType === 'ongoing'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-600 hover:border-gray-500 bg-primary-slate/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    formData.taskType === 'ongoing' ? 'bg-green-500/20' : 'bg-gray-700'
                  }`}>
                    <Flame size={20} className={formData.taskType === 'ongoing' ? 'text-green-400' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        formData.taskType === 'ongoing' ? 'text-green-400' : 'text-gray-300'
                      }`}>
                        Ongoing Task
                      </span>
                      {formData.taskType === 'ongoing' && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      🔥 Continues daily until you delete it. Complete every day to build streaks!
                    </p>
                  </div>
                </div>
              </button>

              {/* Daily Task Option */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, taskType: 'daily' })}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  formData.taskType === 'daily'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500 bg-primary-slate/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    formData.taskType === 'daily' ? 'bg-blue-500/20' : 'bg-gray-700'
                  }`}>
                    <CalendarCheck size={20} className={formData.taskType === 'daily' ? 'text-blue-400' : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        formData.taskType === 'daily' ? 'text-blue-400' : 'text-gray-300'
                      }`}>
                        Today Only
                      </span>
                      {formData.taskType === 'daily' && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      📅 One-time task for today only. Won't appear tomorrow.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Info Message */}
          <div className={`p-3 rounded-xl flex items-start gap-2 ${
            formData.taskType === 'ongoing' 
              ? 'bg-green-900/20 border border-green-700/30' 
              : 'bg-blue-900/20 border border-blue-700/30'
          }`}>
            <Info size={16} className={formData.taskType === 'ongoing' ? 'text-green-400 mt-0.5' : 'text-blue-400 mt-0.5'} />
            <p className={`text-xs ${
              formData.taskType === 'ongoing' ? 'text-green-300' : 'text-blue-300'
            }`}>
              {formData.taskType === 'ongoing' 
                ? 'This task will appear every day starting today. Complete it daily to build your streak!'
                : `This task is only for today (${getFormattedDate()}) and won't appear tomorrow.`
              }
            </p>
          </div>

          {/* Preview */}
          <div className="p-3 bg-primary-slate/50 rounded-xl">
            <p className="text-gray-400 text-xs mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: formData.color }}
              ></div>
              <span className="text-white font-medium">
                {formData.name || 'Your new task'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                formData.taskType === 'ongoing' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {formData.taskType === 'ongoing' ? '🔥 Ongoing' : '📅 Today'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1 py-3 px-4 bg-accent-pink hover:bg-accent-coral text-white rounded-xl transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>+</span>
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
