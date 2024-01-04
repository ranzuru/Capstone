import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';

const FormInput = ({
  control,
  name,
  label,
  error,
  textType = 'default',
  isDisabled,
  ...rest
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, ...field } }) => (
        <TextField
          {...field}
          label={label}
          fullWidth
          margin="normal"
          variant="outlined"
          error={!!error}
          helperText={error?.message}
          disabled={isDisabled}
          onChange={(e) => {
            let value = e.target.value;

            switch (textType) {
              case 'text':
                value = value
                  .replace(/[^a-zA-Z ]/g, '')
                  .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
                break;
              case 'number':
                value = value.replace(/\D/g, '');
                break;
              case 'combine':
                value = value
                  // This regular expression will keep letters, numbers, spaces, and specific special characters
                  .replace(/[^a-zA-Z0-9 @#.!]/g, '')
                  .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
                break;
              case 'float':
                value = value
                  .replace(/[^0-9.]/g, '')
                  .replace(/(\..*)\./g, '$1');
                break;
              case 'bloodPressure':
                value = value
                  .replace(/[^0-9/]/g, '') // Allow only numbers and '/'
                  .replace(/(\/.*)\//g, '$1'); // Prevent multiple '/'
                break;
              default:
                break;
            }

            onChange(value);
          }}
          {...rest}
        />
      )}
    />
  );
};

FormInput.propTypes = {
  control: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  error: PropTypes.object,
  textType: PropTypes.oneOf([
    'text',
    'number',
    'combine',
    'float',
    'bloodPressure',
  ]),
  isDisabled: PropTypes.bool,
};

export default FormInput;
