/* ==============================
Notes component for Metric Panel
============================== */

// Material Imports
import * as Material from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Components
const NotesTable = styled(Material.Table)({
    // no custom styling
});

const NotesTitleCell = styled(Material.TableCell)({
    fontWeight: 'bold', 
    fontSize: '16px', 
    borderBottom: 'none', 
    paddingBottom: '4px'
});

const NotesContentCell = styled(Material.TableCell)({
    fontSize: '16px', 
    borderTop: 'none', 
    borderBottom: 'none'
});

/* =======
Component
======= */

function Notes({ notes, notesLabel }) {
    return (
        <NotesTable>
            <Material.TableBody>
                <Material.TableRow>
                    <NotesTitleCell colSpan={2}>
                        {(notesLabel ? notesLabel : '')}
                    </NotesTitleCell>
                </Material.TableRow>
                {notes.map((note, i) => (
                    <Material.TableRow key={i}>
                        <NotesContentCell>
                            {note}
                        </NotesContentCell>
                    </Material.TableRow>
                ))}
            </Material.TableBody>
        </NotesTable>
    )
}

export default Notes;