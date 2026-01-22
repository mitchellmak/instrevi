# 🚀 Quick Start Guide - Instrevi Mobile App

Get Instrevi running as a mobile app in 5 minutes!

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Set Up Database
Create a `.env` file (copy from `.env.example`):
```bash
MONGODB_URI=mongodb://localhost:27017/instrevi
JWT_SECRET=your_secret_key_here
PORT=5000
```

## Step 3: Start the Server
```bash
npm start
```

Your app is now running at `http://localhost:5000`

## Step 4: Test PWA Features
Open in your browser:
- **Main app**: http://localhost:5000/index.html
- **PWA test page**: http://localhost:5000/pwa-test.html

## Step 5: Install on Your Phone

### Option A: Local Network (Recommended for Testing)
1. Find your computer's local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
   
2. On your phone's browser, visit: `http://YOUR_IP:5000`
   - Example: `http://192.168.1.100:5000`

3. Add to home screen!

### Option B: Deploy to Production (For Real Use)
Deploy to a hosting service with HTTPS:
- **Vercel**: `vercel deploy`
- **Heroku**: `git push heroku main`
- **Netlify**: Connect your GitHub repo
- **Your own server**: Use nginx with Let's Encrypt

**Important**: PWA requires HTTPS in production! Only localhost works without it.

## Step 6: Generate App Icons (Optional)
1. Open `icons/icon-generator.html` in your browser
2. Upload your logo or use the default design
3. Save all generated icons to the `/icons/` folder

## Testing Checklist

- [ ] Server starts without errors
- [ ] Can create a new account at `/signup.html`
- [ ] Can login successfully
- [ ] Feed page loads (`/feed.html`)
- [ ] PWA test page shows all green checks
- [ ] "Add to Home Screen" option appears on mobile
- [ ] App works offline after first visit

## Troubleshooting

### "Add to Home Screen" not showing?
- ✅ Make sure you're using HTTPS (or localhost)
- ✅ Visit the site at least once to cache files
- ✅ Use Chrome/Edge on Android or Safari on iOS
- ✅ Check PWA test page for any failed checks

### App not working offline?
- Service worker needs time to cache files
- Visit all pages at least once while online
- Check browser console for service worker errors

### Can't connect from phone?
- Make sure phone and computer are on same WiFi
- Disable firewall temporarily to test
- Check if port 5000 is accessible: `netstat -an | findstr 5000`
- Try `http://0.0.0.0:5000` instead of localhost in server config

### Database connection failed?
- Install MongoDB: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas
- Update MONGODB_URI in `.env` file

## Next Steps

1. **Customize**: Change colors, logo, and branding
2. **Add Features**: Implement photo upload, comments, likes
3. **Deploy**: Put it online with HTTPS
4. **Enhance**: Add push notifications, camera integration
5. **Share**: Let users install it on their phones!

## Useful Links

- 📖 [Full Mobile App Guide](MOBILE_APP_GUIDE.md)
- 📋 [Main README](README.md)
- 🧪 [PWA Test Page](http://localhost:5000/pwa-test.html)
- 🎨 [Icon Generator](http://localhost:5000/icons/icon-generator.html)

## Need Help?

Common issues:
- **Port already in use**: Change PORT in `.env` to 3000 or 8080
- **MongoDB not installed**: Use MongoDB Atlas (cloud) instead
- **PWA not working**: Check `service-worker.js` is loading in DevTools
- **Icons not showing**: Generate them with icon-generator.html

Happy coding! 🎉
