/* =======================================================
File upload view for loading new file & setting options
======================================================= */
//Assets
import DraLogo from '../assets/dra-logo.png';

//React imports
import React from 'react';
import { useState } from 'react'
import { useEffect } from 'react';

//Component imports
import * as Material from '@mui/material';
import { styled } from '@mui/material/styles';
import StyledDropzone from './StyledDropzone';
import ShutdownButton from './ShutdownButton';
import Select from './Select';
import AutocompleteInput from './AutocompleteInput';
import AutocompleteInputMultiple from './AutocompleteInputMultiple';

//Constants
const STATE_CODES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

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

function UploadView({ uploadFile, fetchScorecard, uploadedFile, uploadMessage, setCurrView, fetchSync, analyticsType, setAnalyticsType }) {
  const [datasets, setDatasets] = useState([]); // State to manage all available datasets for chosen state
  const [filteredDatasets, setFilteredDatasets] = useState(datasets); // State to manage filtered datasets based on user selections
  const [plans, setPlans] = useState(getPlans()); // State to manage available plans for volume scoring
  const [volumeArgs, setVolumeArgs] = useState({
    state: null,
    planType: null,
    datasets: [],
    plans: null,
    scores: null,
    byDistrict: null,
  }); // State to manage volume scoring arguments

  // Effect to fetch datasets when state prop of volumeArgs changes
  useEffect(() => {
    async function fetchDatasets() {
      if (volumeArgs.state) {
        console.log(`Fetching datasets for state: ${volumeArgs.state}`);
        try {
          const response = await fetch(`/volume/datasets/${volumeArgs.state}`);
          const newDatasets = await response.json();
          setDatasets(newDatasets); // Update datasets state with the fetched data
          console.log('Datasets fetched:', newDatasets); // Debugging log
        } catch (error) {
          console.error('Error fetching datasets:', error);
        }
      }
    }
    fetchDatasets()
    setDatasetsInput([]); // Reset datasets input when state changes
  }, [volumeArgs.state]);

  // Effect to filter datasets based on existing selections
  useEffect(() => {
    console.log('Filtering datasets based on current selections:', volumeArgs.datasets);
    function filterDatasets() {
      const filters = new Set();
      // Set filters based on what has already been selected
      // Only one of each CVAP, VAP, & Census datasets can be selected at a time
      volumeArgs.datasets.forEach(selected => {
        if (selected.includes('Citizen Voting Age Population')) filters.add('Citizen Voting Age Population');
        else if (selected.includes('Voting Age Population') && !selected.includes('Citizen')) filters.add('Voting Age Population');
        else if (selected.includes('Census')) filters.add('Census');
      })
      const newFilteredDatasets = datasets.filter(dataset => {
        for (let filter of filters) {
          if (filter !== 'Voting Age Population') {
            if (dataset.includes(filter)) return false;
          } else if (filter === 'Voting Age Population' && dataset.includes(filter) && !dataset.includes('Citizen')) {
            return false; // Exclude if it's VAP but not CVAP
          }
        }
        return true;
      })
      setFilteredDatasets(newFilteredDatasets);
    }
    filterDatasets();
  }, [volumeArgs.datasets, datasets])
    
  // Helpers

  // Get available plans for volume scoring
  async function getPlans() {
    try {
      const response = await fetch(`/volume/plans`);
      const newPlans = await response.json();
      setPlans(newPlans); // Update available plans state
      console.log('Plans fetched:', newPlans); // Debugging log
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  }

  // Set plans input for volume scoring
  function setPlansInput(value) {
    const prevArgs = volumeArgs;
    setVolumeArgs({
      ...prevArgs,
      plans: value});
  }

  // Set state input for volume scoring
  function setStateInput(value) {
    const prevArgs = volumeArgs;
    setVolumeArgs({
      ...prevArgs,
      state: value});
  }

  // Set datasets input for volume scoring
  function setDatasetsInput(value) {
    console.log('Setting datasets arg:', value);
    const prevArgs = volumeArgs;
    setVolumeArgs({
      ...prevArgs,
      datasets: value});
  }

  // Run volume scoring
  async function fetchVolumeScore() {
    // Placeholde: add arg validation for reqd fields
    try {
    const response = await fetch('/volume/score', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify(volumeArgs),
    });
    const res = await response.json();
    console.log('Volume scoring response:', res);
    } catch (error) {
    console.error('Error running volume scoring:', error);
    }
  }

  // Handlers
  // Handle analytics type change
  function handleAnalyticsTypeChange(event) {
    setAnalyticsType(event.target.value);
  }

  // Handle dataset change
  function handleDatasetChange(event) {
    //PLACEHOLDER: setCurrDataset(event.target.value);
  }

  // Handle Analyze button click
  function handleAnalyzeClick() {
    if (analyticsType === 'single') {
      fetchScorecard();
    } else if (analyticsType === 'volume') {
      console.log(`Volume scoring with args:`, volumeArgs);
      fetchVolumeScore();
    } else {
      console.error('Please select a valid dataset for volume analytics.');
    }
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
        {/* Volume Scoring Options */}
        {analyticsType === 'volume' && (
          <>
            <AutocompleteInput 
              options={plans} 
              value={volumeArgs.plans} 
              setValue={setPlansInput}
              label='Plans' />
            <AutocompleteInput 
              options={STATE_CODES} 
              value={volumeArgs.state} 
              setValue={setStateInput}
              label='State' />
            <AutocompleteInputMultiple 
              options={filteredDatasets} 
              value={volumeArgs.datasets} 
              setValue={setDatasetsInput}
              label='Datasets' />
          </>
        )}
        <ButtonContainer>
          <Material.Button 
            onClick={handleAnalyzeClick}
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