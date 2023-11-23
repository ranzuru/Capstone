import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import PropTypes from 'prop-types';

const CustomPhoneNumberField = ({
  name,
  control,
  label,
  maxLength = 10,
  adornment = '',
  placeholder = '',
  errors,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          fullWidth
          margin="normal"
          label={label}
          error={!!errors[name]}
          helperText={errors[name]?.message}
          {...field}
          onBlur={field.onBlur}
          onChange={(e) => {
            // Use slice(0, maxLength) to keep only the first maxLength characters
            const numericValue = e.target.value
              .replace(/\D/g, '')
              .slice(0, maxLength);
            // Update the input field with the sliced value
            field.onChange(numericValue);
          }}
          InputProps={{
            startAdornment: adornment ? (
              <InputAdornment position="start">{adornment}</InputAdornment>
            ) : null,
            placeholder: placeholder,
          }}
        />
      )}
    />
  );
};

CustomPhoneNumberField.propTypes = {
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  maxLength: PropTypes.number,
  adornment: PropTypes.string,
  placeholder: PropTypes.string,
  errors: PropTypes.object.isRequired,
};

CustomPhoneNumberField.defaultProps = {
  maxLength: 10,
  adornment: '',
  placeholder: '',
};

export default CustomPhoneNumberField;
