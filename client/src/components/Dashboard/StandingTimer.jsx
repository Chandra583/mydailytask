import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Bell, Activity } from 'lucide-react';

/**
 * Standing Timer - Liquid Fill Animation
 * Visual metaphor: A bottle that drains as time passes
 * Timer is centered with large, clear typography
 */
const StandingTimer = () => {
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [showNotification, setShowNotification] = useState(false);
  const [totalStands, setTotalStands] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  const durations = [
    { value: 15, label: '15m' },
    { value: 30, label: '30m' },
    { value: 60, label: '1h' },
    { value: 90, label: '1.5h' },
    { value: 120, label: '2h' },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('standingTimer');
    if (saved) {
      try {
        const { duration, stands } = JSON.parse(saved);
        if (duration) {
          setSelectedDuration(duration);
          setTimeRemaining(duration * 60);
        }
        if (stands) setTotalStands(stands);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('standingTimer', JSON.stringify({
      duration: selectedDuration,
      stands: totalStands
    }));
  }, [selectedDuration, totalStands]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(true);
    setShowNotification(true);
    setTotalStands(prev => prev + 1);
    playNotificationSound();
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🧍 Time to Stand!', {
        body: 'Take a break and stand up for your health!',
        icon: '/masha.png',
        tag: 'standing-timer'
      });
    }
    
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotification(false);
      setIsCompleted(false);
      handleReset();
      setIsRunning(true);
    }, 8000);
  }, []);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {}
  };

  const handleToggle = () => {
    if (!isRunning && timeRemaining === 0) {
      setTimeRemaining(selectedDuration * 60);
      setIsCompleted(false);
    }
    setIsRunning(!isRunning);
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(selectedDuration * 60);
    setShowNotification(false);
    setIsCompleted(false);
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
  };

  const handleDurationChange = (newDuration) => {
    if (isRunning) return;
    setSelectedDuration(newDuration);
    setTimeRemaining(newDuration * 60);
    setShowNotification(false);
    setIsCompleted(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate fill percentage - THIS IS THE KEY FIX
  // When timer starts (e.g., 15:00), fillPercentage = 100%
  // As time passes (e.g., 7:30), fillPercentage = 50%
  // When time ends (0:00), fillPercentage = 0%
  const totalSeconds = selectedDuration * 60;
  const fillPercentage = (timeRemaining / totalSeconds) * 100;

  return (
    <>
      <div className="relative">
        {/* Focus Card - Premium Glassmorphism */}
        <div className={`
          relative overflow-hidden rounded-2xl
          transition-all duration-300
          ${isRunning 
            ? 'focus-card-active' 
            : isCompleted
              ? 'focus-card-complete'
              : 'focus-card'
          }
        `}>
          {/* Liquid Fill Container - Bottle Draining Effect */}
          <div className="relative h-32 overflow-hidden">
            {/* Background gradient (empty state) */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 via-slate-800/20 to-slate-900/40"></div>
            
            {/* Liquid fill - drains from top as time passes */}
            <div 
              className={`
                absolute bottom-0 left-0 right-0 
                transition-all duration-1000 ease-linear
                ${isCompleted 
                  ? 'liquid-fill-complete' 
                  : isRunning 
                    ? 'liquid-fill-active' 
                    : 'liquid-fill-idle'
                }
              `}
              style={{ 
                height: `${fillPercentage}%`,
              }}
            >
              {/* Wave effect on top of liquid */}
              {fillPercentage > 0 && (
                <div className={`
                  absolute top-0 left-0 right-0 h-3
                  ${isRunning ? 'animate-wave' : ''}
                `}>
                  <svg className="w-full h-full" viewBox="0 0 1200 10" preserveAspectRatio="none">
                    <path
                      d="M0,5 Q300,0 600,5 T1200,5 L1200,10 L0,10 Z"
                      className={isCompleted ? 'fill-pink-400/30' : isRunning ? 'fill-cyan-400/30' : 'fill-slate-400/30'}
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Timer Display - Centered, Large Typography */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <div className={`
                text-6xl font-black tabular-nums tracking-tighter
                transition-all duration-300
                ${isCompleted 
                  ? 'timer-text-complete' 
                  : isRunning 
                    ? 'timer-text-active' 
                    : 'timer-text-idle'
                }
              `}
              style={{
                fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
                fontWeight: 900,
                letterSpacing: '-0.05em',
                textShadow: '0 2px 20px rgba(0,0,0,0.5), 0 0 40px rgba(255,255,255,0.1)'
              }}>
                {formatTime(timeRemaining)}
              </div>
              
              {/* Status label below timer */}
              <div className="mt-2 text-xs font-semibold uppercase tracking-wider opacity-70">
                {isRunning ? (
                  <span className="text-cyan-400 animate-pulse">Focus Active</span>
                ) : isCompleted ? (
                  <span className="text-pink-400 animate-pulse">Complete!</span>
                ) : (
                  <span className="text-slate-400">Ready</span>
                )}
              </div>
            </div>

            {/* Header - Overlaid on liquid */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-20">
              <div className="flex items-center gap-2.5">
                <div className={`
                  w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
                  backdrop-blur-md
                  ${isRunning 
                    ? 'bg-cyan-500/20 border border-cyan-400/40 shadow-lg shadow-cyan-500/20' 
                    : isCompleted
                      ? 'bg-pink-500/20 border border-pink-400/40 shadow-lg shadow-pink-500/20'
                      : 'bg-slate-700/40 border border-slate-600/30'
                  }
                `}>
                  <Activity 
                    size={16} 
                    className={`transition-colors ${
                      isRunning ? 'text-cyan-300' : isCompleted ? 'text-pink-300' : 'text-slate-400'
                    }`} 
                  />
                </div>
                <div className="backdrop-blur-sm">
                  <h3 className="text-white font-bold text-sm tracking-tight drop-shadow-lg">Standing Timer</h3>
                  <p className="text-slate-300 text-[10px] font-medium drop-shadow">Health reminder</p>
                </div>
              </div>
              
              {/* Stand Counter */}
              {totalStands > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 backdrop-blur-md shadow-lg">
                  <div className="w-1 h-1 rounded-full bg-cyan-300 animate-pulse"></div>
                  <span className="text-cyan-300 text-[10px] font-bold tabular-nums drop-shadow">
                    {totalStands}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Controls Section - Below liquid container */}
          <div className="p-4 bg-slate-800/30 backdrop-blur-sm border-t border-slate-700/30">
            <div className="flex items-center justify-between gap-3">
              
              {/* Duration Presets - Segmented Control */}
              <div className="flex-1 flex items-center gap-1.5">
                <div className="inline-flex items-center gap-1 p-1 bg-slate-800/60 rounded-xl border border-slate-700/40 backdrop-blur-sm">
                  {durations.map((dur) => {
                    const isSelected = selectedDuration === dur.value;
                    const isDisabled = isRunning && !isSelected;
                    
                    return (
                      <button
                        key={dur.value}
                        onClick={() => handleDurationChange(dur.value)}
                        disabled={isDisabled}
                        className={`
                          relative px-3 py-1.5 rounded-lg text-[11px] font-semibold
                          transition-all duration-200 whitespace-nowrap
                          ${isSelected
                            ? 'bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/30 scale-105'
                            : 'text-slate-400 hover:text-slate-300'
                          }
                          ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                          ${!isDisabled && !isSelected ? 'hover:bg-slate-700/40 hover:-translate-y-0.5' : ''}
                        `}
                      >
                        {dur.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {/* Primary CTA - Start/Pause */}
                <button
                  onClick={handleToggle}
                  className={`
                    relative flex items-center justify-center gap-2 
                    px-5 py-2.5 rounded-xl font-semibold text-xs
                    transition-all duration-200 
                    overflow-hidden group
                    ${isRunning
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50'
                      : isCompleted
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50'
                        : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50'
                    }
                    hover:scale-105 active:scale-95
                  `}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  
                  {isRunning ? (
                    <>
                      <Pause size={14} className="fill-current relative z-10" />
                      <span className="relative z-10">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} className="fill-current ml-0.5 relative z-10" />
                      <span className="relative z-10">Start</span>
                    </>
                  )}
                </button>

                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-slate-700/40 hover:bg-slate-700/60 text-slate-400 hover:text-slate-300 transition-all duration-200 border border-slate-600/30 hover:border-slate-600/50 hover:-translate-y-0.5 active:scale-95"
                  title="Reset Timer"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {showNotification && (
          <div className="absolute top-0 left-0 right-0 -translate-y-full mb-3 z-50 animate-slide-down">
            <div className="bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500 rounded-2xl p-4 shadow-2xl border border-white/20 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce-gentle flex-shrink-0">
                  <Bell size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-base mb-0.5">🧍 Time to Stand!</h4>
                  <p className="text-white/90 text-sm">Take a break and stretch for your health</p>
                </div>
                <button
                  onClick={() => {
                    setShowNotification(false);
                    if (notificationTimeoutRef.current) {
                      clearTimeout(notificationTimeoutRef.current);
                    }
                    handleReset();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-sm transition-all flex-shrink-0 hover:scale-105 active:scale-95"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .focus-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
        }
        
        .focus-card-active {
          background: linear-gradient(180deg, rgba(6, 182, 212, 0.03), rgba(255,255,255,0.01));
          backdrop-filter: blur(14px);
          border: 1px solid rgba(6, 182, 212, 0.2);
          box-shadow: 0 8px 32px 0 rgba(6, 182, 212, 0.15);
        }
        
        .focus-card-complete {
          background: linear-gradient(180deg, rgba(236, 72, 153, 0.03), rgba(255,255,255,0.01));
          backdrop-filter: blur(14px);
          border: 1px solid rgba(236, 72, 153, 0.2);
          box-shadow: 0 8px 32px 0 rgba(236, 72, 153, 0.15);
        }

        /* Liquid fill gradients - MATCHING DASHBOARD COLORS */
        .liquid-fill-idle {
          background: linear-gradient(180deg, 
            rgba(100, 116, 139, 0.3) 0%, 
            rgba(71, 85, 105, 0.4) 50%,
            rgba(51, 65, 85, 0.5) 100%
          );
        }

        /* Cyan/Teal gradient - matches your dashboard's Morning/Cyan theme */
        .liquid-fill-active {
          background: linear-gradient(180deg, 
            rgba(6, 182, 212, 0.5) 0%, 
            rgba(14, 165, 233, 0.6) 30%,
            rgba(8, 145, 178, 0.7) 60%,
            rgba(21, 94, 117, 0.8) 100%
          );
          box-shadow: 
            inset 0 2px 30px rgba(6, 182, 212, 0.4),
            0 -2px 40px rgba(6, 182, 212, 0.3);
        }

        .liquid-fill-complete {
          background: linear-gradient(180deg, 
            rgba(236, 72, 153, 0.4) 0%, 
            rgba(219, 39, 119, 0.5) 50%,
            rgba(190, 24, 93, 0.6) 100%
          );
          box-shadow: 
            inset 0 2px 20px rgba(236, 72, 153, 0.3),
            0 -2px 30px rgba(236, 72, 153, 0.2);
        }

        /* Timer text styles */
        .timer-text-idle {
          color: #cbd5e1;
        }

        .timer-text-active {
          color: #ffffff;
          text-shadow: 
            0 0 20px rgba(6, 182, 212, 0.6),
            0 0 40px rgba(6, 182, 212, 0.4),
            0 2px 20px rgba(0, 0, 0, 0.5);
        }

        .timer-text-complete {
          background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 2px 20px rgba(236, 72, 153, 0.3);
        }

        /* Wave animation */
        @keyframes wave {
          0% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-25%) translateY(-2px);
          }
          100% {
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }

        @keyframes slide-down {
          0% {
            transform: translateY(-20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 1s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default StandingTimer;
