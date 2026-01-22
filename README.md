# Instrevi - Social Media Progressive Web App

A complete Instagram-like social media application with a Node.js/Express backend, MongoDB database, and **Progressive Web App (PWA)** capabilities that can be installed as a mobile app!

## 📱 Mobile App Features

Instrevi is now a **Progressive Web App** that works like a native mobile app:
- ✅ **Install on your phone** - Add to home screen on iOS and Android
- ✅ **Works offline** - Access content without internet connection
- ✅ **Full-screen experience** - No browser UI, looks like a real app
- ✅ **Fast & responsive** - Optimized for mobile devices
- ✅ **Push notifications ready** - Stay updated with new content

👉 **[Read the Mobile App Installation Guide](MOBILE_APP_GUIDE.md)**

## Setup Instructions

### 1. Prerequisites
- Node.js (v14 or higher)
- MongoDB installed locally or MongoDB Atlas account

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Edit the `.env` file with your settings:
```
MONGODB_URI=mongodb://localhost:27017/instrevi
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/instrevi
```

### 4. Start the Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### 5. Generate App Icons (Optional)
Open `icons/icon-generator.html` in your browser to generate app icons, or use your own logo.

### 6. Install as Mobile App
- **On mobile**: Visit the site in your browser and select "Add to Home Screen"
- **On desktop**: Look for the install icon in the address bar
- See [MOBILE_APP_GUIDE.md](MOBILE_APP_GUIDE.md) for detailed instructions

## Features

### Backend Features
- **User Login**: Authenticate users against the database
- **User Registration**: Create new user accounts
- **Password Hashing**: Passwords are securely hashed with bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **CORS Enabled**: Allows frontend requests from different origins
- **Error Handling**: Comprehensive validation and error messages

### Frontend Features
- **Instagram-like Feed**: Browse posts with images and interactions
- **User Profiles**: View and edit user profiles with avatars
- **Stories**: Swipeable stories section
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Dynamic content loading

### Progressive Web App (PWA) Features
- **Installable**: Add to home screen on any device
- **Offline Support**: Works without internet connection
- **Service Worker**: Caches content for fast loading
- **Mobile-Optimized**: Touch-friendly interface for phones
- **App-like Experience**: Full-screen mode, no browser UI
- **Cross-Platform**: Works on iOS, Android, and desktop

## API Endpoints

### POST /api/login
Login with email and password
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "userId": "user_id_here"
}
```

### POST /api/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

## File Structure

- `index.html` - Login form
- `styles.css` - Styling
- `script.js` - Frontend login logic connected to backend
- `server.js` - Node.js/Express backend server
- `package.json` - Project dependencies
- `.env` - Environment variables
- `README.md` - This file
