import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function AutocompleteInput({ options, value, setValue, label, disabled }) {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <div>
      <Autocomplete
        disabled={disabled}
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        id={`${label}-autocomplete`}
        options={options}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label={label} />}
      />
    </div>
  );
}
