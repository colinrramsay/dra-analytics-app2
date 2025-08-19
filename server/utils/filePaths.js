/* ===================================
Export file paths based on environment
===================================== */

const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

// File paths if in node binary
if (process.pkg) {
    const binaryDir = path.dirname(process.execPath);
    module.exports = {
        DATA_PATH: process.env.PKG_DATA_PATH ? path.join(binaryDir, process.env.PKG_DATA_PATH) : path.join(binaryDir, 'data/'),
        ENSEMBLE_PATH: process.env.PKG_ENSEMBLE_PATH ? path.join(binaryDir, process.env.PKG_ENSEMBLE_PATH) : path.join(binaryDir, 'ensembles/'),
        SCORES_PATH: process.env.PKG_SCORES_PATH ? path.join(binaryDir, process.env.PKG_SCORES_PATH) : path.join(binaryDir, 'scores/'),
        VENV_PATH: path.join(binaryDir, 'venv'),
        RDAPY_PATH: binaryDir,
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