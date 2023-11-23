import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IconButton from '@mui/material/IconButton';

// PhoneNumberField component
export const PhoneNumberField = ({ control, errors }) => (
  <Controller
    name="phoneNumber"
    control={control}
    render={({ field }) => (
      <TextField
        fullWidth
        margin="normal"
        variant="outlined"
        label="Mobile Number"
        error={!!errors.phoneNumber}
        helperText={errors.phoneNumber?.message}
        {...field}
        onChange={(e) => {
          const formattedValue = e.target.value.replace(/\D/g, '').slice(0, 10);
          field.onChange(formattedValue);
        }}
        InputProps={{
          startAdornment: <InputAdornment position="start">+63</InputAdornment>,
        }}
        placeholder="995 215 5436"
      />
    )}
  />
);

PhoneNumberField.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object,
};

// PasswordField component
export const PasswordField = ({
  control,
  name,
  errors,
  showPassword,
  handleShowPasswordClick,
}) => (
  <Controller
    name={name}
    control={control}
    rules={{ required: true }}
    render={({ field }) => (
      <TextField
        fullWidth
        margin="normal"
        variant="outlined"
        label={name === 'password' ? 'Password' : 'Confirm Password'}
        type={showPassword ? 'text' : 'password'}
        error={!!errors[name]}
        helperText={errors[name]?.message}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleShowPasswordClick}
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        {...field}
      />
    )}
  />
);

PasswordField.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  errors: PropTypes.object,
  showPassword: PropTypes.bool.isRequired,
  handleShowPasswordClick: PropTypes.func.isRequired,
};

// EmailField component
export const EmailField = ({ control, errors }) => (
  <Controller
    name="email"
    control={control}
    render={({ field }) => (
      <TextField
        fullWidth
        margin="normal"
        variant="outlined"
        label="Email"
        error={!!errors.email}
        helperText={errors.email?.message}
        {...field}
      />
    )}
  />
);

EmailField.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object,
};
