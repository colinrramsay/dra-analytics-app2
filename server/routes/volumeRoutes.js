/* ===============================
Routes for high volume scoring
root: /volume
================================ */

//Imports
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { getFilePath, getDatasetsFromGeoJson, readGeoJSON, mapDatasetNames} = require('../utils/utils');
const { runScoreScript } = require('../utils/rdapy'); // Import the function to run the scoring script

//PLACEHOLDER: Import geojson that will ultimately come from the cloud
const sampleGeoJson = require('../../sample-data/private-data/sample.json'); // overwrote extension to .json for ease

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
    // PLACEHOLDER: Manually set args for testing
    const clientArgs = {
        state: 'NC',
        planType: 'congress',
        plans: 'testdata/plans/NC_congress_plans.tagged.jsonl',
        census: 'T_20_CENS',
        vap: 'V_20_VAP',
        cvap: 'V_20_CVAP',
        elections: ['E_16_SEN', 'E_20_AG'],
        scores: 'temp/TEST_congress_scores.csv',
        byDistrict: 'temp/TEST_congress_by-district.jsonl'
    }
    // Add server-side computed args
    const args = {
        ...clientArgs, // Spread client args
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