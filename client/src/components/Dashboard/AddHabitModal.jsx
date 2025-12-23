import React, { useState } from 'react';
import { useHabit } from '../../context/HabitContext';

/**
 * Add Task Modal Component
 */
const AddHabitModal = ({ isOpen, onClose }) => {
  const { addHabit } = useHabit();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Health',
    color: '#3b82f6',
    goal: 'Daily',
  });

  const categories = ['Health', 'Fitness', 'Learning', 'Productivity', 'Mindfulness', 'Finance', 'Social', 'Other'];
  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Yellow', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Orange', value: '#f97316' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addHabit(formData);
    if (result.success) {
      setFormData({ name: '', category: 'Health', color: '#3b82f6', goal: 'Daily' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-navy rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-accent-pink">Add New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Habit Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Exercise"
              className="w-full px-4 py-2 bg-primary-slate border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-pink"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-primary-slate border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-pink"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`h-10 rounded-lg transition ${
                    formData.color === color.value
                      ? 'ring-2 ring-white scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Goal Type
            </label>
            <div className="flex gap-2">
              {['Daily', 'Weekly', 'Monthly'].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal })}
                  className={`flex-1 py-2 rounded-lg transition ${
                    formData.goal === goal
                      ? 'bg-accent-pink text-white'
                      : 'bg-primary-slate text-gray-300 hover:bg-opacity-80'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-accent-pink hover:bg-accent-coral text-white rounded-lg transition"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
