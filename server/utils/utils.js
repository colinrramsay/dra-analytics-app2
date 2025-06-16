const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Extract state from jsonl
// Accepts file path to jsonl file
exports.getStatefromJsonl = async function(file) {
    // Create a read stream for the file
    const fileStream = fs.createReadStream(file);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    // FIPS code to state abbreviation mapping
    const fipsDic = {
        "01": "AL",
        "02": "AK",
        "04": "AZ",
        "05": "AR",
        "06": "CA",
        "08": "CO",
        "09": "CT",
        "10": "DE",
        "12": "FL",
        "13": "GA",
        "15": "HI",
        "16": "ID",
        "17": "IL",
        "18": "IN",
        "19": "IA",
        "20": "KS",
        "21": "KY",
        "22": "LA",
        "23": "ME",
        "24": "MD",
        "25": "MA",
        "26": "MI",
        "27": "MN",
        "28": "MS",
        "29": "MO",
        "30": "MT",
        "31": "NE",
        "32": "NV",
        "33": "NH",
        "34": "NJ",
        "35": "NM",
        "36": "NY",
        "37": "NC",
        "38": "ND",
        "39": "OH",
        "40": "OK",
        "41": "OR",
        "42": "PA",
        "44": "RI",
        "45": "SC",
        "46": "SD",
        "47": "TN",
        "48": "TX",
        "49": "UT",
        "50": "VT",
        "51": "VA",
        "53": "WA",
        "54": "WV",
        "55": "WI",
        "56": "WY",
        "11": "DC",
        "72": "PR"
    }

    let lineCount = 0; // Track current line so we can limit to first 2 lines being read

    // Process each line
    for await (const line of rl) {
        if (lineCount >= 2) return null; // Limit to first 2 lines - if state not found already, jsonl is formatted incorrectly
        if (line.trim() !== '') {
            const jsonObject = JSON.parse(line);
            
            // Handle tagged jsonl
            if (jsonObject.state) return jsonObject.state; // Return state if found
            // Fallback for tagged jsonl, retrieve from first plan json at second line
            else if (jsonObject.plan) {
                for (const key in jsonObject.plan) {
                    const fips = key.substring(0, 2); // Extract FIPS codes from first two characters
                    if (fipsDic[fips]) return fipsDic[fips]; // Return state abbreviation if FIPS code matches
                    break; // Break after first key to avoid multiple returns
                }
            }
            // Handle untagged jsonl
            else {
                for (const key in jsonObject) {
                    const fips = key.substring(0, 2); // Extract FIPS codes from first two characters
                    if (fipsDic[fips]) return fipsDic[fips]; // Return state abbreviation if FIPS code matches
                    break; // Break after first key to avoid multiple returns
                }
            }
            lineCount++;
        }
    }
}