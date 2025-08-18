/* ===================================
Export file paths based on environment
===================================== */

const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

// File paths if in node binary
if (process.pkg) {
    const executableDir = path.dirname(process.execPath);
    module.exports = {
        DATA_PATH: process.env.PKG_DATA_PATH ? path.join(executableDir, process.env.PKG_DATA_PATH) : path.join(executableDir, 'data/'),
        ENSEMBLE_PATH: process.env.PKG_ENSEMBLE_PATH ? path.join(executableDir, process.env.PKG_ENSEMBLE_PATH) : path.join(executableDir, 'ensembles/'),
        SCORES_PATH: process.env.PKG_SCORES_PATH ? path.join(executableDir, process.env.PKG_SCORES_PATH) : path.join(executableDir, 'scores/'),
        VENV_PATH: '', // VENV_PATH is not used in production build but its value is called in rdapy.js and so it is set to an empty string
        RDAPY_PATH: null, // RDAPY_PATH is not used in production build
    }
} 
// File paths if in development or production build
else {
    module.exports = {
        DATA_PATH: path.join(__dirname, process.env.DATA_PATH) || path.join(__dirname, '../../data/'),
        ENSEMBLE_PATH: path.join(__dirname, process.env.ENSEMBLE_PATH) || path.join(__dirname, '../../ensembles/'),
        SCORES_PATH: path.join(__dirname, process.env.SCORES_PATH) || path.join(__dirname, '../../scores/'),
        VENV_PATH: path.resolve(process.env.VENV_PATH),
        RDAPY_PATH: path.resolve(process.env.RDAPY_PATH) || path.resolve(__dirname, '../../rdapy'),
    }
}