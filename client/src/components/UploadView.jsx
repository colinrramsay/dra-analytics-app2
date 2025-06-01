/* =======================================================
File upload view for loading new file & setting options
======================================================= */
//Assets
import DraLogo from '../assets/dra-logo.png';

//React imports
import React from 'react';
import { useState } from 'react'

//Component imports
import * as Material from '@mui/material';
import { styled } from '@mui/material/styles';
import StyledDropzone from './StyledDropzone';
import ShutdownButton from './ShutdownButton';
import Select from './Select';

// MUI Styled Components
const Container = styled('div')(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  padding: theme.spacing(6.25), // 50px
  boxSizing: 'border-box', // This ensures padding is included in the width
  overflow: 'hidden' // Prevent content from causing overflow
}));

const Content = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '64rem',
  margin: '0 auto'
});

const Logo = styled('img')({
  width: '25%',
  marginBottom: '1.5rem'
});

const Title = styled(Material.Typography)({
  marginBottom: '2rem'
});

const DropzoneContainer = styled('div')({
  width: '100%',
  maxWidth: '36rem'
});

const FileName = styled(Material.Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.primary.main
}));

const ButtonContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(3)
}));

function UploadView({ uploadFile, fetchScorecard, uploadedFile, uploadMessage, setCurrView, fetchSync, datasets }) {
  const [analyticsType, setAnalyticsType] = useState('single'); // State to manage analytics type
  const [currDataset, setCurrDataset] = useState(''); // State to manage current dataset

  // Handlers
  // Function to handle analytics type change
  function handleAnalyticsTypeChange(event) {
    setAnalyticsType(event.target.value);
  }

  // Function to handle dataset change
  function handleDatasetChange(event) {
    setCurrDataset(event.target.value);
  }
  
  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '10px' }}>
        <Material.Button onClick={fetchSync}>
          Sync
        </Material.Button>
        <ShutdownButton setCurrView={setCurrView}/>
      </div>
      {/* Main content centered with padding */}
      <Content>
        <Logo src={DraLogo} alt="DRA Logo" />
        <Title variant="h4" component="h2">DRA Partisan Analytics</Title>
        <DropzoneContainer>
          <StyledDropzone onDrop={uploadFile} dropText='Click or drop a partisan profile to upload' />
        </DropzoneContainer>
        
        {uploadedFile && <FileName>{uploadedFile.fileName}</FileName>}
        {uploadMessage && <FileName>{uploadMessage}</FileName>}
        
        {/* Analytics Type and Dataset Selection */}
        <Select 
          label="Scoring Type" 
          value={analyticsType} 
          options={['single', 'volume']} 
          handleChange={handleAnalyticsTypeChange} 
        />
        {analyticsType === 'volume' && (
          <Select 
            label="Dataset" 
            value={currDataset} 
            options={datasets} 
            handleChange={handleDatasetChange} 
          />
        )}
  
        <ButtonContainer>
          <Material.Button 
            onClick={fetchScorecard}
            variant="contained"
          >
            Analyze
          </Material.Button>
        </ButtonContainer>
      </Content>
    </Container>
  )
}

export default UploadView