import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import AutocompleteInputMultiple from './AutocompleteInputMultiple';

const stateCodes = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

export default function FetchDialog({ open=false, message, handleClose, closeButton, value, setValue, fetchButton, fetchData, select }) {

  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        //disable closing dialog by clicking outside of it
        if (reason !== 'backdropClick') {
          handleClose()
        }
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Fetch Data
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
        {select && (
          <AutocompleteInputMultiple 
            options={stateCodes}
            value={value} 
            setValue={setValue}
            label='States' />
        )}
      </DialogContent>
      <DialogActions>
        {fetchButton && (
          <Button onClick={fetchData}>Fetch</Button>
        )}
        {closeButton && (
          <Button onClick={handleClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}