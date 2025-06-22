const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { fipsDict, stateCodes } = require('./fips-dict'); // Import FIPS dictionary and state codes set
const districtsDict = require('./districts-dict'); // Import districts dictionary, planType : count

require('dotenv').config(); // Load environment variables from .env file

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
        return `${process.env.GEOJSON_PATH}${fileName}`;
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
exports.checkFileExists = checkFileExists;

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
    if (!datasets) return null; // If no datasets provided, return null
    
    const fileMap = {
        'All Elections': '__all__',
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
    // Helper to map dataset names to their original file names
    const mapper = (dataset) => {
        const params = dataset.split(' - ');
        const fileName = params.map(param => {
            if (param.startsWith('State Supreme Court')) {
                // Handle State Supreme Court with seat designation
                return `SC${param.slice(-1)}`; // Extract seat designation
            }
            return fileMap[param] || param; // Map to file name or keep original if not found
        }).join('_');
        return fileName;
    }

    if (typeof datasets === 'string') return mapper(datasets); // If single dataset string, return mapped file name

    //else return mapped array of dataset file names
    return datasets.map(mapper);
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

// Extract state & plan type from jsonl
// Accepts file path to jsonl file
exports.getStatefromJsonl = async function(file) {
    // Create a read stream for the file
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0; // Track current line so we can limit to first 2 lines being read
    let state = null; // Initialize state variable
    let numDistricts = 0; // Track number of districts in the plan based on highest district number found
    let planType = null; // Initialize planType variable

    // Process each line
    for await (const line of rl) {
        if (lineCount >= 2) {
            for (currType in districtsDict[state]) {
                if (districtsDict[state][currType] === numDistricts) planType = currType; // Check if numDistricts matches any plan type in districtsDict
            }
            return planType && numDistricts ? [state, planType] : null; // Return state and planType if both are found, else invalid format
        }
        if (line.trim() !== '') {
            const jsonObject = JSON.parse(line);
            
            // Handle tagged jsonl
            if (jsonObject.state && stateCodes.has(jsonObject.state)) state = jsonObject.state; // set state if property is found & valid
            // Fallback for tagged jsonl, retrieve from first plan json at second line
            else if (jsonObject.plan) {
                for (const key in jsonObject.plan) {
                    if (!state) {
                        const fips = key.substring(0, 2); // Extract FIPS codes from first two characters
                        if (fipsDict[fips]) state = fipsDict[fips]; // Set state abbreviation if FIPS code matches
                    }
                    // Update numDistricts if current precint district assignment is greater than current max
                    if (jsonObject.plan[key] > numDistricts) numDistricts = jsonObject.plan[key];
                }
            }
            // Handle untagged jsonl
            else {
                for (const key in jsonObject) {
                    if (!state) {
                        const fips = key.substring(0, 2); // Extract FIPS codes from first two characters
                        if (fipsDict[fips]) state = fipsDict[fips]; // Return state abbreviation if FIPS code matches
                    }
                    // Update numDistricts if current precint district assignment is greater than current max
                    if (jsonObject[key] > numDistricts) numDistricts = jsonObject[key];
                }
            }
            lineCount++;
        }
    }
}