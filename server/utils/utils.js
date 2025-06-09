const fs = require('fs');
const path = require('path');

// State abbreviation geojson file name
// Assumes stateCode is a valid two-letter state code
exports.getStateAbbFileName = function(stateCode) {
    const prefix = `_`;
    const suffix = `_2020_VD_tabblock.vtd.datasets.geojson`;
    return `${prefix}${stateCode}${suffix}`;
}

// Return a file path based on type and state code
exports.getFilePath = function(type, stateCode) {
    if (type === 'geojson') {
        const fileName = `_${stateCode}_2020_VD_tabblock.vtd.datasets.geojson`;
        return `../../sample-data/private-data/${fileName}`;
    } else if (type === 'graph') {
        const fileName = `${stateCode}_graph.json`;
        return `../rdapy/testdata/examples/${fileName}`;
    } else if (type === 'precomputed') {
        const fileName = `${stateCode}_congress_precomputed.json`;
        return `../rdapy/testdata/examples/${fileName}`;
    } else return null; // Invalid type
}

// Check if a file exists at the given path
const checkFileExists = function(filePath) {
    try {
        return fs.existsSync(path.resolve(__dirname, filePath));
    } catch (err) {
        console.error(`Error checking file existence: ${err}`);
        return false;
    }
}

// Read & parse a GeoJSON as JSON, download from cloud if not found locally
exports.readGeoJSON = function(filePath) {
    if (!checkFileExists(filePath)) {
        // Placeholder for cloud fetch logic
        console.log(`File not found locally: ${filePath}. Fetching from cloud...`);
        // If unable to fetch, return null
    }
    const rawData = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
    return JSON.parse(rawData);
};

// Extract datasets from geojson and return as array
exports.getDatasetsFromGeoJson = function(geojson) {
    const datasets = geojson.features[0].properties.datasets; // Grab obj of dataset objects from first precinct
    const arrOfDatasets = [];
    for (const set in datasets) { // Iterate through dataset objects
        arrOfDatasets.push(set); // Add to array of datasets to return as options
    }
    return arrOfDatasets;
}

// Map dataset file names to user-friendly names
exports.mapDatasetNames = function(datasets) {
    const datasetMap = {
        T: 'Total Population',
        V: 'Voting Age',
        E: 'Elections',
        S: 'Shapes',
        CENS: 'Census',
        CENS_ADJ: 'Census Adjusted',
        ACS: 'American Community Survey',
        VAP: 'Voting Age Population',
        VAP_NH: 'Voting Age Population Non-Hispanic',
        CVAP: 'Citizen Voting Age Population',
        COMP: 'Composite',
        PRES: 'President',
        SEN: 'U.S. Senator',
        GOV: 'Governor',
        AG: 'Attorney General',
        AUD: 'Auditor',
        LTG: 'Lieutenant Governor',
        SOS: 'Secretary of State',
        TREAS: 'Treasurer',
        CMPTR: 'Comptroller',
        SC: 'State Supreme Court',
        CONG: 'U.S. Congress',
        ROFF: 'Runoff Election',
        SPEC: 'Special Election',
        SPECROFF: 'Special Runoff Election' 
    }
    // Map dataset names to user-friendly names & return as array of strings
    return datasets.map(dataset => {
        const params = dataset.split('_'); // Split dataset string by underscore
        const mappedParams = params.map(param => {
            if (param.includes('SC')) {
                // Special Case - Handle State Supreme Court with seat designation
                return `State Supreme Court ${param.slice(2)}`; // Extract seat designation if exists
            }
            return datasetMap[param] || param; // Map each param to its user-friendly name or keep original if not found
        })
        return mappedParams.join(' '); // Join the mapped params back into a string
    });
}

/*
Categories
T = Total Population
V = Voting Age Population
E = Elections
S = Shapes – I added this in the data map. It’s implicit (no key) in the GeoJSON.

Demographic Datasets (Persons)
CENS = Total Population from the decennial census
CENS_ADJ = Total Population from the decennial census, Adjusted for incarcerated persons
ACS = Total Population from the 5-year American Community Survey estimate
VAP = Voting Age Population with Race Combination categories from the decennial census
VAP_NH = Voting Age Population with Non-Hispanic Race Alone categories from the decennial census
CVAP = Citizen Voting Age Population based on the 5-year American Community Survey estimate

Election Datasets
COMP = DRA's Composite
PRES = President
SEN = U.S. Senator
GOV = Governor
AG = Attorney General
AUD = Auditor
LTG = Lieutenant Governor
SOS = Secretary of State
TREAS = Treasurer
CMPTR = Comptroller
SC* = State Supreme Court (with seat designation)
CONG = U.S. Congress

Modifiers
ROFF = Runoff election
SPEC = Special election
SPECROFF = Special Runoff election
*/