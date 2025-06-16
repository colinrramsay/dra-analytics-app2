import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

export default function AlertDialog({ open=false, handleClose, title, description, button, buttonText }) {

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
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {button && (
          <Button onClick={handleClose}>{buttonText}</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}