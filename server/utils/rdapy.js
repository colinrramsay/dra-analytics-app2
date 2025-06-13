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
    const OUTPUT_PATH = process.env.OUTPUT_PATH || '../../output/';

    const electionString = args.elections.join(',');

    // Constructed strings for options command args based on user input: input || ''
    const commandStrings = {
      precomputed: args.precomputed ? `--precomputed ${args.precomputed}` : '',
      mode: `--mode all`, //to be made dynamic in future
      census: args.census ? `--census ${args.census}` || '',
      vap: args.vap ? `--vap ${args.vap}` || '',
      cvap: args.cvap ? `--cvap ${args.cvap}` || '',
      elections: args.elections.length ? `--elections ${electionString}` : '',
    }

    return new Promise((resolve, reject) => {
    // Command to run in the shell
    const command = `
      cd ${rdapyPath} && 
      source ${venvPath}/bin/activate && 
      scripts/score/SCORE.sh \
      --state ${args.state} \
      --plan-type ${args.planType} \
      --geojson ${args.geojson} \
      --graph ${args.graph} \
      ${commandStrings.precomputed}
      --plans ${args.plans} \
      ${commandStrings.mode}
      ${commandStrings.census}
      ${commandStrings.vap}
      ${commandStrings.cvap}
      ${commandStrings.elections}
      --scores ${args.output}_scores.csv \
      --by-district ${args.output}_by-district.jsonl
    `;

    // Spawn a shell to run the command
   e
    
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
            scores: path.join(OUTPUT_PATH, `${args.output}_scores.csv`),
            byDistrict: path.join(OUTPUT_PATH, `${args.output}_by-district.jsonl`)
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

/*
Sample python command

scripts/score/SCORE.sh \
--state NC \
--plan-type congress \
--geojson testdata/data/NC_vtd_datasets.v4.geojson \
--graph testdata/examples/NC_graph.json \
--precomputed testdata/examples/NC_congress_precomputed.json \
--plans testdata/plans/NC_congress_plans.tagged.jsonl \
--mode all \
--census T_20_CENS \
--vap V_20_VAP \
--cvap V_20_CVAP \
--elections E_16_SEN,E_20_AG \
--scores temp/TEST_congress_scores.csv \
--by-district temp/TEST_congress_by-district.jsonl
*/