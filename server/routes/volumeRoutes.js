/* ===============================
Routes for high volume scoring
root: /volume
================================ */

//Imports
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getFilePath, 
        getDatasetsFromGeoJson, 
        readGeoJSON, 
        mapDatasetNames, 
        mapDatasetFileNames, 
        assignDatasets, 
        checkFileExists, 
        getStatefromJsonl} = require('../utils/utils');
const { runScoreScript } = require('../utils/rdapy'); // Import the function to run the scoring script

//Load environment variables
require('dotenv').config();
const OUTPUT_PATH = path.join(__dirname, process.env.OUTPUT_PATH) || path.join(__dirname, '../../output/'); // Default output path if not set in .env
const PLANS_PATH = path.join(__dirname, process.env.PLANS_PATH) || path.join(__dirname, '../../plans/'); // Default input path if not set in .env
const GEOJSON_PATH = path.join(__dirname, process.env.GEOJSON_PATH) || path.join(__dirname, '../../sample-data/private-data/');
const GRAPH_PATH = path.join(__dirname, process.env.GRAPH_PATH) || path.join(__dirname, '../../sample-data/private-data/');
const PRECOMPUTED_PATH = path.join(__dirname, process.env.PRECOMPUTED_PATH) || path.join(__dirname, '../rdapy/testdata/examples/');

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
router.get('/datasets/:plans', async (req, res) => {
    const result = await getStatefromJsonl(`${PLANS_PATH}${req.params.plans}`) // returns as [state, planType] if valid, else null

    // Check if state & planType is valid
    if (!result) return res.status(400).json({ error: 'Invalid plan file or state not found' });
    const state = result[0]; // Extract state from result
    const planType = result[1]; // Extract planType from result
    console.log(`State: ${state}, Plan Type: ${planType}`);
    console.log('Fetching datasets...');
    const filePath = getFilePath('geojson', result[0]); // Get file path for state URL param on request
    const geoJson = readGeoJSON(filePath); // Read and parse the GeoJSON file
    // Placeholder: add logic check, if !geoJson, return error response (couldn't find/read geojson)
    const datasets = getDatasetsFromGeoJson(geoJson); //Get list of datasets from geojson
    console.log(datasets);
    const mappedDatasets = mapDatasetNames(datasets); // Map dataset names to user-friendly names
    res.json({ datasets: mappedDatasets, state: state, planType: planType }); // Return array of datasets with user-friendly names, state & planType
})

//POST to /score
//Run volume scoring with user inputted parameters
router.post('/score', (req, res) => {
    // Set file name if given, else use default
    const defaultName = `${req.body.plans.slice(0, -6)}` // Plans file name without .jsonl extension
    const fileName = req.body.fileName !== '' ? req.body.fileName : defaultName;
    
    // Validate if precomputed file exists
    const precomputedPath = `${PRECOMPUTED_PATH}${req.body.state}_congress_precomputed.json`;
    const precomputed = checkFileExists(precomputedPath) ? precomputedPath : null

    // Add server-side computed prop & assigned datasets
    const args = {
        ...req.body, // Spread args from client
        //datasets mapped back to file names
        elections: mapDatasetFileNames(req.body.elections),
        census: mapDatasetFileNames(req.body.census),
        vap: mapDatasetFileNames(req.body.vap),
        cvap: mapDatasetFileNames(req.body.cvap),
        plans: `${PLANS_PATH}${req.body.plans}`, // Path to plans file, passed from client + path prefix
        output: `${OUTPUT_PATH}${fileName}`, // Placeholder: update to use file name from client args
        geojson: `${GEOJSON_PATH}_${req.body.state}_2020_VD_tabblock.vtd.datasets.geojson`, // computed server side from state
        graph: `${GRAPH_PATH}${req.body.state}_2020_graph.json`, // computed server side from state
        precomputed: precomputed, // Path to precomputed file, if exists
    }

    delete args.datasets; // Remove datasets prop from args, as it is now assigned in datasetArgs

    // Spawn child process to run python script for scoring
    console.log('Scoring with parameters:', args);
    runScoreScript(args)
        .then((result) => {
            // Check if the script ran successfully
            if (result.stdout.trim() === 'Done!') {
                res.json(result.resultFiles); // return path to resulting score files
                console.log('Scoring completed successfully');
            } else {
                res.json({ error: 'Scoring failed, see terminal for details.', details: result.stdout });
            }
        })
        .catch((error) => {
            res.status(500).json(error.message || error.toString());
        });
})

//Export route
module.exports = router;