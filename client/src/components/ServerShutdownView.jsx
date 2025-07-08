import {Box, Typography} from '@mui/material';

function ServerShutdownView() {
return (
    <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        bgcolor="grey.100"
    >
        <Typography variant="h4" align="center" fontWeight="nomal">
            Server is shutdown. You may close this window.
        </Typography>
    </Box>
);
}

export default ServerShutdownView;