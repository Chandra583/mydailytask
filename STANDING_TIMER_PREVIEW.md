# 🧍 Standing Timer - Visual Preview

## 📸 What It Looks Like

### Desktop View - Timer Ready
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏃 Standing Timer                            ☕ 0 stands today          │
│  Pomodoro-style health reminder                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ⚡ 15min  ⏱️ 30min  ⏰ 1hour  🕐 1.5hrs  🕑 2hours                      │
│    (Gray)   (Green)  (Gray)    (Gray)     (Gray)    ← Selected           │
│                                                                           │
│  ┌─────────┐  ┌─────────────────────────────────────────┐               │
│  │         │  │  ▶ Start                    ↻           │               │
│  │  30:00  │  │  (Green Button)        (Gray Button)   │               │
│  │         │  │                                          │               │
│  │   ○     │  │  Ready to start                         │               │
│  └─────────┘  └─────────────────────────────────────────┘               │
│   Circular                                                                │
│   Progress                                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### Timer Running
```
┌─────────────────────────────────────────────────────────────────────────┐
│  🏃 Standing Timer                            ☕ 0 stands today          │
│  Pomodoro-style health reminder                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ⚡ 15min  ⏱️ 30min  ⏰ 1hour  🕐 1.5hrs  🕑 2hours                      │
│           (Green - Active, others disabled)                               │
│                                                                           │
│  ┌─────────┐  ┌─────────────────────────────────────────┐               │
│  │    ╱    │  │  ⏸ Pause                    ↻           │               │
│  │  23:47  │  │  (Amber Button)        (Gray Button)   │               │
│  │    ╲    │  │                                          │               │
│  │   ●─    │  │  ● Timer running...                     │               │
│  └─────────┘  └─────────────────────────────────────────┘               │
│   Progress                                                                │
│   Ring 79%                                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### Timer Complete - Notification
```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────────────────┐          │
│  │  🔔  🧍 Time to Stand!                         Got it!    │ ← Popup  │
│  │      Take a break and stretch for your health             │          │
│  └───────────────────────────────────────────────────────────┘          │
│                                                                           │
│  🏃 Standing Timer                            ☕ 1 stand today  ← Count  │
│  Pomodoro-style health reminder                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ⚡ 15min  ⏱️ 30min  ⏰ 1hour  🕐 1.5hrs  🕑 2hours                      │
│                                                                           │
│  ┌─────────┐  ┌─────────────────────────────────────────┐               │
│  │         │  │  ▶ Start                    ↻           │               │
│  │  00:00  │  │  (Green Button)        (Gray Button)   │               │
│  │         │  │                                          │               │
│  │  (Red)  │  │  🔔 Time to stand!                      │               │
│  └─────────┘  └─────────────────────────────────────────┘               │
│   Complete!                                                               │
│   (Pulsing)                                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color States

### Timer States

| State | Circular Progress | Button | Status Text | Stand Counter |
|-------|------------------|--------|-------------|---------------|
| **Ready** | Gray ring | Green "Start" | Gray "Ready to start" | Current count |
| **Running** | Green ring (animated) | Amber "Pause" | Green "● Timer running..." | Current count |
| **Complete** | Red ring (pulsing) | Green "Start" | Red "🔔 Time to stand!" | Incremented! |

### Duration Pills

| State | Background | Text | Cursor |
|-------|-----------|------|--------|
| **Available** | Dark gray | Light gray | Pointer |
| **Selected** | Emerald green | White | Pointer |
| **Running** | Previous selection | Dimmed | Not allowed |

---

## 📱 Responsive Behavior

### Desktop (1440px+)
```
┌───────────────────────────────────────────────────────────┐
│  Header with user info and date                           │
├───────────────────────────────────────────────────────────┤
│  Welcome message, stats, view switcher                    │
├───────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐ │
│  │  🏃 STANDING TIMER - FULL WIDTH                     │ │
│  │  [Duration Pills] [Timer] [Controls]                │ │
│  └─────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────┤
│  Main dashboard content below...                          │
└───────────────────────────────────────────────────────────┘
```

### Tablet (768-1023px)
```
┌─────────────────────────────────────────┐
│  Header                                  │
├─────────────────────────────────────────┤
│  Welcome bar                             │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │  🏃 STANDING TIMER                  ││
│  │  [Dur Pills - Scrollable]           ││
│  │  [Timer] [Controls - Stacked]       ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Dashboard content...                    │
└─────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌───────────────────────┐
│  Header (Sticky)       │
├───────────────────────┤
│  Welcome               │
├───────────────────────┤
│  ┌─────────────────┐  │
│  │  🏃 Timer       │  │
│  │  [Pills ←→]     │  │ ← Horizontal scroll
│  │  ┌───┐ [Btns]  │  │
│  │  │Timer│        │  │
│  │  └───┘ [Reset] │  │
│  └─────────────────┘  │
├───────────────────────┤
│  Dashboard...          │
└───────────────────────┘
```

---

## 🎬 Animation States

### 1. Timer Starting
- Duration pill: Scale up (1.05x) + Pulse
- Start button: Color change green → amber
- Circular progress: Animate from 0%
- Status text: Fade in with pulsing dot

### 2. Timer Running
- Circular progress: Smooth countdown (1s intervals)
- Pulsing dot: Continuous pulse animation
- Progress ring: Gradual decrease

### 3. Timer Complete
- Circular progress: Flash red + pulse
- Notification: Slide down from top + bounce
- Bell icon: Bounce animation
- Audio: Beep sound (800Hz tone)
- Stand counter: +1 with brief scale animation

