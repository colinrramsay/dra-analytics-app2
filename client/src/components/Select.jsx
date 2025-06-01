import * as Material from '@mui/material';

function Select({ label, value, options, handleChange }) {
    return (
        <Material.FormControl fullWidth>
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