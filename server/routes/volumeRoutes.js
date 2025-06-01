/* ===============================
Routes for high volume scoring
root: /volume
================================ */

//Imports
const express = require('express');
const router = express.Router();
const fs = require('fs');

//PLACEHOLDER: Import geojson that will ultimately come from the cloud
const sampleGeoJson = require('../../sample-data/private-data/sample.json'); // overwrote extension to .json for ease

//PLACEHOLDER: Init dataset state by returning local datasets
//GET to /init

//GET to /sync
//Get list of supported datasets
router.get('/sync', (req, res) => {
    //Get geojson files from cloud, save locally

    //Parse geojson for all datasets
    const datasets = sampleGeoJson.features[0].properties.datasets; // Grab obj of dataset objects from first precinct
    const arrOfDatasets = [];
    for (const set in datasets) { // Iterate through dataset objects
        if (set.charAt(0) === 'E') { // If dataset key starts with E, it's election data
            arrOfDatasets.push(set); // Add to array of datasets to return as options
        }
    }
    //Get pre-computed data for each dataset from cloud, save locally
    //filter array to only datasets for which pre-computed data is available
    console.log('Fetching datasets for sync...');
    console.log(arrOfDatasets);
    res.json(arrOfDatasets); // Return full array until pre-computed data is available to filter against
}) 

//PLACEHOLDER: Run high volume scoring

//Export route
module.exports = router;