### 4. Notification Popup
- Entry: Slide down + bounce
- Background: Gradient emerald → teal
- Auto-dismiss: Fade out after 10s
- Manual dismiss: Fade out on "Got it!"

---

## 🔊 Audio Notification

### Sound Profile
```
Frequency: 800 Hz (pleasant tone)
Duration: 0.5 seconds
Type: Sine wave
Volume: 30% (non-intrusive)
Pattern: Single beep
```

### Trigger Conditions
- ✅ Timer completes (00:00)
- ✅ User interaction occurred (for autoplay)
- ❌ Not on pause
- ❌ Not on reset

---

## 🌐 Browser Notification

### Desktop Notification (if permitted)
```
┌────────────────────────────────┐
│  🧍 Time to Stand!             │
│  Take a break and stand up     │
│  for your health!              │
│                                 │
│  [icon: masha.png]             │
│  Daily Task Tracker            │
└────────────────────────────────┘
```

### Permission Flow
```
1. First timer start → Request permission
2. User clicks "Allow" → Permission granted
3. Future completions → Show notifications
4. User clicks "Block" → Visual/audio only
```

---

## 💾 localStorage Structure

### Storage Key: `standingTimer`
```json
{
  "duration": 30,
  "stands": 12
}
```

### Example Values
```javascript
// After 4 stands with 1-hour timer
{
  "duration": 60,    // Last selected: 1 hour
  "stands": 4        // Completed 4 stands today
}

// After 10 stands with 30-min timer
{
  "duration": 30,    // Last selected: 30 min
  "stands": 10       // Completed 10 stands today
}
```

---

## 🎯 User Flow

### First Time User
```
1. See timer component
   └→ Duration pills (30 min selected by default)
   
2. Click duration (e.g., "1 hour")
   └→ Timer resets to 60:00
   
3. Click "Start"
   └→ Browser asks for notification permission
   └→ Timer starts counting down
   
4. Wait for timer to complete
   └→ Notification appears
   └→ Audio beeps
   └→ Stand counter: 0 → 1
   
5. Auto-restart after 10 seconds
   └→ Timer resets and starts again
```

### Returning User
```
1. Page loads
   └→ Last duration restored (from localStorage)
   └→ Stand count restored
   └→ Timer in "ready" state
   
2. Click "Start" (no permission needed)
   └→ Timer runs immediately
   
3. Can pause/resume/reset anytime
   └→ Full control maintained
```

---

## 🎨 Design Tokens

### Colors
```css
--timer-primary: #10b981      /* Emerald green */
--timer-secondary: #14b8a6    /* Teal */
--timer-running: #f59e0b      /* Amber (pause button) */
--timer-complete: #ef4444     /* Red (alert) */
--timer-bg: rgba(16, 185, 129, 0.1)  /* Transparent emerald */
--timer-border: rgba(16, 185, 129, 0.2)  /* Border */
```

### Spacing
```css
--timer-padding: 1rem         /* Card padding */
--timer-gap: 1rem            /* Element spacing */
--timer-pill-gap: 0.5rem     /* Duration pill spacing */
```

### Typography
```css
--timer-title: 0.875rem, 600  /* Small, semibold */
--timer-time: 1.5rem, 700     /* Large, bold */
--timer-label: 0.75rem, 500   /* XS, medium */
```

### Border Radius
```css
--timer-card: 1rem           /* Main card */
--timer-pill: 0.75rem        /* Duration pills */
--timer-button: 0.75rem      /* Action buttons */
--timer-popup: 0.75rem       /* Notification */
```

---

## 📊 Component Hierarchy

```
<StandingTimer>
  ├─ Header Section
  │  ├─ Icon + Title
  │  └─ Stand Counter Badge
  │
  ├─ Duration Pills Row
  │  ├─ 15min (pill)
  │  ├─ 30min (pill) ← Selected
  │  ├─ 1hour (pill)
  │  ├─ 1.5hrs (pill)
  │  └─ 2hours (pill)
  │
  ├─ Timer Display Row
  │  ├─ Circular Progress
  │  │  ├─ Background circle (gray)
  │  │  ├─ Progress circle (green/red)
  │  │  └─ Time text (center)
  │  │
  │  └─ Controls Section
  │     ├─ Play/Pause Button
  │     ├─ Reset Button
  │     └─ Status Text
  │
  └─ Notification Popup (conditional)
     ├─ Bell Icon (animated)
     ├─ Message Text
     └─ Dismiss Button
</StandingTimer>
```

---

## ✨ Special Effects

### Glassmorphism
- Translucent background: `rgba(16, 185, 129, 0.1)`
- Backdrop blur: `blur(12px)`
- Border: `1px solid rgba(16, 185, 129, 0.2)`
- Shadow: `0 8px 32px rgba(0, 0, 0, 0.1)`

### Pulse Animation (Running State)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Bounce Animation (Notification)
```css
@keyframes bounce-in {
  0% { transform: translateY(100%); opacity: 0; }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); opacity: 1; }
}
```

### Scale Effect (Duration Select)
```css
transform: scale(1.05);
box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
```

---

## 🎊 Ready to Test!

Your Standing Timer is now live on the dashboard. Here's what to look for:

✅ **Visual Check:**
- Appears below welcome message
- Emerald green theme
- 5 duration pills visible
- Circular timer display
- Start/Reset buttons

✅ **Functionality Check:**
- Click duration → Timer resets
- Click Start → Timer counts down
- Click Pause → Timer stops
- Click Reset → Returns to selected duration
- Complete timer → Notification appears

✅ **Persistence Check:**
- Reload page → Duration persists
- Complete stand → Counter increments
- Reload page → Stand count persists

---

**Your health matters! Start standing today! 🧍‍♂️💪**
