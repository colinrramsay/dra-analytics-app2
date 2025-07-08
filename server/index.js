/* =======================
Express server entry point
======================= */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const open = require('open');
const app = express();

// Import routes
const singleRoutes = require('./routes/singleRoutes');
const volumeRoutes = require('./routes/volumeRoutes');


require('dotenv').config()
const { ENSEMBLE_PATH, SCORES_PATH } = require('./utils/filePaths'); // Import file paths from filePaths.js
const PORT = process.env.PORT || 3001;
fs.mkdirSync(ENSEMBLE_PATH, { recursive: true }); // Ensure ensembles directory exists
fs.mkdirSync(SCORES_PATH, { recursive: true }); // Ensure scores directory exists

//CORS configuration only when running in development
// This is important for local development to allow the React app to communicate with the Express server
if (process.env.NODE_ENV === 'development') {
  app.use(cors({
    origin: 'http://localhost:5173', // Vite's default dev server port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}

// Serve static files from the 'dist' folder
// In pkg environment, dist folder is snapshotted and __dirname points to virtual path
const staticPath = path.join(__dirname, 'dist');
app.use(express.static(staticPath));

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//React SPA route
app.get('/', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

//API endpoints
app.use('/single', singleRoutes);
app.use('/volume', volumeRoutes);

// Add a route to shut down the server
app.post('/shutdown', (req, res) => {
  res.send({ message: 'Server shutting down...' });
  
  // Send the response before shutting down
  setTimeout(() => {
    console.log('Server shutting down by user request');
    if (process.env.NODE_ENV === 'development') {
      viteProcess.kill(); // Ensure Vite dev server is also shut down, if it exists
    }
    process.exit(0); // Exiting main process also shuts down Vite dev server as backup
  }, 1000);
});

// Spin up Express server
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
    
    // Only open browser when running as a packaged app (not during development)
    if (process.pkg) {
      // Small delay to ensure server is ready
      setTimeout(() => {
        open(`http://localhost:${PORT}`);
        console.log('Opening browser automatically...');
      }, 1000);
    }
})

// If running in development, also spin up Vite dev server
if (process.env.NODE_ENV === 'development') {
  const { spawn } = require('child_process');
  const viteProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.resolve(__dirname, '../client'),
    stdio: 'inherit',
    shell: true,
  });
  console.log('Vite dev server started...');

  // Handle process termination
  const cleanup = () => {
    viteProcess.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  viteProcess.on('exit', (code) => {
    console.log(`Vite dev server exited with code ${code}`);
    cleanup();
  });
}