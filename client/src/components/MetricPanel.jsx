/* ====================================================
Panel component for displaying metrics in a table format
====================================================== */

// Material Imports
import * as Material from '@mui/material';
import { styled } from '@mui/material/styles';

// Components Imports
import * as TU from './TableUtils';
import Notes from './Notes';

// Styled Components
const PanelContainer = styled('div')(({ theme }) => ({
    paddingBottom: '32px',
    borderBottom: '1px solid',
    borderColor: theme.palette.divider
}));

/* ======
Component
======= */

function MetricPanel({ header, metrics, notes }) {
    return (
        <PanelContainer>
            <TU.PanelHeader header={header.header} url={header.url} tooltip='More information' explanation={header.explanation} />
            <Material.Table>
                <Material.TableBody>
                    <TU.MetricHeader labelColumn='Metric' descriptionColumn='Description'/>
                    {/* Map over each metric, returning the row or blank row */}
                    {metrics.map((metric, i) => {
                        return metric === '' ?
                            <TU.MetricRow key={i} /> :
                            <TU.MetricRow key={i} label={metric.label} metric={metric.metric} units={metric.units} decimals={metric.decimals} description={metric.description} />    
                    })}
                </Material.TableBody>
            </Material.Table>
            {notes && <Notes notes={notes.notes} notesLabel={notes.noteLabel} />}
        </PanelContainer>
  )
}

export default MetricPanel