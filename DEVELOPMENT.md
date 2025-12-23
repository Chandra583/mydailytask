# Development Guide

## 🛠️ Adding New Features

### Adding a New Component

1. **Create the component file:**
```jsx
// client/src/components/YourComponent/NewComponent.jsx
import React from 'react';

const NewComponent = () => {
  return (
    <div className="bg-primary-navy rounded-lg p-6">
      {/* Your component content */}
    </div>
  );
};

export default NewComponent;
```

2. **Import and use in Dashboard:**
```jsx
import NewComponent from '../components/YourComponent/NewComponent';

// In Dashboard.jsx
<NewComponent />
```

---

### Adding a New API Endpoint

1. **Create controller function:**
```javascript
// server/controllers/yourController.js
const yourFunction = async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true, data: yourData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { yourFunction };
```

2. **Create route:**
```javascript
// server/routes/yourRoutes.js
const express = require('express');
const router = express.Router();
const { yourFunction } = require('../controllers/yourController');
const { protect } = require('../middleware/auth');

router.get('/', protect, yourFunction);

module.exports = router;
```

3. **Register route in server.js:**
```javascript
const yourRoutes = require('./routes/yourRoutes');
app.use('/api/your-endpoint', yourRoutes);
```

4. **Call from frontend:**
```javascript
const response = await api.get('/your-endpoint');
```

---

## 📊 Database Operations

### Adding a New Field to Habit Model

```javascript
// server/models/Habit.js
habitSchema.add({
  newField: {
    type: String,
    default: 'default value'
  }
});
```

### Creating a New Model

```javascript
// server/models/NewModel.js
const mongoose = require('mongoose');

const newSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Your fields here
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NewModel', newSchema);
```

---

## 🎨 Styling Guide

### Using Tailwind Classes

```jsx
// Background colors
<div className="bg-primary-dark">       // Main background
<div className="bg-primary-navy">       // Card background
<div className="bg-primary-slate">      // Input/hover background

// Text colors
<span className="text-accent-pink">    // Primary accent
<span className="text-white">          // Main text
<span className="text-gray-400">       // Secondary text

// Week colors (for habit grid)
<div className="bg-week-1">  // Blue
<div className="bg-week-2">  // Green
<div className="bg-week-3">  // Purple
<div className="bg-week-4">  // Yellow
<div className="bg-week-5">  // Red
```

### Custom Animations

```css
/* Add to index.css */
@keyframes yourAnimation {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.your-class {
  animation: yourAnimation 0.3s ease-in-out;
}
```

---

## 🔒 Authentication

### Protected API Calls

All authenticated requests automatically include the JWT token via interceptor:

```javascript
// Automatically adds: Authorization: Bearer <token>
const response = await api.get('/protected-endpoint');
```

### Adding Admin-Only Routes

1. **Create admin middleware:**
```javascript
// server/middleware/admin.js
const admin = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};
```

2. **Use in routes:**
```javascript
router.delete('/:id', protect, admin, deleteFunction);
```

---

## 📈 State Management

### Adding to Habit Context

```jsx
// client/src/context/HabitContext.jsx

// Add state
const [newState, setNewState] = useState(null);

// Add function
const newFunction = async () => {
  try {
    const response = await api.get('/your-endpoint');
    setNewState(response.data);
    return { success: true };
  } catch (error) {
    toast.error('Error message');
    return { success: false };
  }
};

// Add to value object
const value = {
  // ... existing values
  newState,
  newFunction,
};
```

### Using the Context

```jsx
import { useHabit } from '../context/HabitContext';

const YourComponent = () => {
  const { newState, newFunction } = useHabit();
  
  // Use them
};
```

---

## 🧪 Testing

### Backend Testing Example

```javascript
// server/tests/habit.test.js
const request = require('supertest');
const app = require('../server');

describe('Habit API', () => {
  let token;

  beforeAll(async () => {
    // Login and get token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test123' });
    token = res.body.token;
  });

  test('Should create a new habit', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Habit' });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Habit');
  });
});
```

### Frontend Testing Example

```jsx
// client/src/components/__tests__/HabitGrid.test.jsx
import { render, screen } from '@testing-library/react';
import HabitGrid from '../Dashboard/HabitGrid';
import { HabitProvider } from '../../context/HabitContext';

test('renders habit grid', () => {
  render(
    <HabitProvider>
      <HabitGrid />
    </HabitProvider>
  );
  const element = screen.getByText(/Daily Habits/i);
  expect(element).toBeInTheDocument();
});
```

---

## 🚀 Performance Optimization

### Backend Optimization

```javascript
// Add indexing to models
habitSchema.index({ userId: 1, createdAt: -1 });

// Use lean() for read-only queries
const habits = await Habit.find({ userId }).lean();

// Select only needed fields
const habits = await Habit.find({ userId }).select('name category color');
```

### Frontend Optimization

```jsx
// Use React.memo for components that don't change often
const HabitCell = React.memo(({ habit, day }) => {
  return <div>{/* Cell content */}</div>;
});

// Use useMemo for expensive calculations
const chartData = useMemo(() => {
  return processData(habits, progressData);
}, [habits, progressData]);

// Use useCallback for functions passed to children
const handleClick = useCallback((id) => {
  toggleHabit(id);
}, [toggleHabit]);
```

---

## 🌐 Deployment Checklist

### Backend (Render/Railway/Heroku)

- [ ] Set all environment variables
- [ ] Update CORS origins for production
- [ ] Set `NODE_ENV=production`
- [ ] Configure MongoDB Atlas connection
- [ ] Enable error logging
- [ ] Set up health check endpoint

### Frontend (Vercel/Netlify)

- [ ] Update `VITE_API_URL` to production backend
- [ ] Build and test locally: `npm run build`
- [ ] Configure redirects for SPA
- [ ] Enable HTTPS
- [ ] Set up custom domain (optional)

### MongoDB Atlas Setup

1. Create cluster
2. Create database user
3. Whitelist IP addresses (or allow all: 0.0.0.0/0)
4. Get connection string
5. Update `MONGODB_URI` in environment variables

---

## 📝 Code Style Guide

### Naming Conventions

```javascript
// Components: PascalCase
const HabitGrid = () => {};

// Functions: camelCase
const fetchHabits = () => {};

// Constants: UPPER_SNAKE_CASE
const MAX_HABITS = 100;

// Files: PascalCase for components, camelCase for utilities
HabitGrid.jsx
dateUtils.js
```

### File Organization

```
Component files should be organized by feature:

components/
  Dashboard/
    DashboardHeader.jsx
    HabitGrid.jsx
    NotesSection.jsx
  Sidebar/
    ActiveStreaks.jsx
    SmartCalendar.jsx
```

---

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed
**Solution:** Check MongoDB is running, verify connection string

### Issue: CORS Error
**Solution:** Ensure backend CORS is configured for frontend URL

### Issue: Token Expired
**Solution:** Implement token refresh logic or increase expiry

### Issue: Port Already in Use
**Solution:** Change PORT in .env or kill the process

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts Documentation](https://recharts.org)

---

**Happy Development! 🚀**
