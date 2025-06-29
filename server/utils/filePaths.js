const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

// File paths if in node binary
if (process.pkg) {
    const executableDir = path.dirname(process.execPath);
    module.exports = {
        DATA_PATH: path.join(executableDir, process.env.PKG_DATA_PATH) || path.join(executableDir, 'data/'),
        ENSEMBLE_PATH: path.join(executableDir, process.env.PKG_ENSEMBLE_PATH) || path.join(executableDir, 'ensembles/'),
        SCORES_PATH: path.join(executableDir, process.env.PKG_SCORES_PATH) || path.join(executableDir, 'scores/'),
    }
} 
// File paths if in development or production build
else {
    module.exports = {
        DATA_PATH: path.join(__dirname, process.env.DATA_PATH) || path.join(__dirname, '../../data/'),
        ENSEMBLE_PATH: path.join(__dirname, process.env.ENSEMBLE_PATH) || path.join(__dirname, '../../ensembles/'),
        SCORES_PATH: path.join(__dirname, process.env.SCORES_PATH) || path.join(__dirname, '../../scores/'),
    }
}