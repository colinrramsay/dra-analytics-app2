/* ===============================
Routes for high volume scoring
root: /volume
================================ */

//Imports
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getFilePath, getDatasetsFromGeoJson, readGeoJSON, mapDatasetNames, mapDatasetFileNames, assignDatasets} = require('../utils/utils');
const { runScoreScript } = require('../utils/rdapy'); // Import the function to run the scoring script

//Load environment variables
require('dotenv').config();
const OUTPUT_PATH = path.join(__dirname, process.env.OUTPUT_PATH) || path.join(__dirname, '../../output/'); // Default output path if not set in .env
const PLANS_PATH = path.join(__dirname, process.env.PLANS_PATH) || path.join(__dirname, '../../plans/'); // Default input path if not set in .env

//POST to /sync
//Download requested geojson files from cloud, save locally
router.post('/sync', (req, res) => {
    // Get array of states from req body
    // Fetch geojson files for each state from cloud
    // Fetch pre-computed data for each geojson from cloud
    // Save both locally
    console.log('Fetching geojsons from cloud...');
    res.json('All geojsons fetched and saved locally.'); // Placeholder response
    // or res with geojsons that could not be fetched
})

//GET to /plans
//Get list of plan files available for scoring
router.get('/plans', (req, res) => {
    console.log('Fetching plan files...');
    // Get list of planfiles from the input directory
    fs.readdir(PLANS_PATH, (err, files) => {
        if (err) {
            console.error('Error reading input directory:', err);
            return res.status(500).json({ error: 'Failed to read plans directory' });
        }
        // Filter for JSONL files
        const planFiles = files.filter(file => file.endsWith('.jsonl'));
        res.json(planFiles); // Return list of input files
    });
})

//GET to /datasets
router.get('/datasets/:state', (req, res) => {
    console.log('Fetching datasets...');
    const filePath = getFilePath('geojson', req.params.state); // Get file path for state URL param on request
    const geoJson = readGeoJSON(filePath); // Read and parse the GeoJSON file
    // Placeholder: add logic check, if !geoJson, return error response (couldn't find/read geojson)
    const datasets = getDatasetsFromGeoJson(geoJson); //Get list of datasets from geojson
    console.log(datasets);
    const mappedDatasets = mapDatasetNames(datasets); // Map dataset names to user-friendly names
    res.json(mappedDatasets); // Return array of datasets with user-friendly names
})

//POST to /score
//Run volume scoring with user inputted parameters
router.post('/score', (req, res) => {
    // PLACEHOLDER: Manually set certain args for testing until functionality is implemented in client
    const clientArgs = {
        ...req.body, // Spread client args from request body
        // state: 'NC',
        planType: 'congress',
        plans: `${PLANS_PATH}NC_congress_plans.tagged.jsonl`,
        // datasets: ['V_20_VAP', 'V_20_CVAP', 'E_16_SEN', 'E_20_AG', 'T_20_CENS'], // Example datasets
        output: `${OUTPUT_PATH}TEST_congress`, // Placeholder: update to use file name from client args
    }
    const datasetArgs = assignDatasets(mapDatasetFileNames(clientArgs.datasets)); // Map dataset back to file names & assign to arg props
    delete clientArgs.datasets; // Remove datasets prop from client args, as it is now assigned in datasetArgs
    // Add server-side computed prop & assigned datasets
    const args = {
        ...clientArgs, // Spread client args
        ...datasetArgs, // Spread dataset args
        geojson: getFilePath('geojson', clientArgs.state), // computed server side from state
        graph: getFilePath('graph', clientArgs.state), // computed server side from state
        precomputed: getFilePath('precomputed', clientArgs.state), // computed server side from state
    }
    // Spawn child process to run python script for scoring
    console.log('Scoring with parameters:', args);
    runScoreScript(args)
        .then((result) => {
            res.json(result.resultFiles); // return path to resulting score files
            console.log('Scoring completed successfully');
        })
        .catch((error) => {
            res.status(500).json(error.message || error.toString());
        });
})

//Export route
module.exports = router;