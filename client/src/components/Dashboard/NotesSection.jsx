import React, { useState, useEffect } from 'react';
import { useHabit } from '../../context/HabitContext';
import { format } from 'date-fns';

/**
 * Notes Section Component - Daily View
 * Time-stamped notes with add functionality
 */
const NotesSection = () => {
  const { selectedDate, getFormattedDate, notes, saveNotes } = useHabit();
  const [noteText, setNoteText] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Sample notes for demonstration
  useEffect(() => {
    setNotesList([
      { id: 1, time: '9:00 AM', text: 'Started morning routine on time' },
      { id: 2, time: '12:30 PM', text: 'Completed reading session during lunch break' },
      { id: 3, time: '3:45 PM', text: 'Skipped afternoon walk due to rain - will make up tomorrow' },
    ]);
  }, [selectedDate]);

  const handleAddNote = () => {
    if (noteText.trim()) {
      const newNote = {
        id: Date.now(),
        time: format(new Date(), 'h:mm a'),
        text: noteText.trim(),
      };
      setNotesList([...notesList, newNote]);
      setNoteText('');
      setIsAdding(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    setNotesList(notesList.filter(note => note.id !== noteId));
  };

  return (
    <div className="bg-primary-navy rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <span>📝</span>
          DAILY NOTES
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">{getFormattedDate()}</span>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-accent-pink hover:text-pink-400 transition text-sm flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Note
          </button>
        </div>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <div className="mb-4 p-3 bg-primary-slate rounded-lg animate-fade-in">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="What happened? Any thoughts or observations..."
            className="w-full bg-primary-dark text-white p-3 rounded-lg border border-gray-600 focus:border-accent-pink focus:outline-none resize-none text-sm"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setNoteText('');
                setIsAdding(false);
              }}
              className="px-3 py-1 text-gray-400 hover:text-white text-sm transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              className="px-4 py-1 bg-accent-pink hover:bg-pink-600 text-white rounded-lg text-sm transition"
            >
              Add Note
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notesList.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl mb-2">📔</span>
          <p className="text-gray-400 text-sm mt-2">No notes for today</p>
          <p className="text-gray-500 text-xs mt-1">Click "Add Note" to record your thoughts</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {notesList.map((note) => (
            <div 
              key={note.id}
              className="flex items-start gap-3 p-3 bg-primary-slate rounded-lg group hover:bg-opacity-80 transition"
            >
              <div className="flex-shrink-0">
                <span className="text-accent-pink text-sm font-mono">{note.time}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">{note.text}</p>
              </div>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Add Suggestions */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-gray-400 text-xs mb-2">Quick add:</p>
        <div className="flex flex-wrap gap-2">
          {['Completed task early', 'Skipped due to work', 'Feeling motivated', 'Need improvement'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setNoteText(suggestion);
                setIsAdding(true);
              }}
              className="px-2 py-1 text-xs bg-primary-slate text-gray-400 hover:text-white hover:bg-gray-700 rounded transition"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesSection;
