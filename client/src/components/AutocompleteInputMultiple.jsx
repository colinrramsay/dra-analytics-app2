import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

export default function AutocompleteInputMultiple({ label, options, value, setValue }) {
  return (
    <Autocomplete
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
      sx={{ width: 500 }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`${label}`}
        />
      )}
    />
  );
}
