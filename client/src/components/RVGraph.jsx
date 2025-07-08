/* ==============
Rank-Votes Graph
============== */

// React Imports
import { useEffect, useState } from 'react';

// Material Imports
import * as Material from '@mui/material';

// Import Plotly for rendering diagrams
import Plotly from 'plotly.js-dist-min';

// Import Utility for number formatting
import * as TU from './TableUtils';

function RVGraph({ profile, scorecard, profileName }) {
  // State
  const [rvLegendOn, setRvLegendOn] = useState(true) // diagram legend visibility
  
  // Metadata
  const rvSectionHeader = "Rank-Votes Graph";
  const rvGraphURL = 'https://medium.com/dra-2020/r-v-graph-ecfadbfea666';

  // Styling Constants
  const red = '#ff0000';   // 'red';
  const blue = '#0000ff';  // 'blue';
  const bgcolor = '#fafafa';

  /* ===============================================
  Mount Plotly Diagram on render & RV switch toggle
  ================================================= */
  useEffect(() => {
    renderRankVoteDiagram(profile, scorecard, profileName, rvLegendOn)
  }, [rvLegendOn])

  /* ==============
  RV Switch Widget
  ================ */
  function RVSwitch() {
    // const {classes, designSize} = this.props;
    // const {rvLegendOn} = this.state;

    // const isMedPlus = designSize <= MA.DW.MEDIUMPLUS;

    return (
      <Material.FormGroup row>
        <Material.FormControlLabel
          label='Show Legend'
          //classes={{root: classes.switchRoot, label: isMedPlus ? classes.switchLabelSmall : classes.switchLabel}}
          control={
            <Material.Switch
              checked={rvLegendOn}
              color='default'
              //classes={{switchBase: classes.switchBase, checked: classes.checked, track: classes.track}}
              onChange={() => {
                setRvLegendOn(!rvLegendOn);
              }}
            />} />
      </Material.FormGroup>
    );
  }

  /* ===================================
  Mounts diagram to rank-vote-graph card
  ====================================== */
  function renderRankVoteDiagram(profile, scorecard, profileName, bLegend) {
    //UPDATE: make width dynamic
    const diagramWidth = 750;
    
    let rvTraces = [];
    let rvLayout = {};
    let rvConfig = {};
  
    const shadedColor = 'beige';  // #F5F5DC
    const delta = 5 / 100;        // COMPETITIVE - Relaxed range = 0.5 +/– 0.05

    // Traces for R wins & D wins points
    // Set district marker size between 1–12 px, based on the # of districts
    const N = profile.byDistrict.length;
    const W = diagramWidth * (2 / 3);
    const markerSize = Math.min(Math.max(1, Math.round(W / N)), 12);
    const { rWinVfs, rWinRanks, rWinLabels, dWinVfs, dWinRanks, dWinLabels, minVf, maxVf } = extractRVGraphData();
    const districtHoverTemplate = 'District %{text}<br>%{y:5.2%}<extra></extra>';
    const repWinTrace = {
      x: rWinRanks,
      y: rWinVfs,
      mode: 'markers',
      type: 'scatter',
      text: rWinLabels,
      marker: {
        color: red,
        symbol: 'square',
        size: markerSize
      },
      hovertemplate: districtHoverTemplate,
      showlegend: false
    };
    const demWinTrace = {
      x: dWinRanks,
      y: dWinVfs,
      mode: 'markers',
      type: 'scatter',
      text: dWinLabels,
      marker: {
        color: blue,
        symbol: 'square',
        size: markerSize
      },
      hovertemplate: districtHoverTemplate,
      showlegend: false
    };

    // Traces for the "competitive" region
    const hr50PlusTrace = {
      x: [0.0, 1.0],
      y: [0.5 + delta, 0.5 + delta],
      fill: 'tonexty',
      fillcolor: shadedColor,
      type: 'scatter',
      name: 'Competitive range',
      text: 'competitive',
      mode: 'lines',
      line: {
        color: shadedColor,
        width: 0.5
      },
      hoverinfo: 'none',
      showlegend: true
    };
    const hr50Trace = {
      x: [0.0, 1.0],
      y: [0.5, 0.5],
      type: 'scatter',
      mode: 'lines',
      line: {
        color: 'black',
        width: 1
      },
      hoverinfo: 'none',
      showlegend: false
    };
    const hr50MinusTrace = {
      x: [0.0, 1.0],
      y: [0.5 - delta, 0.5 - delta],
      type: 'scatter',
      mode: 'lines',
      line: {
        color: shadedColor,
        width: 0.5
      },
      hoverinfo: 'none',
      showlegend: false
    };
    
    // Traces for statewide vote share and average D & R win percentages
    const nPts = 20;
    const ruleXs = [...Array(nPts + 1).keys()].map(x => ((100 / nPts) * x) / 100);
    /// EDITED ///
    const statewideVf = profile.statewide;
    const avgDWin = scorecard.averageDVf;
    const avgRWin = scorecard.averageRVf;
    const invertedAvgRWin = 1.0 - avgRWin;
    const statewideVfYs = [...Array(nPts + 1).keys()].map(x => statewideVf);
    const statewideVfWinHoverLabel = 'Total D vote: ' + TU.formatNumber(statewideVf, '%', 2) + '%';
    const statewideVfTrace = {
      x: ruleXs,
      y: statewideVfYs,
      type: 'scatter',
      mode: 'lines',
      name: statewideVfWinHoverLabel,  // 'Statewide D vote %',
      line: {
        color: 'black',
        width: 1,
        dash: 'dashdot'
      },
      text: statewideVfWinHoverLabel,
      hoverinfo: 'text',
      hoveron: 'points',
      showlegend: true
    };
    const vrRuleHeight = 0.10;
    const invertedPRSfXs = [(1.0 - statewideVf), (1.0 - statewideVf)];
    const prSfYs = [statewideVf - vrRuleHeight, statewideVf + vrRuleHeight];
    const proportionalSfTrace = {
      x: invertedPRSfXs,
      y: prSfYs,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: 'black',
        width: 1,
        dash: 'dashdot'
      },
      hoverinfo: 'none',
      showlegend: false
    };
    const avgDWinYs = [...Array(nPts + 1).keys()].map(x => avgDWin);
    const avgDWinHoverLabel = 'Average D win: ' + TU.formatNumber(avgDWin, '%', 2) + '%';
    const avgDWinTrace = {
      x: ruleXs,
      y: avgDWinYs,
      type: 'scatter',
      mode: 'lines',
      name: avgDWinHoverLabel, // 'Average D win %',
      line: {
        color: blue,
        width: 0.5,
        dash: 'dot'
      },
      text: avgDWinHoverLabel,
      hoverinfo: 'text',
      hoveron: 'points',
      showlegend: true
    };
    const avgRWinYs = [...Array(nPts + 1).keys()].map(x => avgRWin);
    const avgRWinHoverLabel = 'Average R win: ' + TU.formatNumber(invertedAvgRWin, '%', 2) + '%';
    const avgRWinTrace = {
      x: ruleXs,
      y: avgRWinYs,
      type: 'scatter',
      mode: 'lines',
      name: avgRWinHoverLabel,  // 'Average R win %',
      line: {
        color: red,
        width: 0.5,
        dash: 'dot'
      },
      text: avgRWinHoverLabel,
      hoverinfo: 'text',
      hoveron: 'points',
      showlegend: true
    };
    // NOTE - The order is important!
    rvTraces.push(hr50MinusTrace);
    rvTraces.push(hr50PlusTrace);
    rvTraces.push(hr50Trace);
    rvTraces.push(proportionalSfTrace);
    rvTraces.push(statewideVfTrace);
    if (avgDWin)
      rvTraces.push(avgDWinTrace);
    if (avgRWin)
      rvTraces.push(avgRWinTrace);
    if (rWinVfs.length > 0)
      rvTraces.push(repWinTrace);
    if (dWinVfs.length > 0)
      rvTraces.push(demWinTrace);
    // If declination is defined, add traces for the R points & line, the D points
    // & lines, and the extension of the R line.
    const decl = scorecard.bias.decl;
    if (decl)
    {
      const X = 0; const Y = 1;
      const { Sb, Ra, Rb, Va, Vb } = scorecard.bias.rvPoints;
      // Convert R vote shares (used in dra-score for 'decl') to D vote shares
      const rDeclPt = [(1 - Ra), (1 - Va)];
      const dDeclPt = [(1 - Rb), (1 - Vb)];
      const pivotDeclPt = [(1 - Sb), 0.5];
      // Make traces for the R & D line segments and the pivot point
      const rDeclXs = [rDeclPt[X], pivotDeclPt[X]];
      const rDeclYs = [rDeclPt[Y], pivotDeclPt[Y]];
      const dDeclXs = [pivotDeclPt[X], dDeclPt[X]];
      const dDeclYs = [pivotDeclPt[Y], dDeclPt[Y]];
      const pivotDeclXs = [pivotDeclPt[X]];
      const pivotDeclYs = [pivotDeclPt[Y]];
      const rDeclTrace = {
        x: rDeclXs,
        y: rDeclYs,
        mode: 'lines',
        type: 'scatter',
        line: {
          color: 'black',
          width: 1
        },
        hoverinfo: 'none',
        showlegend: false
      };
      rvTraces.push(rDeclTrace);
      const dDeclTrace = {
        x: dDeclXs,
        y: dDeclYs,
        mode: 'lines',
        type: 'scatter',
        line: {
          color: 'black',
          width: 1
        },
        hoverinfo: 'none',
        showlegend: false
      };
      rvTraces.push(dDeclTrace);
      const pivotPtLabel = TU.formatNumber(decl, '\u00B0', 2) + '\u00B0';
      const pivotPtHoverTemplate = pivotPtLabel + '<extra></extra>';
      const pivotPtTrace = {
        x: pivotDeclXs,
        y: pivotDeclYs,
        mode: 'markers',
        type: 'scatter',
        name: 'Declination: ' + pivotPtLabel,
        marker: {
          color: 'white',
          symbol: 'circle',
          size: 10,
          line: {
            color: 'black',
            width: 2
          }
        },
        hovertemplate: pivotPtHoverTemplate,
        showlegend: true
      };
      // Make the dotted line extension of the R trace, if decl is significant
      const declThreshold = 5;  // degrees
      if (Math.abs(decl) > declThreshold) 
      {
        const rDy = (pivotDeclPt[Y] - rDeclPt[Y]);
        const rDx = (pivotDeclPt[X] - rDeclPt[X]);
        const dDy = (dDeclPt[Y] - pivotDeclPt[Y]);
        const dDx = (dDeclPt[X] - pivotDeclPt[X]);
        const slope = rDy / rDx;
        const dDistance = distance([pivotDeclPt[X], pivotDeclPt[Y]], [dDeclPt[X], dDeclPt[Y]]);
        const rDistance = distance([rDeclPt[X], rDeclPt[Y]], [pivotDeclPt[X], pivotDeclPt[Y]]);
        const ratio = dDistance / rDistance;
        const beyondPt = [
          pivotDeclPt[X] + (ratio * rDx),
          pivotDeclPt[Y] + (ratio * rDy)
        ];
        const beyondDeclXs = [pivotDeclPt[X], beyondPt[X]];
        const beyondDeclYs = [pivotDeclPt[Y], beyondPt[Y]];
        const dottedDeclTrace = {
          x: beyondDeclXs,
          y: beyondDeclYs,
          mode: 'lines',
          type: 'scatter',
          line: {
            color: 'black',
            width: 1,
            dash: 'dash'
          },
          hoverinfo: 'none',
          showlegend: false
        };
        rvTraces.push(dottedDeclTrace);
      }
      // Add the pivot point *after* a potential dotted line, so that it's on "top"
      rvTraces.push(pivotPtTrace);
    }
    // The r(v) plot layout
    const rankRange = [0.0, 1.0];
    const vfRange = [
      Math.max(minVf - 0.025, 0.0),
      Math.min(maxVf + 0.025, 1.0)
    ];
    const heightPct = (vfRange[1] - vfRange[0]);
    const diagramHeight = ((heightPct * diagramWidth) > 450) ? 700 : 450;
    const X = 0;
    const Y = 1;
    const lowerRight = [0.67, 0];
    const upperLeft = [0.02, 0.85];
    let legendPosition = upperLeft;
    if (decl)
    {
      if (decl < 0) legendPosition = lowerRight;
    }
    else  // 'decl' undefined
    {
      // If there are 5 or more districts and 'decl' is undefined, then the 
      // result was/is a sweep for one party or the other.
      const bSweep = (N >= 5) ? true : false;
      if ((!bSweep) && (rWinRanks.length > dWinRanks.length)) legendPosition = lowerRight;
    }
    rvLayout = {
      title: 'Rank-Votes Graph: ' + profileName,
      width: diagramWidth,
      height: diagramHeight,
      xaxis: {
        title: 'District',
        range: rankRange,
        showgrid: false,
        zeroline: false,
        showticklabels: false
      },
      yaxis: {
        title: "D Vote %",
        range: vfRange,
        scaleanchor: 'x',
        scaleratio: 1,
        showgrid: true,
        zeroline: false,
        tickformat: '.0%'
      },
      dragmode: 'zoom',
      hovermode: 'closest',
      showlegend: bLegend,
      legend: {
        x: legendPosition[X],
        y: legendPosition[Y],
        bordercolor: 'black',
        borderwidth: 1
      },
      paper_bgcolor: bgcolor,
      plot_bgcolor: bgcolor
    };

    // Configure hover menu options & behavior
    rvConfig = {
      toImageButtonOptions: {
        format: 'png', // one of png, svg, jpeg, webp
        filename: 'r(v)-graph'
      },
      // Remove the unwanted plotly hover commands. Let users pan & zoom.
      modeBarButtonsToRemove: ['zoom2d', 'select2d', 'lasso2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      scrollZoom: true,         // Helps w/ lots of districts
      displayModeBar: true,     // Always show the download icon
      displaylogo: false,
      responsive: true
    };
    Plotly.newPlot('rank-vote-graph', rvTraces, rvLayout, rvConfig);
  }

  /* ==========================
  Helper functions for diagram
  ============================ */
  function extractRVGraphData() {
    const N = profile.byDistrict.length;

    // Step 1 - Get the unsorted vote shares by district index
    const unsortedVfArray = profile.byDistrict;

    const minVf = Math.min(...unsortedVfArray);
    const maxVf = Math.max(...unsortedVfArray);

    // Step 2 - Convert the unsorted VfArray into an array of [Vf, (district) index] pairs.
    let idVfpairs = unsortedVfArray.map((item, index) => [item, index + 1]);
    const Vf = 0;  // Index into [Vf, (district) index] pair
    const Id = 1;  // Ditto

    // Step 3 - Sort the pairs in ascending order of vote share.
    idVfpairs.sort((a, b) => a[Vf] - b[Vf]);

    // Step 4 - Unzip that into separate sorted Vf and sorted districtId arrays.
    const sortedVfArray = idVfpairs.map((pair) => pair[Vf]);
    const sortedIndexes = idVfpairs.map((pair) => pair[Id]);

    // Step 5 - Create a sorted array of district labels
    const sortedLabels = sortedIndexes.map((i) => i.toLocaleString());

    // Step 6 - Create an array of district ranks that correspond to the 1–N ordering.
    const districtRanks = Array.from(Array(N)).map((e, i) => i + 1).map(i => rank(i, N));

    // Step 7 - Split the sorted Vf, rank, and label arrays into R and D subsets.
    const nRWins = sortedVfArray.filter((x) => x <= 0.5).length;  // Ties credited to R's

    const rWinVfs = sortedVfArray.slice(0, nRWins);
    const rWinRanks = districtRanks.slice(0, nRWins);
    const rWinLabels = sortedLabels.slice(0, nRWins);

    const dWinVfs = sortedVfArray.slice(nRWins);
    const dWinRanks = districtRanks.slice(nRWins);
    const dWinLabels = sortedLabels.slice(nRWins);

    const data = {
      rWinVfs: rWinVfs,
      rWinRanks: rWinRanks,
      rWinLabels: rWinLabels,
      dWinVfs: dWinVfs,
      dWinRanks: dWinRanks,
      dWinLabels: dWinLabels,
      minVf: minVf,
      maxVf: maxVf
    };
    
    return data;
  }

  function rank(i, n) {
    return (i - 0.5) / n;
  }

  function distance(pt1, pt2) {
    const X = 0;
    const Y = 1;

    const d = Math.sqrt(((pt2[X] - pt1[X]) ** 2) + ((pt2[Y] - pt1[Y]) ** 2));

    return d;
  }

  /* ======
  COMPONENT
  ======= */
  return (
    <div id='scorePanel' style={{textAlign: 'center'}}>
      <TU.PanelHeader header={rvSectionHeader} url={rvGraphURL} tooltip='More information' />
      <Material.Table>
        <Material.TableBody>
          <Material.TableRow>
            <Material.TableCell align='center'>
              {/* NOTE - You have to specify a width to center the div, but 800 => 700  */}
              <Material.Card id='rank-vote-graph' style={{margin: 'auto', width: 750}} raised></Material.Card>
            </Material.TableCell>
            <Material.TableCell align='left'>
              <RVSwitch />
            </Material.TableCell>
          </Material.TableRow>
        </Material.TableBody>
      </Material.Table>
    </div>
  )
}

export default RVGraph;
