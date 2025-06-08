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

    return new Promise((resolve, reject) => {
    // Command to run in the shell
    const command = `
      cd ${rdapyPath} && 
      source ${venvPath}/bin/activate && 
      scripts/score/SCORE.sh \\
      --state ${args.state} \\
      --plan-type ${args.planType} \\
      --geojson ${args.geojson} \\
      --graph ${args.graph} \\
      --precomputed ${args.precomputed} \\
      --plans ${args.plans} \\
      --scores ${args.scores} \\
      --by-district ${args.byDistrict}
    `;

    // Spawn a shell to run the command
    const childProcess = spawn('/bin/bash', ['-c', command]);
    
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
            scores: path.join(rdapyPath, 'temp/TEST_congress_scores.csv'),
            byDistrict: path.join(rdapyPath, 'temp/TEST_congress_by-district.jsonl')
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