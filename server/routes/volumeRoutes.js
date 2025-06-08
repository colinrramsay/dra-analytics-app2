/* ===============================
Routes for high volume scoring
root: /volume
================================ */

//Imports
const express = require('express');
const router = express.Router();
const fs = require('fs');
const { getStateAbbFileName, getDatasetsFromGeoJson, readGeoJSON} = require('../utils/utils');
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
router.get('/datasets', (req, res) => {
    console.log('Fetching datasets...');
    const fileName = getStateAbbFileName('NC'); // Example for California, replace with dynamic state code as needed
    const filePath = `../../sample-data/private-data/${fileName}`; // Adjust path as necessary
    const geoJson = readGeoJSON(filePath); // Read and parse the GeoJSON file
    const datasets = getDatasetsFromGeoJson(sampleGeoJson); //Get list of datasets from geojson
    console.log(datasets);
    res.json(datasets); // Return array of datasets
})

//POST to /score
//Run volume scoring with user inputted parameters
router.post('/score', (req, res) => {
    // PLACEHOLDER: Manually set args for testing
    const args = {
        state: 'NC',
        planType: 'congress',
        geojson: 'testdata/data/NC_vtd_datasets.v4.geojson',
        graph: 'testdata/examples/NC_graph.json',
        precomputed: 'testdata/examples/NC_congress_precomputed.json',
        plans: 'testdata/plans/NC_congress_plans.tagged.jsonl',
        scores: 'temp/TEST_congress_scores.csv',
        byDistrict: 'temp/TEST_congress_by-district.jsonl'
    }
    // Spawn child process to run python script for scoring
    console.log('Scoring with parameters:', args);
    runScoreScript(args)
        .then((result) => {
            res.json(result.resultFiles); // return path to resulting score files
            console.log('Scoring completed successfully');
        })
        .catch((error) => {
            res.status(500).json(error: error.message || error.toString());
        });
})

//Export route
module.exports = router;