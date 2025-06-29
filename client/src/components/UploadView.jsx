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
import AlertDialog from './AlertDialog';
import TextField from '@mui/material/TextField';

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
  maxWidth: '36rem',
  height: '10rem',
});

const FileName = styled(Material.Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.primary.main
}));

const ButtonContainer = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(3)
}));

// Add a new styled component for the grid layout
const InputGrid = styled('div')({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 300px)',
  gridGap: '15px',
  marginTop: '15px',
  marginBottom: '15px',
  justifyContent: 'center',
  width: '100%'
});

function UploadView({ uploadFile, fetchScorecard, uploadedFile, uploadMessage, setCurrView, analyticsType, setAnalyticsType }) {
  // const [datasets, setDatasets] = useState([]); // State to manage all available datasets for chosen state
  const [sortedDatasets, setSortedDatasets] = useState({}); // State to manage sorted datasets
  // const [filteredDatasets, setFilteredDatasets] = useState(datasets); // State to manage filtered datasets based on user selections
  const [plans, setPlans] = useState([]); // State to manage available plans for volume scoring
  const [volumeArgs, setVolumeArgs] = useState({
    state: null,
    planType: null,
    // datasets: [],
    census: null,
    vap: null,
    cvap: null,
    elections: [],
    plans: null,
    output: null,
    fileName: '',
  }); // State to manage volume scoring arguments
  const [dialog, setDialog] = useState({
    state: false, // Dialog visibility state
    title: '', // Dialog title
    description: '', // Dialog description
    button: false, // Whether to show a button in the dialog
    buttonText: 'Close' // Text for the dialog button
  })

  // Effect to fetch plans when component mounts
  useEffect(() => {
    console.log('Fetching plans on mount...');
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
    getPlans(); // Fetch available plans for volume scoring
  }, []);
  
  // Effect to fetch state & datasets when plans prop of volumeArgs changes
  useEffect(() => {
    async function fetchStateAndDatasets() {
      if (volumeArgs.plans) {
        console.log(`Fetching state & datasets for plans: ${volumeArgs.plans}`);
        try {
          const response = await fetch(`/volume/datasets/${volumeArgs.plans}`);
          const resObj = await response.json();
          
          // Check if the response is successful
          if (!response.ok) {
            throw new Error(`${resObj.error}`);
          }
          
          //const resObj = await response.json();
          const sorted = sortDatasets(resObj.datasets); // Sort datasets by type
          sorted.elections.unshift('All Elections')
          setSortedDatasets(sorted); // Update sorted datasets state
          console.log('Sorted datasets:', sorted); // Debugging log
          const prevArgs = volumeArgs;
          setVolumeArgs({
            ...prevArgs,
            state: resObj.state,
            planType: resObj.planType,
            elections: [],
            census: null,
            vap: null,
            cvap: null,
          })
          console.log('State set to:', resObj.state); // Debugging log
          console.log('Plan type set to:', resObj.planType); // Debugging log
        } catch (error) {
          console.error('Error fetching state & datasets:', error);

          // Reset plans input if error occurs
          const prevArgs = volumeArgs;
          setVolumeArgs({
            ...prevArgs,
            plans: null,
          })

          // Show error dialog to user
          setDialog({
            state: true,
            title: 'Error',
            description: error.message || 'An error occurred while fetching state and datasets.',
            button: true,
            buttonText: 'Close'
          });
        }

      } else {
        // If plans is cleared, reset state, planType, datasets, and sortedDatasets
        const prevArgs = volumeArgs;
        setVolumeArgs({
          ...prevArgs,
          state: null,
          planType: null,
          elections: [],
          census: null,
          vap: null,
          cvap: null,
        })
        setSortedDatasets({ elections: [], census: [], vap: [], cvap: [] });
      }
    }
    fetchStateAndDatasets()
    // Reset datasets input when state changes
  }, [volumeArgs.plans]);

  // Effect to filter datasets based on existing selections
  /*
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
  */

  // Helpers

  // Set plans input for volume scoring
  function setPlansInput(value) {
    const prevArgs = volumeArgs;
    setVolumeArgs({
      ...prevArgs,
      plans: value});
  }

  // Set state input for volume scoring
  // function setStateAndPlanTypeInput(value) {
  //   console.log('Setting state & planType input:', value);
  //   const prevArgs = volumeArgs;
  //   setVolumeArgs({
  //     ...prevArgs,
  //     state: value.state,
  //     planType: value.planType
  //   });
  // }

  // Set file name input for volume scoring
  function setFileNameInput(value) {
    const prevArgs = volumeArgs;
    setVolumeArgs({
      ...prevArgs,
      fileName: value
    });
  }

  // Set datasets input for volume scoring
  function setDatasetsArg(type, value) {
    console.log(`Setting ${type} arg:`, value);
    setVolumeArgs({
      ...volumeArgs,
      [type]: value
    });
  }

  // Individual setters for each dataset type
  const setArg = {
    elections: (value) => {
      const newValue = [...value]
      // If 'All Elections' is selected, remove any other selections
      if (newValue && newValue.includes('All Elections')) setDatasetsArg('elections', ['All Elections']);
      else {
        setDatasetsArg('elections', newValue);
      }
    },
    census: (value) => setDatasetsArg('census', value),
    vap: (value) => setDatasetsArg('vap', value),
    cvap: (value) => setDatasetsArg('cvap', value),
  }

  // Sort available datasets by census, cvap, vap, and elections
  function sortDatasets(datasets) {
    const datasetObj = {
      census: [],
      vap: [],
      cvap: [],
      elections: []
    };
    datasets.forEach(dataset => {
      if (dataset.includes('Census')) {
          datasetObj.census.push(dataset);
      } else if (dataset.includes('Citizen Voting Age Population')) {
          datasetObj.cvap.push(dataset);
      } else if (dataset.includes('Voting Age Population')) {
          datasetObj.vap.push(dataset);
      } else if (dataset.includes('Election')) {
          datasetObj.elections.push(dataset);
      }
    })
    return datasetObj;
  }

  // Fetch data from cloud
  async function fetchSync() {
    try {
      const response = await fetch('volume/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(['CA', 'WA', 'NC']) // Example state - set to array of states needed
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(`${result.error || 'Failed to fetch states:'} ${result.states}`);
      }
      console.log(result);
    } catch (error) {
      console.error('Error fetching data from cloud:', error);
    }
  }

  // Run volume scoring
  async function fetchVolumeScore() {
    // Placeholder: add arg validation for reqd fields: state, plans (tba planType, output paths/names))
    if (!volumeArgs.state || !volumeArgs.plans) {
      console.error('Please select a state and plans for volume scoring.');
      return;
    }
    try {
      setDialog({
        ...dialog,
        state: true,
        title: 'Running Volume Scoring',
        description: 'Please wait while the volume scoring is being processed.',
        button: false,
      })
      const response = await fetch('/volume/score', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(volumeArgs),
      });
      const res = await response.json();
      console.log('Volume scoring response:', res);
      // Check if scoring was successful
      const outputMessage = !res.error ? 
        `Volume scoring completed successfully. Output saved as ${res.scores} and ${res.byDistrict}.` :
        res.error;
      setDialog({
        ...dialog,
        state: true,
        title: 'Volume Scoring Complete',
        description: outputMessage,
        //description: `Volume scoring completed successfully. Output saved as ${res.scores} and ${res.byDistrict}.`,
        button: true,
        buttonText: 'Close'
      })
    } catch (error) {
      console.error('Error running volume scoring:', error);
      setDialog({
        ...dialog,
        state: true,
        title: 'Error',
        description: `An error occurred while running volume scoring: ${error.message}`,
        button: true,
        buttonText: 'Close'
      })
    }
  }

  // Handlers
  // Handle analytics type change
  function handleAnalyticsTypeChange(event) {
    setAnalyticsType(event.target.value);
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
        
        {/* Analytics Type and Dataset Selection */}
        <Select 
          label="Scoring Type" 
          value={analyticsType} 
          options={['single', 'volume']} 
          handleChange={handleAnalyticsTypeChange} 
        />
        {/* Single Scoring Options */}
        {analyticsType === 'single' && (
          <>
            <DropzoneContainer>
              <StyledDropzone onDrop={uploadFile} dropText='Click or drop a partisan profile to upload' />
            </DropzoneContainer>

            {uploadedFile && <FileName>{uploadedFile.fileName}</FileName>}
            {uploadMessage && <FileName>{uploadMessage}</FileName>}
          </>
        )}

        {/* Volume Scoring Options */}
        {analyticsType === 'volume' && (
          <>
            <AutocompleteInput 
              options={plans} 
              value={volumeArgs.plans} 
              setValue={setPlansInput}
              label='Plans' />
            {/* Grid layout for election, census, vap, cvap inputs */}
            {volumeArgs.state && (
              <>
              <InputGrid>
                <AutocompleteInputMultiple 
                  options={sortedDatasets.elections}
                  value={volumeArgs.elections} 
                  setValue={setArg.elections}
                  label='Elections'
                  disabled={!sortedDatasets.elections || sortedDatasets.elections.length === 0} />
                <AutocompleteInput 
                  options={sortedDatasets.census} 
                  value={volumeArgs.census} 
                  setValue={setArg.census}
                  label='Census'
                  disabled={!sortedDatasets.census || sortedDatasets.census.length === 0} />
                <AutocompleteInput 
                  options={sortedDatasets.vap} 
                  value={volumeArgs.vap} 
                  setValue={setArg.vap}
                  label='VAP'
                  disabled={!sortedDatasets.vap || sortedDatasets.vap.length === 0} />
                <AutocompleteInput 
                  options={sortedDatasets.cvap} 
                  value={volumeArgs.cvap} 
                  setValue={setArg.cvap}
                  label='CVAP'
                  disabled={!sortedDatasets.cvap || sortedDatasets.cvap.length === 0} />
              </InputGrid>
              <TextField 
                id="output-file-name"
                label="Output File Name"
                variant="standard"
                type="text"
                value={volumeArgs.fileName}
                onChange={(event) => {
                  const validPattern = /^[a-zA-Z0-9_\-]*$/;
                  const newValue = event.target.value;
                  // Only update fileName if it's a valid name and max 50 characters
                  if (validPattern.test(newValue) && newValue.length <= 50) {
                    setFileNameInput(newValue);
                  }
                }}
                helperText="Letters, numbers, underscores & hyphens only"/>
              </>
            )}  
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
      <AlertDialog 
        open={dialog.state}
        handleClose={() => {setDialog({...dialog, state: false})}}
        title={dialog.title}
        description={dialog.description}
        button={dialog.button}
        buttonText={dialog.buttonText}
      />

    </Container>
  )
}

export default UploadView