import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
        Cargando...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
