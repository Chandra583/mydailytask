import React from 'react';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod } from '../../context/HabitContext';
import { 
  Activity, 
  Sun, 
  Sunrise, 
  Sunset,
  TrendingUp
} from 'lucide-react';

// Map icons for each circle
const CIRCLE_ICONS = {
  daily: Activity,
  morning: Sun,
  afternoon: Sunrise,
  evening: Sunset,
};

/**
 * Modern Progress Ring Component
 * Custom SVG-based progress ring with gradient and glow effects
 */
const ModernProgressRing = ({ percentage, color, gradientId, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg 
        className="progress-ring" 
        width={size} 
        height={size}
        style={{ 
          filter: `drop-shadow(0 0 12px ${color}60)`,
          transform: 'rotate(-90deg)'
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div 
        className="progress-center"
        style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}
      >
        <div 
          className="progress-value font-bold tracking-tight"
          style={{ 
            fontSize: size > 100 ? '28px' : '22px',
            fontVariantNumeric: 'tabular-nums',
            color: 'white',
            letterSpacing: '-0.02em'
          }}
        >
          {percentage}%
        </div>
      </div>
    </div>
  );
};

/**
 * Progress Circles Component - Daily View
 * Modern2026 design with animated SVG rings
 */
const ProgressCircles = () => {
  const { dailyStats } = useHabit();
  const currentPeriod = getCurrentTimePeriod();

  const progressData = [
    {
      id: 'daily',
      title: 'DAILY',
      subtitle: 'Overall Today',
      percentage: dailyStats?.overall || 0,
      color: '#e91e63',
      secondaryColor: '#ec4899',
    },
    {
      id: 'morning',
      title: 'MORNING',
      subtitle: '6 AM - 12 PM',
      percentage: dailyStats?.morning || 0,
      color: TIME_PERIODS.morning.color,
      secondaryColor: '#22d3ee',
    },
    {
      id: 'afternoon',
      title: 'AFTERNOON',
      subtitle: '12 PM - 6 PM',
      percentage: dailyStats?.afternoon || 0,
      color: TIME_PERIODS.afternoon.color,
      secondaryColor: '#fbbf24',
    },
    {
      id: 'evening',
      title: 'EVENING',
      subtitle: '6 PM - 10 PM',
      percentage: dailyStats?.evening || 0,
      color: TIME_PERIODS.evening.color,
      secondaryColor: '#fb923c',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
      {progressData.map((item, index) => {
        const Icon = CIRCLE_ICONS[item.id];
        const isActive = item.id !== 'daily' && currentPeriod === item.id;
        
        return (
          <div 
            key={index} 
            className={`glass-card flex flex-col items-center p-5 transition-all duration-300 hover-lift stagger-item ${
              isActive ? 'ring-2 ring-white/30' : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Icon Badge */}
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all"
              style={{ 
                backgroundColor: `${item.color}25`,
                boxShadow: isActive ? `0 0 20px ${item.color}40` : 'none'
              }}
            >
              <Icon size={20} style={{ color: item.color }} />
            </div>
            
            {/* Modern Progress Ring */}
            <ModernProgressRing 
              percentage={item.percentage}
              color={item.color}
              gradientId={`gradient-${item.id}`}
              size={110}
              strokeWidth={10}
            />

            {/* Title & Subtitle */}
            <div className="text-center mt-4">
              <h3 className="text-white text-sm font-bold tracking-wide">
                {item.title}
              </h3>
              <p className="label-text text-xs mt-1">
                {item.subtitle}
              </p>
            </div>

            {/* Active indicator */}
            {isActive && (
              <div className="mt-3 badge-info text-[10px]">
                <TrendingUp size={10} />
                ACTIVE NOW
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressCircles;
