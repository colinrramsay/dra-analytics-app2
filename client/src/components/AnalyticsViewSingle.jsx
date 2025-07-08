/* ==================================================
View for graphic & metrics of single profile scoring
================================================== */

// Material Imports
import * as Material from '@mui/material';

//  Components Imports
import SVCurveDiagram from './SVCurveDiagram';
import RVGraph from './RVGraph';
import MetricPanel from './MetricPanel';
import ShutdownButton from './ShutdownButton';


function AnalyticsViewSingle({ profile, scorecard, resetUpload, setCurrView }) {

  /* ============================
  CONSTANTS - Copy, metadata, etc
  ============================== */
  
  // Section Headers & Info
  const biasSectionHeader = "Bias Measures";
  const biasArticleUrl = 'https://medium.com/dra-2020/advanced-measures-of-bias-responsiveness-c1bf182d29a9';
  const biasExplanation = 'These are some prominent measures of partisan bias.';
  const responsivenessSectionHeader = "Responsiveness Measures";
  const responsivenessArticleUrl = 'https://medium.com/dra-2020/advanced-measures-of-bias-responsiveness-c1bf182d29a9';
  const responsivenessExplanation = 'These are some prominent measures of responsiveness.';
  const biasHeader = {
    header: biasSectionHeader,
    url: biasArticleUrl,
    explanation: biasExplanation,
  }
  const resHeader = {
    header: responsivenessSectionHeader,
    url: responsivenessArticleUrl,
    explanation: responsivenessExplanation,
  }
  
  // Metrics Metadata
  // Metadata Class
  class Metadata {
      constructor(label, metric, abbr, symbol, units, description) {
          this.label = label;
          this.metric = metric;
          this.abbr = abbr;
          this.symbol = symbol;
          this.units = units;
          this.description = description;
          this.decimals = 2; //round displayed metric to 2 decimal places
      }
  }

  // Bias Metadata
  const prop = new Metadata("Proportional", scorecard.bias.prop, "prop", "\u{03B3}", "%", "The simple deviation from proportionality using fractional seat shares");
  const efficiencyGap = new Metadata("Efficiency gap", scorecard.bias.eG, "EG", "", "%", "The relative two-party difference in wasted votes");
  const seatsBias50 = new Metadata("Seats bias", scorecard.bias.bS50, "BS_50", "\u{03B1}_S", "%", "Half the difference in seats at 50% vote share");
  const votesBias50 = new Metadata("Votes bias", scorecard.bias.bV50, "BV_50", "\u{03B1}_V", "%", "The excess votes required for half the seats");
  const seatsBiasV = new Metadata("Partisan bias", scorecard.bias.bSV, "BS_V", "\u{03D0}", "%", "The difference in seats between the map-wide vote share and the symmetrical counterfactual share");
  const declination = new Metadata("Declination", scorecard.bias.decl, "decl", "\u{03B4}", "\u00B0", "A geometric measure of packing & cracking");
  const meanMedian = new Metadata("Mean–median", scorecard.bias.mMd, "MM", "", "%", "The average vote share across all districts minus the median vote share");
  const turnoutBias = new Metadata("Turnout bias", scorecard.bias.tOf, "TO", "", "%", "The difference between the map-wide vote share and the average district share");
  const lopsidedOutcomes = new Metadata("Lopsided outcomes", scorecard.bias.lO, "LO", "", "%", "The relative two-party difference in excess vote shares");
  const biasNotes = {
      noteLabel: 'Notes',
      notes: ['By convention, positive values of bias metrics favor Republicans & negative values favor Democrats.']
  };
  const biasMetrics = [prop, efficiencyGap, '', seatsBias50, votesBias50, seatsBiasV, '', declination, meanMedian, turnoutBias, lopsidedOutcomes]

  // Responsiveness Metadata
  const littleR = new Metadata("Responsiveness", scorecard.responsiveness.littleR, "r", "\u{03C1}", "", "The slope of the seats-votes curve at the map-wide vote share");
  const rD = new Metadata("Responsive districts", scorecard.responsiveness.rD, "Rd", "", "", "The likely number of responsive districts");
  const bigR = new Metadata("Overall responsiveness", scorecard.responsiveness.bigR, "R", "", "", "The overall responsiveness (or winner’s bonus)");
  const resMetrics = [littleR, rD, bigR];

  /* ======
  HELPERS
  ======= */

   // Download JSON data to user's computer with save dialog
   async function downloadJson(jsonData, suggestedName = 'scorecard.json') {
    // Stringify JSON data
    const jsonString = JSON.stringify(jsonData, null, 2);
    
    // Create a Blob containing the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    try {
      // Check if the File System Access API is supported
      if ('showSaveFilePicker' in window) {
        // Use the File System Access API to show a save dialog
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: suggestedName,
          startIn: 'downloads',
          types: [{
            description: 'JSON File',
            accept: { 'application/json': ['.json'] }
          }]
        });
        
        // Create a writable stream and write the blob to the file
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();
        
        console.log('File saved successfully using File System Access API');
      } else {
        // Fall back to the traditional download method for browsers without File System Access API
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('File downloaded using traditional method (File System Access API not supported)');
      }
    } catch (error) {
      console.error('Error saving file:', error);
      // If user cancels the save dialog or another error occurs, fall back to traditional download
      if (error.name !== 'AbortError') {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('Fallback to traditional download after error');
      }
    }
  }

  /* ======
  COMPONENT
  ======= */
  return (
      <>
      <Material.Box 
        component="nav" 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid', 
          borderColor: 'divider', 
          padding: 1 
        }}
      >
        {/* Group buttons left */}
        <div>
          <Material.Button 
            onClick={resetUpload} 
            sx={{ fontSize: '16px' }}
          >
            Restart
          </Material.Button>
          <Material.Button 
            onClick={() => {downloadJson(scorecard, `${profile.fileName}-scorecard`)}} 
            sx={{ fontSize: '16px' }}
          >
            Download Scorecard
          </Material.Button>
        </div>
        <ShutdownButton setCurrView={setCurrView}/>
      </Material.Box>
      <RVGraph profile={profile} scorecard={scorecard} profileName={profile.fileName} />
      <SVCurveDiagram profile={profile} scorecard={scorecard} profileName={profile.fileName} />
      {/* //Bias Measures Panel */}
      <div id='biasPanel' style={{ minWidth: 0 }}>
          <MetricPanel header={biasHeader} metrics={biasMetrics} notes={biasNotes} />
      </div>
      {/* Responsiveness Measures Panel */}
      <div id='responsivenessPanel' style={{ minWidth: 0 }}>
        <MetricPanel header={resHeader} metrics={resMetrics} />
      </div>
      </>
  )
}

//Export Component
export default AnalyticsViewSingle
