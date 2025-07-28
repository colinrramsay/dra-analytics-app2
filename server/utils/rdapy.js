const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config()

/**
 * Runs the SCORE.sh script with the provided parameters
 * @param {string} rdapyPath - Path to the rdapy directory
 * @param {string} venvPath - Path to your virtual environment
 * @returns {Promise<string>} - Promise that resolves with the command output
 */
function runScoreScript(args) {
  // Manually defined paths for testing
  const rdapyPath = process.env.RDAPY_PATH || path.resolve(__dirname, '../../rdapy');
  const venvPath = process.env.VENV_PATH;
  const pythonPath = path.join('/Users/colinramsay/.venvs/rdapy', 'bin', 'python');
  
  let processArgs;
  
  const electionString = args.elections.join(',');
  // Constructed strings for optional command args based on user input: input || ''
  const commandStrings = {
    precomputed: args.precomputed ? `--precomputed ${args.precomputed}` : '',
    mode: `--mode all`, //to be made dynamic in future
    census: args.census ? `--census ${args.census}` : '',
    vap: args.vap ? `--vap ${args.vap}` : '',
    cvap: args.cvap ? `--cvap ${args.cvap}` : '',
    elections: args.elections.length ? `--elections ${electionString}` : '',
  }
  return new Promise((resolve, reject) => {
    // Set process type
    // Python executable in pkg Node binary
    // Python script in development environment
  
    let scoreProcess = path.join(venvPath, 'bin', 'python');
    if (process.pkg) {
      let executableName = 'rdapy_score'; // Default executable name, can be made dynamic in future
      const executablesDir = path.resolve(path.dirname(process.execPath), 'executables');
      scoreProcess = path.join(executablesDir, executableName);
    }
    
    // If running in development, use the Python script directly, else pass only arguments to Python executable
    const scriptPath = process.pkg ? '' : path.join(rdapyPath, 'scripts', 'score', 'score_script.py');

    // Command to run in the shell
    const command = `
      ${scriptPath} \
      --state ${args.state} \
      --plan-type ${args.planType} \
      --geojson ${args.geojson} \
      --graph ${args.graph} \
      ${commandStrings.precomputed} \
      --plans ${args.plans} \
      ${commandStrings.mode} \
      ${commandStrings.census} \
      ${commandStrings.vap} \
      ${commandStrings.cvap} \
      ${commandStrings.elections} \
      --scores ${args.output}_scores.csv \
      --by-district ${args.output}_by-district.jsonl
    `;

    // Spawn a shell to run the command
    console.log(`Running command: ${command}`);
    const childProcess = spawn(scoreProcess, command);

    let stdoutData = '';
    let stderrData = '';
    
    // Collect stdout data
    childProcess.stdout.on('data', (data) => {
      const dataStr = data.toString();
      console.log(dataStr);
      stdoutData += dataStr;
    });

    // Collect stderr data
    childProcess.stderr.on('data', (data) => {
      const dataStr = data.toString();
      console.error(dataStr);
      stderrData += dataStr;
    });

    // Handle process completion
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve({
          stdout: stdoutData,
          resultFiles: {
            scores: `${args.output}_scores.csv`,
            byDistrict: `${args.output}_by-district.jsonl`
          }
        });
      } else {
        reject(new Error(`Process exited with code ${code}\nStderr: ${stderrData}`));
      }
    });

    // Handle process errors
    childProcess.on('error', (err) => {
      reject(new Error(`Failed to start process: ${err.message}`));
    });
  });
}

module.exports = { runScoreScript };

// WORK IN PROGRESS CODE

/**
 * Alternative command construction using score_script.py instead of SCORE.sh
 * This is not used yet but can be swapped in when ready to transition
 */
// function constructPythonScoreCommand(args, rdapyPath, venvPath) {
//   const electionString = args.elections.join(',');

//   // Constructed strings for optional command args based on user input: input || ''
//   const commandStrings = {
//     precomputed: args.precomputed ? `--precomputed ${args.precomputed}` : '',
//     mode: `--mode all`, //to be made dynamic in future
//     census: args.census ? `--census ${args.census}` : '',
//     vap: args.vap ? `--vap ${args.vap}` : '',
//     cvap: args.cvap ? `--cvap ${args.cvap}` : '',
//     elections: args.elections.length ? `--elections ${electionString}` : '',
//   }

//   return `
//     cd ${rdapyPath} && 
//     source ${venvPath}/bin/activate && 
//     python scripts/score/score_script.py \
//     --state ${args.state} \
//     --plan-type ${args.planType} \
//     --geojson ${args.geojson} \
//     --graph ${args.graph} \
//     ${commandStrings.precomputed} \
//     --plans ${args.plans} \
//     ${commandStrings.mode} \
//     ${commandStrings.census} \
//     ${commandStrings.vap} \
//     ${commandStrings.cvap} \
//     ${commandStrings.elections} \
//     --scores ${args.output}_scores.csv \
//     --by-district ${args.output}_by-district.jsonl
//   `;
// }

// To use the Python script version in the future, modify runScoreScript to use:
// const command = constructPythonScoreCommand(args, rdapyPath, venvPath);

// Alternative implementation using Python script directly

  // const pythonPath = path.join(venvPath, 'bin', 'python');
  
  // // Fix paths by removing leading slashes
  // const fixPath = (p) => p ? p.replace(/^\//, '') : p;
  
  // return new Promise((resolve, reject) => {
  //   // Change working directory to rdapy path
  //   process.chdir(rdapyPath);
    
  //   // Build arguments array
  //   const pythonArgs = [
  //     'scripts/score/score_script.py',
  //     '--state', args.state,
  //     '--plan-type', args.planType,
  //     '--geojson', fixPath(args.geojson),
  //     '--graph', fixPath(args.graph),
  //     '--plans', fixPath(args.plans),
  //     '--mode', 'all',
  //     '--scores', `${args.output}_scores.csv`,
  //     '--by-district', `${args.output}_by-district.jsonl`
  //   ];
    
  //   // Add optional arguments
  //   if (args.precomputed) pythonArgs.push('--precomputed', fixPath(args.precomputed));
  //   if (args.census) pythonArgs.push('--census', args.census);
  //   if (args.vap) pythonArgs.push('--vap', args.vap);
  //   if (args.cvap) pythonArgs.push('--cvap', args.cvap);
  //   if (args.elections.length) pythonArgs.push('--elections', args.elections.join(','));
    
  //   // Spawn Python process directly
  //   const childProcess = spawn(pythonPath, pythonArgs);
    
  //   // ... rest of your code to handle output ...
  // });