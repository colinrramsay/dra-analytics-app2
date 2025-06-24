/* ========================================
Styled dropzone component for file uploads
======================================== */

//React imports
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function StyledDropzone({ onDrop, dropText }) {
  // File drop handler
  const handleDrop = useCallback(
    (acceptedFiles) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  // Use the dropzone hook
  const { 
    getRootProps, 
    getInputProps, 
    isDragActive, 
    isDragAccept, 
    isDragReject 
  } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/json': ['.json']
    }
  });

  // Styles for the dropzone
  const baseStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    transition: 'border .3s ease-in-out',
    cursor: 'pointer',
  };
  
  const activeStyle = {
    borderColor: '#2196f3'
  };
  
  const rejectStyle = {
    borderColor: '#ff1744'
  };
  
  const style = {
    ...baseStyle,
    ...(isDragAccept ? activeStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  };

  /* ======
  Component
  ======= */
  return (
    <div {...getRootProps({ style })}>
      <input {...getInputProps()} />
      <p>
        {isDragReject 
          ? 'Only .json files are accepted!' 
          : isDragActive 
            ? 'Drop file here...' 
            : dropText || 'Click or drop file to upload'}
      </p>
      <p>Only .json files are accepted</p>
    </div>
  );
}

export default StyledDropzone;