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

    // Set path to Python interpreter
    let scoreProcess = path.join(VENV_PATH, 'bin', 'python3.12');
    
    // If running in development, use the Python script directly, else pass only arguments to Python executable
    const scriptPath = path.join(RDAPY_PATH, 'scripts', 'score', 'score_script.py');
   
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

    // Push optional args if they exist
    if (args.precomputed) commandArgs.push('--precomputed', args.precomputed);
    if (args.census) commandArgs.push('--census', args.census);
    if (args.vap) commandArgs.push('--vap', args.vap);
    if (args.cvap) commandArgs.push('--cvap', args.cvap);
    if (args.elections.length) commandArgs.push('--elections', electionString);

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