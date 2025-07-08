/* ==============================
Server Shutdown Button Component
============================== */

// Imports
import { useState } from 'react';
import Button from '@mui/material/Button';

function ShutdownButton({ setCurrView }) {
  const [isShuttingDown, setIsShuttingDown] = useState(false); // State to track if the server is shutting down
  
  // Server shutdown handler
  const handleShutdown = async () => {
    setIsShuttingDown(true);
    try {
      const response = await fetch('/shutdown', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Show a message to the user that the server is shutting down
        setTimeout(() => {
          setCurrView('ServerShutdown');
        }, 2000);
      } else {
        console.error('Failed to shut down the server');
        setIsShuttingDown(false);
      }
    } catch (error) {
      console.error('Error shutting down server:', error);
      setIsShuttingDown(false);
    }
  };

/* =======
Component
======= */
return (
    <Button
        variant="contained"
        color="error"
        onClick={handleShutdown}
        disabled={isShuttingDown}
        sx={{
            padding: '8px 16px',
            borderRadius: '4px',
            opacity: isShuttingDown ? 0.7 : 1
        }}
    >
        {isShuttingDown ? 'Shutting down...' : 'Exit'}
    </Button>
);
}

export default ShutdownButton;
