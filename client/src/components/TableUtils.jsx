/* =======================================
Utilities for rendering tables in the app
======================================= */

// Material Imports
import * as Material from '@mui/material';
import * as Icons from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const BorderlessTable = styled(Material.Table)(({ theme }) => ({
  '& .MuiTableCell-root': {
    border: 'none'
  }
}));

const HeaderTypography = styled(Material.Typography)({
  float: 'left'
});

const InfoCell = styled(Material.TableCell)({
  paddingRight: 1
});

const HeaderCell = styled(Material.TableCell)({
    fontWeight: 'bold',
    borderBottom: '2px solid black',
    verticalAlign: 'bottom',
    fontSize: '1.05rem', // 20% larger than default
    paddingBottom: '4px', // Updated bottom padding
});

const MetricRowCell = styled(Material.TableCell)({
  border: 'none',
  fontSize: '16px',
  paddingTop: '8px',
  paddingBottom: '8px'
});

// UTILITY COMPONENTS

// Panel Header
export function PanelHeader({ header, url, tooltip, explanation }) {
    return (
        <BorderlessTable size='small'>
            <Material.TableBody>
                <Material.TableRow>
                    <Material.TableCell>
                        <HeaderTypography variant='h6'>
                        {header}
                        </HeaderTypography>
                    </Material.TableCell>
                    <InfoCell align='right'>
                        {url ? <Material.Tooltip title={tooltip}>
                            <Material.IconButton>
                                <Material.Link
                                  color='inherit'
                                  aria-label='Info'
                                  href={url}
                                  target={'_blank'}
                                  rel='noopener'
                                >
                                    <Icons.Info />
                                </Material.Link>
                            </Material.IconButton>
                        </Material.Tooltip> : null}
                    </InfoCell>
                </Material.TableRow>
                {explanation ? <Material.TableRow>
                    <Material.TableCell>
                        <Material.Typography variant='body1' sx={{ fontSize: '1rem' }}>
                            {explanation}
                        </Material.Typography>
                    </Material.TableCell>
                </Material.TableRow> : null}
            </Material.TableBody>
        </BorderlessTable>
    )
}

// Metric Header Row
export function MetricHeader({ labelColumn, valueColumn, descriptionColumn }) {
    return (
        <Material.TableRow>
            <HeaderCell>
              {labelColumn}
            </HeaderCell>
            <HeaderCell align='right'>
              {valueColumn}
            </HeaderCell>
            <HeaderCell>
              {descriptionColumn}
            </HeaderCell>
        </Material.TableRow>
    )
}

// Metric Row
export function MetricRow({ label, metric, units, decimals, description }) {
    return (
        <Material.TableRow>
            <MetricRowCell>
                {label}
            </MetricRowCell>
            <MetricRowCell align='right'>
                {(metric !== undefined) ? formatNumber(metric, units, decimals) : ''}
                {(metric !== undefined) ? units : ''}
            </MetricRowCell>
            <MetricRowCell>
                {description ? description : null}
            </MetricRowCell>
        </Material.TableRow>
    )
}

// HELPERS

// Format a number based on provided unit of measurement
export function formatNumber(metric, units, decimals) {
    let shiftPlaces = 10 ** (decimals || 2);

    switch (units) {
        case '%':
            return Math.round((metric * 100) * shiftPlaces) / shiftPlaces;
        case '\u00B0':
            return Math.round(metric * shiftPlaces) / shiftPlaces;
        case '':
            return Math.round(metric * shiftPlaces) / shiftPlaces
    }
}