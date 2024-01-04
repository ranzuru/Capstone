import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

export const PhoneNumberField = (props) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleChange = (event) => {
    const formattedValue = event.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(formattedValue);
  };

  return (
    <TextField
      fullWidth
      variant="outlined"
      label="Mobile Number"
      value={phoneNumber}
      onChange={handleChange}
      InputProps={{
        startAdornment: <InputAdornment position="start">+63</InputAdornment>,
      }}
      placeholder="995 215 5436"
      {...props} // Spread any additional props passed to the component
    />
  );
};
