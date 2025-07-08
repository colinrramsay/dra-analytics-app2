/* ======================
Seat Votes Curve Diagram
====================== */

// React Imports
import { useEffect, useState } from 'react';

// Material Imports
import * as Material from '@mui/material';

// Import Plotly for rendering diagrams
import Plotly from 'plotly.js-dist-min';

// Import Utility for number formatting
import * as TU from './TableUtils';

function SVCurveDiagram({ profile, scorecard, profileName }) {
  // State
  const [svLegendOn, setSvLegendOn] = useState(true) // diagram legend visibility
  const [svRCurveOn, setSvRCurveOn] = useState(true) // R curve visibility

  // Metadata
  const svCurveSectionHeader = 'Seats-Votes Curve';
  const svCurveURL = 'https://medium.com/dra-2020/s-v-curve-c87ce5f46fa4';

  // Styling Constants
  const red = '#ff0000';   // 'red';
  const blue = '#0000ff';  // 'blue';
  const bgcolor = '#fafafa';
  
  /* ===============================================
  Mount Plotly Diagram on render & switch toggles
  ================================================= */
  useEffect(() => {
    renderSVCurveDiagram(profile, scorecard, profileName, svLegendOn, svRCurveOn)
  }, [svLegendOn, svRCurveOn])

  /* ==============
  SV Switch Widget
  =============== */
  function SVSwitch() {
    //const {classes, designSize} = this.props;

    //const isMedPlus = designSize <= MA.DW.MEDIUMPLUS;

    return (
      <Material.FormGroup>
        <Material.FormControlLabel
          label='Show R Curve'
          control={
            <Material.Switch
              checked={svRCurveOn}
              color='default'
              onChange={() => {
                setSvRCurveOn(!svRCurveOn);
              }}
            />} />
        <Material.FormControlLabel
          label='Show Legend'
          control={
            <Material.Switch
              checked={svLegendOn}
              color='default'
              onChange={() => {
                setSvLegendOn(!svLegendOn);
              }}
            />} />
      </Material.FormGroup>
    );
  }

  function renderSVCurveDiagram(profile, scorecard, scorecardName, bLegend, bRCurve) {
    //BIND DATA
    // Unzip the D S/V curve points into separate V and S arrays.
    const dSVpoints = scorecard.dSVpoints;
    const v_d = dSVpoints.map(pt => pt.v);
    const s_d = dSVpoints.map(pt => pt.s);

    const Bv = scorecard.bias.bV50;
    const Bs = scorecard.bias.bS50;

    const rSVpoints = scorecard.rSVpoints;
    const v_r = rSVpoints.map(pt => pt.v);
    const s_r = rSVpoints.map(pt => pt.s);

    const Vf = profile.statewide;
    const Sf = Vf - scorecard.bias.prop;
    // END BIND

    let svTraces = [];
    let svLayout = {};
    let svConfig = {};

    // Pre-zoom the graph in on the square region that encompasses:
    // * The center point of symmetry -- (0.5, 0.5)
    // * Proportionality at Vf -- (Vf, Sf)
    // * Seats bias -- (0.5, 0.5 - seats bias)
    // * Votes bias -- (0.5 + votes bias, 0.5)
    // * Extra credit: EG at Vf

    let x_range = [0.0, 1.0];
    let y_range = [0.0, 1.0];

    const sym = 0.5;
    const S_BS_50 = 0.5 - scorecard.bias.bS50;  // More binding
    const V_BV_50 = 0.5 + scorecard.bias.bV50;  // More binding
    const S_EG = 0.5 + (2.0 * (Vf - 0.5));

    const margin = 0.05;  // +/– 5%

    const lo_x = Math.min(sym, Vf, Sf, S_BS_50, V_BV_50, S_EG) - margin;
    const hi_x = Math.max(sym, Vf, Sf, S_BS_50, V_BV_50, S_EG) + margin;

    x_range = [lo_x, hi_x];
    y_range = x_range;
    // End pre-zoom

    // Make horizontal and vertical rules @ 0.50. And proportional rule.

    const r_x = [0.0, 0.5, 1.0];
    const r_y = [0.0, 0.5, 1.0];
    const r_s = [0.5, 0.5, 0.5];
    const r_v = [0.5, 0.5, 0.5];
    // The S=V line
    const prop_x = [0.0, 0.5, 1.0];
    // The EG=0 line
    const prop2_x = [0.25, 0.5, 0.75];
    const prop_y = [0.0, 0.5, 1.0];

    // "Local" region traces
    const shadedColor = 'whitesmoke';
    const local = 5 / 100;          // "Local" range = 5%
    const delta = local / 2;        // +/– Vf

    const vrVMinusTrace = {
      x: [Vf - delta, Vf - delta],
      y: [0.0, 1.0],
      type: 'scatter',
      mode: 'lines',
      line: {
        color: shadedColor,
        width: 0.5
      },
      hoverinfo: 'none',
      showlegend: false
    };

    const vrVPlusTrace = {
      x: [Vf + delta, Vf + delta],
      y: [0.0, 1.0],
      fill: 'tonextx',
      fillcolor: shadedColor,
      type: 'scatter',
      name: 'Uncertainty',
      text: 'uncertainty',
      mode: 'lines',
      line: {
        color: shadedColor,
        width: 0.5
      },
      hoverinfo: 'none',
      showlegend: true
    };

    const hoverTemplate = 'Vote %: %{x:5.2%}, Seat %: %{y:5.2%}<extra></extra>';
    const d_sv_curve = {
      x: v_d,
      y: s_d,
      mode: 'lines',
      name: 'Democratic',
      marker: {
        color: blue,
        size: 5
      },
      hovertemplate: hoverTemplate,
      showlegend: (bRCurve) ? true : false
    }

    const halfPtHoverTemplate = 'Vote %: 50%, Seat %: 50%<extra></extra>';
    const half_pt_trace = {
      x: [0.5],
      y: [0.5],
      mode: 'markers',
      type: 'scatter',
      marker: {
        color: 'black',
        symbol: 'circle',
        size: 8,
      },
      hoverinfo: 'text',
      hovertemplate: halfPtHoverTemplate,
      showlegend: false
    };

    const bvPtLabel = 'Votes bias: ' + TU.formatNumber(Bv, '%', 2) + '%';
    const bvPtHoverTemplate = bvPtLabel + '<extra></extra>';
    const bvFormatted = TU.formatNumber(Bv, '%', 2) + '%';
    const bv_pt_trace = {
      x: [Bv + 0.5],
      y: [0.5],
      mode: 'markers',
      type: 'scatter',
      name: 'Votes bias: ' + bvFormatted,
      marker: {
        color: 'black',
        symbol: 'diamond',
        size: 8,
      },
      hoverinfo: 'text',
      hovertemplate: bvPtHoverTemplate,
      showlegend: true
    };

    const bsPtLabel = 'Seats bias: ' + TU.formatNumber(Bs, '%', 2) + '%';
    const bsPtHoverTemplate = bsPtLabel + '<extra></extra>';
    const bsFormatted = TU.formatNumber(Bs, '%', 2) + '%';
    const bs_pt_trace = {
      x: [0.5],
      y: [0.5 - Bs],
      mode: 'markers',
      type: 'scatter',
      name: 'Seats bias: ' + bsFormatted,
      marker: {
        color: 'black',
        symbol: 'square',
        size: 8,
      },
      hoverinfo: 'text',
      hovertemplate: bsPtHoverTemplate,
      showlegend: true
    };

    const bv_ray = {
      x: [0.5, Bv + 0.5],
      y: [0.5, 0.5],
      mode: 'lines',
      line: {
        color: 'black',
        width: 1,
        dash: 'solid'
      },
      hoverinfo: 'none',
      showlegend: false
    }

    const bs_ray = {
      x: [0.5, 0.5],
      y: [0.5, 0.5 - Bs],
      mode: 'lines',
      line: {
        color: 'black',
        width: 1,
        dash: 'solid'
      },
      hoverinfo: 'none',
      showlegend: false
    }

    const r_sv_curve = {
      x: v_r,
      y: s_r,
      mode: 'lines',
      name: 'Republican',
      marker: {
        color: red,
        size: 5
      },
      hovertemplate: hoverTemplate,
      showlegend: true
    }

    const h_rule = {
      x: r_x,
      y: r_s,
      name: 'Seat % = 50%',
      mode: 'lines',
      line: {
        color: 'black',
        width: 0.5,
        dash: 'solid'     // 'dash'
      },
      hoverinfo: 'none',  // 'text',
      showlegend: false   // true
    }

    const v_rule = {
      x: r_v,
      y: r_y,
      name: 'Vote % = 50%',
      mode: 'lines',
      line: {
        color: 'black',
        width: 0.5,
        dash: 'solid'     // 'dot'
      },
      hoverinfo: 'none',  // 'text',
      showlegend: false   // true
    }

    const prop_rule = {
      x: prop_x,
      y: prop_y,
      mode: 'lines',
      line: {
        color: 'black',
        width: 0.5,
        dash: 'dot'
      },
      hoverinfo: 'none',
      showlegend: false
    }
    const prop2_rule = {
      x: prop2_x,
      y: prop_y,
      mode: 'lines',
      line: {
        color: 'black',
        width: 0.5,
        dash: 'dash'
      },
      hoverinfo: 'none',
      showlegend: false
    }

    const statewideVf = profile.statewide;
    const nPts = 20;
    const statewideVfXs = [...Array(nPts + 1).keys()].map(x => statewideVf);
    const ruleYs = [...Array(nPts + 1).keys()].map(y => ((100 / nPts) * y) / 100);
    const statewideVfWinHoverLabel = 'Total D vote: ' + TU.formatNumber(statewideVf, '%', 2) + '%';
    const statewideVfTrace = {
      x: statewideVfXs,
      y: ruleYs,
      type: 'scatter',
      mode: 'lines',
      name: statewideVfWinHoverLabel,  //'Statewide D vote %',
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

    svTraces.push(vrVMinusTrace);
    svTraces.push(vrVPlusTrace);
    svTraces.push(prop2_rule);

    svTraces.push(h_rule);
    svTraces.push(v_rule);
    svTraces.push(prop_rule);
    svTraces.push(statewideVfTrace);
    svTraces.push(d_sv_curve);
    if (bRCurve)
      svTraces.push(r_sv_curve);
    svTraces.push(half_pt_trace);
    svTraces.push(bv_pt_trace);
    svTraces.push(bs_pt_trace);
    svTraces.push(bv_ray);
    svTraces.push(bs_ray);

    const svSize = 750;

    // Place the legend based on whether & where the plot is pre-zoomed
    // - If (Sf > 0.5) => lower right
    // - If (Sf < 0.5) => upper left
    // - x,y units are normalized, not Vf, Sf

    const tab = 0.02;  // 2% indent margin
    const x_anchor = (Sf > 0.5) ? 'right' : 'left';
    const y_anchor = (Sf > 0.5) ?  'bottom' : 'top';
    const x_pos = (Sf > 0.5) ? 1 - tab : 0 + tab;
    const y_pos = (Sf > 0.5) ? 0 + tab : 1 - tab;

    svLayout = {
      title: 'Seats-Votes Curve: ' + profileName,
      width: svSize,
      height: svSize,
      xaxis: {
        title: "Vote %",
        range: x_range,
        tickmode: 'linear',
        ticks: 'outside',
        tick0: 0.0,
        dtick: 0.1,
        tickformat: '.0%'
      },
      yaxis: {
        title: "Seat %",
        range: y_range,
        scaleanchor: 'x',
        scaleratio: 1,
        tickmode: 'linear',
        ticks: 'outside',
        tick0: 0.0,
        dtick: 0.1,
        tickformat: '.0%'
      },
      dragmode: 'zoom',
      hovermode: 'closest',
      showlegend: bLegend,
      legend: {
        xanchor: x_anchor,
        yanchor: y_anchor,
        x: x_pos,
        y: y_pos,
        bordercolor: 'black',
        borderwidth: 1
      },
      paper_bgcolor: bgcolor,
      plot_bgcolor: bgcolor
    }

    // Configure hover menu options & behavior
    svConfig = {
      toImageButtonOptions: {
        format: 'png', // one of png, svg, jpeg, webp
        filename: 's(v)-curve'
      },
      // Remove the unwanted plotly hover commands. Let users pan & zoom.
      modeBarButtonsToRemove: ['zoom2d', 'select2d', 'lasso2d', 'autoScale2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      scrollZoom: true,
      displayModeBar: true,
      displaylogo: false,
      responsive: true
    };

    var svDiv = document.getElementById('sv-curve');

    //Render Plotly
    Plotly.react(svDiv, svTraces, svLayout, svConfig);
  }
  
  /* =======
  Component
  ======== */
  return(
    <div id='svcurvePanel' className={''} style={{textAlign: 'center'}}>
      <TU.PanelHeader header={svCurveSectionHeader} url={svCurveURL} tooltip='More information' />
      <Material.Table>
        <Material.TableBody>
          <Material.TableRow>
            <Material.TableCell align='center'>
              <Material.Card id='sv-curve' style={{margin: 'auto', width: 750}} raised></Material.Card>
            </Material.TableCell>
            <Material.TableCell align='left'>
              <SVSwitch />
            </Material.TableCell>
          </Material.TableRow>
        </Material.TableBody>
      </Material.Table>
    </div>
  )
}

export default SVCurveDiagram;
