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
        const fileName = `${stateCode}_2020_graph.json`;
        return `../../sample-data/private-data/${fileName}`;
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
        return mappedParams.join(' - '); // Join the mapped params back into a string
    });
}

// Map dataset names to their original file names
exports.mapDatasetFileNames = function(datasets) {
    const fileMap = {
        'Total Population': 'T',
        'Voting Age': 'V',
        'Elections': 'E',
        'Shapes': '',
        'Census': 'CENS',
        'Census Adjusted': 'CENS_ADJ',
        'American Community Survey': 'ACS',
        'Voting Age Population': 'VAP',
        'Voting Age Population Non-Hispanic': 'VAP_NH',
        'Citizen Voting Age Population': 'CVAP',
        'Composite': 'COMP',
        'President': 'PRES',
        'U.S. Senator': 'SEN',
        'Governor': 'GOV',
        'Attorney General': 'AG',
        'Auditor': 'AUD',
        'Lieutenant Governor': 'LTG',
        'Secretary of State': 'SOS',
        'Treasurer': 'TREAS',
        'Comptroller': 'CMPTR',
        'State Supreme Court': 'SC',
        'U.S. Congress': 'CONG',
        'Runoff Election': 'ROFF',
        'Special Election': 'SPEC',
        'Special Runoff Election': 'SPECROFF' 
    };
    // Map dataset names to their original file names
    return datasets.map(dataset => {
        const params = dataset.split(' - ');
        const fileName = params.map(param => {
            if (param.startsWith('State Supreme Court')) {
                // Handle State Supreme Court with seat designation
                return `SC${param.slice(21)}`; // Extract seat designation
            }
            return fileMap[param] || param; // Map to file name or keep original if not found
        }).join('_');
        return fileName;
    });
}

// Assign datasets to arg props: census || vap || cvap || elections
exports.assignDatasets = function(datasets) {
    const datasetArgs = {
        census: null,
        vap: null,
        cvap: null,
        elections: []
    };
    datasets.forEach(dataset => {
        if (dataset.includes('CENS')) {
            datasetArgs.census = dataset;
        } else if (dataset.includes('CVAP')) {
            datasetArgs.cvap = dataset;
        } else if (dataset.includes('VAP')) {
            datasetArgs.vap = dataset;
        } else if (dataset.includes('E_')) {
            datasetArgs.elections.push(dataset);
        }
    })
    return datasetArgs;
}