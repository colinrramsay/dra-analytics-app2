import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

export default function AutocompleteInputMultiple({ label, options, value, setValue, disabled }) {
  return (
    <Autocomplete
      disabled={disabled}
      multiple
      id={`${label}-multi-select`}
      options={options}
      getOptionLabel={(option) => option}
      defaultValue={[]}
      value={value}
      onChange={(event, newValue) => {
        setValue(newValue);
    }}
      filterSelectedOptions
      sx={{ width: 300 }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`${label}`}
        />
      )}
    />
  );
}
