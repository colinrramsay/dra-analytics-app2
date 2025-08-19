const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config()

const { VENV_PATH, RDAPY_PATH } = require('../utils/filePaths');

function runScoreScript(args) {
  
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
  
    let scoreProcess = path.join(VENV_PATH, 'bin', 'python3.12');
    // if (process.pkg) {
    //   let executableName = 'rdapy_score'; // Default executable name, can be made dynamic in future
    //   const executablesDir = path.resolve(path.dirname(process.execPath), 'executables');
    //   scoreProcess = path.join(executablesDir, executableName);
    // }
    
    // If running in development, use the Python script directly, else pass only arguments to Python executable
    const scriptPath = path.join(RDAPY_PATH, 'scripts', 'score', 'score_script.py');
    //const scriptPath = process.pkg ? null : path.join(RDAPY_PATH, 'scripts', 'score', 'score_script.py');
   
    const commandArgs = [];
    if (scriptPath) commandArgs.push(scriptPath);

     // Set required command arguments
    commandArgs.push(
      '--state', args.state,
      '--plan-type', args.planType,
      '--geojson', args.geojson,
      '--graph', args.graph,
      '--plans', args.plans,
      '--mode', 'all',
      '--scores', `${args.output}_scores.csv`,
      '--by-district', `${args.output}_by-district.jsonl`
    );

    // Push option args if they exist
    if (args.precomputed) commandArgs.push('--precomputed', args.precomputed);
    if (args.census) commandArgs.push('--census', args.census);
    if (args.vap) commandArgs.push('--vap', args.vap);
    if (args.cvap) commandArgs.push('--cvap', args.cvap);
    if (args.elections.length) commandArgs.push('--elections', electionString);

    // Command to run in the shell
    // const command = `
    //   ${scriptPath} \
    //   --state ${args.state} \
    //   --plan-type ${args.planType} \
    //   --geojson ${args.geojson} \
    //   --graph ${args.graph} \
    //   ${commandStrings.precomputed} \
    //   --plans ${args.plans} \
    //   ${commandStrings.mode} \
    //   ${commandStrings.census} \
    //   ${commandStrings.vap} \
    //   ${commandStrings.cvap} \
    //   ${commandStrings.elections} \
    //   --scores ${args.output}_scores.csv \
    //   --by-district ${args.output}_by-district.jsonl
    // `;

    // Spawn a shell to run the command
    console.log(process.env.PYTHONPATH); //debugging log
    console.log('Score process:', scoreProcess);
    console.log(`Running script with args: ${commandArgs.join(' ')}`);
    
    const venvBin = process.platform === "win32"
      ? path.join(VENV_PATH, "Scripts")
      : path.join(VENV_PATH, "bin");
    
    const childProcess = spawn(scoreProcess, commandArgs, {
      cwd: process.pkg ? path.dirname(process.execPath) : RDAPY_PATH,
      env: {
        ...process.env,
        PATH: `${venvBin}${path.delimiter}${process.env.PATH}`,
        PYTHONPATH: path.join(VENV_PATH, 'lib', 'python3.12', 'site-packages'),
      },
    });

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