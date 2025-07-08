# DRA Analytics App

## Overview

The Dave's Redistricting (DRA) Analytics App is a specialized tool designed to run DRA's partisan analytics algorithms on election profiles without requiring associated DRA maps. This self-contained application provides redistricting analysis capabilities that can be used entirely offline.

### Key Features

- Run advanced partisan analytics similar to DRA's web application
- Analyze partisan profiles with district-by-district vote shares
- Generate scorecards and visualizations for redistricting analysis
- Complete offline functionality - no internet connection required
- Cross-platform support for Windows, macOS, and Linux

## Installation

1. **Download the application for your computer**
   - [Mac](https://dra2020.github.io/rdapy/downloads/dra-analytics-macos.zip)
   - [Windows](https://dra2020.github.io/rdapy/downloads/dra-analytics-win.zip)
   - [Linux](https://dra2020.github.io/rdapy/downloads/dra-analytics-linux.zip)

   **For Mac users**: If you see a message that the app "cannot be opened because the developer cannot be verified," go to `Settings > Privacy & Security` and click `Open Anyway`.

2. **Start the application**
   - Double-click the downloaded file
   - A terminal window will open (this is normal)
   - The app will automatically open in your web browser

3. **Close the application**
   - When you're finished, click the "Exit" button in the app
   - You can then close the browser window and terminal

## Working with Partisan Profiles

### Profile Format

A partisan profile is a JSON file containing:
1. A statewide two-party Democratic vote share (`statewide`)
2. An array of district-by-district Democratic vote shares (`byDistrict`)

Example:
```json
{
  "statewide": 0.515036,
  "byDistrict": [
    0.423500,
    0.428588,
    0.433880,
    0.443866,
    0.454505,
    0.456985,
    0.458005,
    0.458134,
    0.463947,
    0.473144,
    0.718314,
    0.736620,
    0.775817
  ]
}
```
Note: The districts do not have to be sorted by vote share like shown in the example.

The `sample-data` directory contains an example profile and the resulting scorecard json.

### Analyzing a Profile

1. From the main screen, upload a profile (it must be in JSON format)
2. Click 'Analyze'
3. The app will automatically analyze the data and show results

## Available Analytics

The standalone app provides the main components on DRA's Advanced analytics page. Click on each component for further reading:

- [Advanced measures of partisan bias & responsiveness](https://medium.com/dra-2020/advanced-measures-of-bias-responsiveness-c1bf182d29a9)
- [A rank-vote graph](https://medium.com/dra-2020/r-v-graph-ecfadbfea666)
- [A seats-votes curve](https://medium.com/dra-2020/seats-votes-curve-c87ce5f46fa4)

## Troubleshooting

If the application doesn't start:
- Make sure you downloaded the correct version for your computer
- For Mac users, check the security settings as noted above
- Try restarting your computer and trying again

If the analytics don't load:
- Check that your data file is in the correct format (see example above)

## Credits

- Standalone app developed by Colin Ramsay for DRA
- Analytics and plots: DRA
