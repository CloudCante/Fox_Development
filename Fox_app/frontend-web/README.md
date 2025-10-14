# Fox Quality Dashboard - Web Version

This is the web version of the Fox Quality Dashboard, converted from the Electron app.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd Fox_app/frontend-web
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root directory with:
   ```
   REACT_APP_API_BASE=http://localhost:3001
   NODE_ENV=development
   GENERATE_SOURCEMAP=true
   ```

3. **Development Server**
   ```bash
   npm start
   ```
   This will start the webpack dev server on http://localhost:3000

4. **Production Build**
   ```bash
   npm run build
   ```
   This creates optimized files in the `dist` folder.

## Key Changes from Electron Version

- Removed all Electron-specific dependencies and configurations
- Changed from `HashRouter` to `BrowserRouter` for cleaner URLs
- Removed Electron-specific styling (WebkitAppRegion)
- Simplified webpack configuration for web builds
- Removed auto-updater and Electron main process files

## Backend Integration

The web app communicates with the same backend API as the Electron version. Make sure your backend server is running on the configured port (default: 3001).

## File Structure

```
frontend-web/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components (copied from Electron version)
│   ├── data/              # Data management (copied from Electron version)
│   ├── utils/             # Utilities (copied from Electron version)
│   ├── App.js             # Main app component
│   ├── index.js           # Entry point
│   └── index.css          # Global styles
├── package.json           # Web-specific dependencies
├── webpack.config.js      # Webpack configuration
└── README.md             # This file
```
