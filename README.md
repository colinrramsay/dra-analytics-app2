# DRA Analytics App

## Overview

The Dave's Redistricting (DRA) Analytics App is a specialized tool designed to run DRA's partisan analytics algorithms on election profiles without requiring associated DRA maps. This self-contained application provides redistricting analysis capabilities that can be used entirely offline.

### Key Features

- Run advanced partisan analytics similar to DRA's web application
- Analyze partisan profiles with district-by-district vote shares
- Generate scorecards and visualizations for redistricting analysis
- Complete offline functionality - no internet connection required
- Cross-platform support for Windows, macOS, and Linux

## Quickstart

For non-technical users, node binaries are available for download. These binaries run a local server and automatically open the application in your default web browser - no additional setup required.

1. **Download the appropriate executable**
   - [Mac](https://dra2020.github.io/rdapy/downloads/dra-analytics-macos.zip)
   - [Windows](https://dra2020.github.io/rdapy/downloads/dra-analytics-win.zip)
   - [Linux](https://dra2020.github.io/rdapy/downloads/dra-analytics-linux.zip)

   Note, if the binary does not open on Mac because it can't be verified, it can be manually approved by navigating to `Settings > Privacy & Security > Open Anyway`.

2. **Open the executable**
   A local server will be started in a terminal window, and once running the app will automatically launch in your default browser.
   
3. **Shutdown the server**
   When finished, shutdown the server using the button in the app UI to ensure it's no longer running. Alternately, you can manually shutdown the server in your terminal window using ctrl + C.

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

### Uploading and Analyzing Profiles

1. From the main application screen, select a valid partisan profile JSON file
2. Click 'Analyze'
3. The application will process the file and display analytics results

## Available Analytics

The standalone app provides the main components on DRA's Advanced analytics page. Click on each component for further reading:

- [Advanced measures of partisan bias & responsiveness](https://medium.com/dra-2020/advanced-measures-of-bias-responsiveness-c1bf182d29a9)
- [A rank-vote graph](https://medium.com/dra-2020/r-v-graph-ecfadbfea666)
- [A seats-votes curve](https://medium.com/dra-2020/seats-votes-curve-c87ce5f46fa4)

Analytics are scored by the `@dra2020/dra-analytics` package. More info [here](https://www.npmjs.com/package/@dra2020/dra-analytics).

## Troubleshooting

### Common Issues

1. **Application Not Starting**
   - Verify that both client and server dependencies are installed
   - Check that ports 5173 and 3000 are available

2. **Analytics Not Loading**
   - Ensure your partisan profile follows the correct format
   - Check the server logs for any specific errors

## Project Organization

The project is structured into two main components:

### Client (`/client`)

- A React Single Page Application (SPA) built with Vite
- Provides the user interface for uploading and analyzing partisan profiles
- Contains components for visualizing analytics results
- Uses Plotly for data visualization

### Server (`/server`)

- An Express.js server that handles requests from the client
- Processes partisan profiles using the `@dra2020/dra-analytics` package
- Generates analytics scorecards and metrics
- Communicates with the client via a defined API

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm (Latest version recommended)
- Git for version control

## Development Setup

In the development environment, the Vite dev server proxies requests from the React app to the Express server.

1. **Clone the repository**
   ```bash
   git clone https://github.com/dra2020/dra-analytics-app2.git
   cd dra-analytics-app2
   ```

2. **Install dependencies for both client and server**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```
3. **Establish environment variables (optional)**
    - Create a .env file in the server directory with ```PORT = {YOUR-PORT}``` to run Express on a custom port.
    - If using a custom port, update vite.config.js to set the proxy target to ```http://localhost:{PORT}```
    - By default, the Express server will run on PORT 3001

4. **Start the development environment**
   ```bash
   # In the server directory
   npm run dev
   ```
   The Express server spawns a child process to start the Vite React server in the development environment.

5. **Access the application**
   - The client will be available at `http://localhost:5173` (default Vite port)
   - The server will be running at `http://localhost:3001` (default Express port - in the dev environment the root domain will not serve anything)

6. **Close the application**
   - Use the 'exit' button in the UI to kill both the Express and Vite servers
   - Once the servers are shutdown, you may close the browser window.

## Build Process

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```
   This creates a production-ready build in the `server/dist` directory.

2. **Run the server**
   ```bash
   cd server
   npm start
   ```
   This starts the Express server.

3. **Access the application**
   In the production environment the Express server will serve the React app from the root domain at `http://localhost:3001`

4. **Close the application**
   The same steps as in the development setup may be used to kill the Express server and close the app.

## Creating Binaries

To create standalone binaries for different platforms:

```bash
# From the server directory
npm run build
```

This uses pkg to create executables for Windows, macOS, and Linux in the `app` directory at the project root.

## License

See LICENSE in repository root

## Credits

- Standalone app developed by Colin Ramsay for DRA
- Analytics and plots: DRA
