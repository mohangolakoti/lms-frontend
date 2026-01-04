# LMS Frontend

A modern, production-ready React frontend for the Learning Management System.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

## Features

- ✅ JWT Authentication (Login, Register, Forgot/Reset Password)
- ✅ Role-based access control (Admin, Instructor, Student)
- ✅ Protected routes with role guards
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Modern UI with Tailwind CSS
- ✅ Dashboard for each role
- ✅ Reusable components
- ✅ API service layer

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend server running on `http://localhost:3000`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - Frontend: http://localhost:3001
   - The app will automatically proxy API requests to the backend

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── StatCard.jsx
│   ├── context/          # React Context providers
│   │   └── AuthContext.jsx
│   ├── layouts/          # Layout components
│   │   ├── AdminLayout.jsx
│   │   ├── InstructorLayout.jsx
│   │   └── StudentLayout.jsx
│   ├── pages/            # Page components
│   │   ├── admin/
│   │   │   └── AdminDashboard.jsx
│   │   ├── instructor/
│   │   │   └── InstructorDashboard.jsx
│   │   ├── student/
│   │   │   └── StudentDashboard.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── ResetPassword.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── utils/            # Utility functions
│   │   └── roleRedirect.js
│   ├── App.jsx           # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Authentication Flow

1. **Login** - User enters email/password
2. **Token Storage** - JWT token stored in localStorage
3. **Auth Check** - App checks token on mount
4. **Role Redirect** - User redirected to role-specific dashboard
5. **Protected Routes** - Routes protected by role guards

## Role-Based Dashboards

### Admin Dashboard
- Platform statistics
- User management
- Course management
- Instructor management
- Announcements

### Instructor Dashboard
- Course statistics
- My courses list
- Assessment management
- Student progress tracking

### Student Dashboard
- Enrolled courses
- Progress overview
- Assessment activity
- Announcements
- Notifications

## Color Palette

The app uses a professional color palette:
- **Primary Blues**: `#cae8ff`, `#b2e4ff`, `#acf4ff`, `#60b9e9`, `#00aeef`
- **Dark Blues**: `#050a30`, `#1b75bc`
- **Accent Colors**: `#05c1dd`, `#059aef`, `#05aee5`, `#05d4d8`, `#0484fa`

## API Integration

All API calls are centralized in `src/services/api.js`:
- `authAPI` - Authentication endpoints
- `studentAPI` - Student endpoints
- `adminAPI` - Admin endpoints
- `instructorAPI` - Instructor endpoints

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:3000/api`)

## Notes

- The frontend runs on port 3001 by default
- API requests are proxied to the backend during development
- JWT tokens are stored in localStorage
- Protected routes automatically redirect unauthorized users

