// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

const baseTheme = createTheme();

const theme = createTheme({
  typography: {
    // Define a custom variant if necessary
    mobileBody1: {
      fontSize: '0.875rem', // Example size for mobile
      [baseTheme.breakpoints.up('sm')]: {
        fontSize: '1rem', // Size for devices above 'sm'
      },
    },
    // Or override existing variants responsively
    h6: {
      fontSize: '1.25rem',
      [baseTheme.breakpoints.up('sm')]: {
        fontSize: '1.5rem',
      },
    },
    // Continue with other variants...
  },
});

export default theme;
