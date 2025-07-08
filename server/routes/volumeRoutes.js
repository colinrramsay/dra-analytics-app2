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
        getStatefromJsonl,
        fetchFiles} = require('../utils/utils');
const { runScoreScript } = require('../utils/rdapy'); // Import the function to run the scoring script

//Load environment variables & file paths
require('dotenv').config();
const { DATA_PATH, ENSEMBLE_PATH, SCORES_PATH } = require('../utils/filePaths'); // Import file paths from filePaths.js

//POST to /sync
//Download requested geojson files from cloud, save locally
router.post('/sync', async (req, res) => {
    console.log(req.body);
    
    const statePromises = req.body.map(async state => {
        const filePath = `${DATA_PATH}${state}_2020_VD_tabblock.vtd.datasets.geojson`;
        
        if (checkFileExists(filePath)) {
            console.log(`File for state ${state} already exists locally.`);
            return null; // State is available
        } else {
            console.log(`File for state ${state} not found locally, fetching from cloud.`);
            const result = await fetchFiles(state);
            if (!result) {
                console.log(`Failed to fetch data for state ${state} from cloud.`);
                return state; // Return the state if unavailable
            } else {
                console.log(`Data for state ${state} fetched successfully from cloud.`);
                return null; // State is available
            }
        }
    });

    // Wait for all promises to resolve
    const results = await Promise.all(statePromises);
    // Filter out null values to get unavailable states
    const unavailStates = results.filter(state => state !== null);
    
    // const unavailStates = [];
    // for (const state of req.body) {
    //     const filePath = `${GEOJSON_PATH}_${state}_2020_VD_tabblock.vtd.datasets.geojson`; // Expected local file path for state
    //     // Check if the file exists locally, if so skip fetching from cloud
    //     if (checkFileExists(filePath)) {
    //         console.log(`File for state ${state} already exists locally.`);
    //     } else {
    //         console.log(`File for state ${state} not found locally, fetching from cloud.`);
    //         const result = await fetchFiles(state);
    //         if (!result) {
    //             console.log (`Failed to fetch data for state ${state} from cloud.`);
    //             unavailStates.push(state); // If fetching fails, add to unavailStates
    //         }
    //         console.log(`Data for state ${state} fetched successfully from cloud.`);
    //         return false; // If fetching succeeds, filter out this state
    //     }
    // }

    // If any states are unavailable, return error with those states
    if (unavailStates.length > 0) {
        return res.status(400).json({ error: 'Failed to fetch some states from cloud:', states: unavailStates });
    }
    // If all states are available, return success message
    res.json('All data fetched and saved locally.');

    // const result = await fetchFiles('CA'); // Example state, replace with req.body.states if needed
    // if (!result) {
    //     console.log('Failed to fetch data from cloud.');
    //     return res.status(400).json({ error: 'Failed to fetch files from cloud.' });
    // }
    // res.json('All data fetched and saved locally.');
    // or res with geojsons that could not be fetched
})

//GET to /plans
//Get list of plan files available for scoring
router.get('/plans', (req, res) => {
    console.log('Fetching plan files...');
    // Get list of planfiles from the input directory
    fs.readdir(ENSEMBLE_PATH, (err, files) => {
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
    const result = await getStatefromJsonl(`${ENSEMBLE_PATH}${req.params.plans}`) // returns as [state, planType] if valid, else null

    // Check if state & planType is valid
    if (!result) return res.status(400).json({ error: 'Invalid plan file or state not found' });
    const state = result[0]; // Extract state from result
    const planType = result[1]; // Extract planType from result
    console.log(`State: ${state}, Plan Type: ${planType}`);
   
    // Check if geojson file exists for the state
    console.log('Fetching datasets...');
    const filePath = `${DATA_PATH}${state}_2020_VD_tabblock.vtd.datasets.geojson`; // Get file path for state URL param on request
    const geoJsonExists = checkFileExists(filePath);
    if (!geoJsonExists) {
        console.log('GeoJSON file not found locally, attempting to fetch from cloud...');
        const result = await fetchFiles(state) // Attempt to fetch from cloud
        if (!result) {
            console.log('GeoJSON file not found in cloud, returning error.');
            return res.status(400).json({ error: 'GeoJSON or graph file not found, and could not be fetched from cloud.' });
        } else {
            console.log('GeoJSON and graph files fetched from cloud successfully.');
        }
    }

    // If geojson file exists or can be fetched, continue
    const geoJson = readGeoJSON(filePath); // Read and parse the GeoJSON file
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
    const precomputedPath = `${DATA_PATH}precomputed/${req.body.state}_congress_precomputed.json`;
    const precomputed = checkFileExists(precomputedPath) ? precomputedPath : null

    // Add server-side computed prop & assigned datasets
    const args = {
        ...req.body, // Spread args from client
        //datasets mapped back to file names
        elections: mapDatasetFileNames(req.body.elections),
        census: mapDatasetFileNames(req.body.census),
        vap: mapDatasetFileNames(req.body.vap),
        cvap: mapDatasetFileNames(req.body.cvap),
        plans: `${ENSEMBLE_PATH}${req.body.plans}`, // Path to plans file, passed from client + path prefix
        output: `${SCORES_PATH}${fileName}`, // Path to output file, passed from client + path prefix
        geojson: `${DATA_PATH}${req.body.state}_2020_VD_tabblock.vtd.datasets.geojson`, // computed server side from state
        graph: `${DATA_PATH}${req.body.state}_2020_graph.json`, // computed server side from state
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