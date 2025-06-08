const fs = require('fs');
const path = require('path');

// State abbreviation geojson file name
// Assumes stateCode is a valid two-letter state code
exports.getStateAbbFileName = function(stateCode) {
    const prefix = `_`;
    const suffix = `_2020_VD_tabblock.vtd.datasets.geojson`;
    return `${prefix}${stateCode}${suffix}`;
}

// Read & parse a GeoJSON as JSON
exports.readGeoJSON = function(filePath) {
  const rawData = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
  return JSON.parse(rawData);
};

// Extract datasets from geojson and return as array
exports.getDatasetsFromGeoJson = function(geojson) {
    const datasets = geojson.features[0].properties.datasets; // Grab obj of dataset objects from first precinct
    const arrOfDatasets = [];
    for (const set in datasets) { // Iterate through dataset objects
        if (set.charAt(0) === 'E') { // If dataset key starts with E, it's election data
            arrOfDatasets.push(set); // Add to array of datasets to return as options
        }
    }
    return arrOfDatasets;
}

// HELPER FUNCTIONS
// Find geojson locally, if not found, fetch from cloud
// Fetch geojson from cloud and save locally
// Map dataset file names to user-friendly names