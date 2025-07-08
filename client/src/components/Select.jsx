import * as Material from '@mui/material';

function Select({ label, value, options, handleChange, width }) {
    return (
        <Material.FormControl sx={{ width: 200, margin: '15px'}}>
            <Material.InputLabel>{label}</Material.InputLabel>
            <Material.Select
                label={label}
                value={value}
                onChange={handleChange}
            >
                {options.map(option => (
                    <Material.MenuItem value={option}>{option}</Material.MenuItem>
                ))}
            </Material.Select>
        </Material.FormControl>
    )
}

export default Select;