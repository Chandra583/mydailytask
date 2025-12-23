# Monthly Habit Tracker Dashboard - MERN Stack

A full-stack habit tracking dashboard application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). Track your daily habits with a beautiful dark-themed interface featuring heat maps, progress charts, and comprehensive analytics.

![Habit Tracker Dashboard](https://via.placeholder.com/1200x600/0a0e27/e91e63?text=Monthly+Habit+Tracker+Dashboard)

## ✨ Features

### 📊 Dashboard & Analytics
- **Progress Circles**: Real-time monthly, weekly, and daily progress indicators
- **Heat Map Grid**: Visual habit completion tracker with color-coded weeks
- **Line Charts**: Daily progress trends over the month
- **Bar Charts**: Top 5 most completed habits
- **Streak Tracking**: Active streak counter for each habit
- **Smart Calendar**: Current date highlighting and navigation

### 🎯 Habit Management
- Create, edit, and delete habits
- Custom colors and categories for habits
- Set daily, weekly, or monthly goals
- One-click habit completion toggle
- Habit reordering and organization

### 📈 Statistics & Insights
- Monthly completion percentages
- Weekly progress tracking
- Daily achievement metrics
- Longest and current streaks
- Completion trends and patterns

### 📝 Additional Features
- Monthly notes section
- User authentication (JWT-based)
- Responsive design (mobile, tablet, desktop)
- Dark theme optimized for eye comfort
- Real-time data synchronization

## 🚀 Tech Stack

### Frontend
- **React 18** with Hooks
- **React Router** for navigation
- **Context API** for state management
- **Recharts** for data visualization
- **react-circular-progressbar** for progress circles
- **Tailwind CSS** for styling
- **Axios** for API calls
- **date-fns** for date manipulation
- **react-hot-toast** for notifications
- **Vite** for blazing-fast development

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **CORS** enabled

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MongoDB** (v5 or higher) - Local or MongoDB Atlas
- **npm** or **yarn**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd habittracker
```

### 2. Backend Setup

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/habittracker
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
```

**For MongoDB Atlas:**
Replace `MONGODB_URI` with your Atlas connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/habittracker?retryWrites=true&w=majority
```

Start the server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal and navigate to the client directory:
```bash
cd client
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🎮 Usage

### First Time Setup

1. **Register a New Account**
   - Navigate to `http://localhost:3000/register`
   - Create your account with username, email, and password

2. **Add Your First Habits**
   - Click on "Add Habit" button
   - Enter habit name, category, color, and goal type
   - Save your habit

3. **Track Your Progress**
   - Click on cells in the heat map to mark habits as complete
   - View your daily, weekly, and monthly progress
   - Track your streaks and top-performing habits

### Daily Workflow

1. **Mark Today's Habits**
   - Today's column is highlighted in pink
   - Click cells to toggle completion
   - Green checkmarks indicate completed habits

2. **Review Your Progress**
   - Check your progress circles
   - View the daily progress chart
   - Monitor your active streaks

3. **Add Notes**
   - Use the notes section to jot down thoughts
   - Notes are saved per month
   - Great for reflections and goals

## 📁 Project Structure

```
habittracker/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── Auth/      # Authentication components
│   │   │   ├── Charts/    # Chart components
│   │   │   ├── Dashboard/ # Dashboard components
│   │   │   └── Sidebar/   # Sidebar components
│   │   ├── context/       # React Context providers
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main App component
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                # Backend Node.js application
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── server.js          # Server entry point
│   └── package.json
│
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Habits
- `GET /api/habits` - Get all user habits (Protected)
- `POST /api/habits` - Create new habit (Protected)
- `PUT /api/habits/:id` - Update habit (Protected)
- `DELETE /api/habits/:id` - Delete habit (Protected)

### Progress
- `GET /api/progress/:year/:month` - Get monthly progress (Protected)
- `POST /api/progress/toggle` - Toggle habit completion (Protected)
- `GET /api/progress/stats` - Get statistics (Protected)

### Streaks
- `GET /api/streaks` - Get active streaks (Protected)

### Notes
- `GET /api/notes/:year/:month` - Get monthly notes (Protected)
- `PUT /api/notes/:year/:month` - Update notes (Protected)

## 🎨 Color Scheme

- **Background**: Dark Navy (`#0a0e27`)
- **Accent**: Pink/Coral (`#e91e63`, `#ec4899`)
- **Week Colors**:
  - Week 1: Blue (`#3b82f6`)
  - Week 2: Green (`#10b981`)
  - Week 3: Purple (`#a855f7`)
  - Week 4: Yellow (`#f59e0b`)
  - Week 5: Red (`#ef4444`)

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Prepare for deployment:**
   - Ensure all environment variables are set
   - Update CORS settings for production URL

2. **Deploy to Render:**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   
   # Connect to Render and deploy
   ```

3. **Set environment variables on hosting platform:**
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

### Frontend Deployment (Vercel/Netlify)

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy
   vercel
   ```

3. **Update environment variables:**
   - Set `VITE_API_URL` to your backend URL

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📝 Environment Variables

### Server (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/habittracker
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

Your Name

## 🙏 Acknowledgments

- Recharts for beautiful charts
- Tailwind CSS for styling
- MongoDB for database
- React community for amazing tools

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Happy Habit Tracking! 🎯**
