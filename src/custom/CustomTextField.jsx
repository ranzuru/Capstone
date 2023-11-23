import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import TextField from '@mui/material/TextField';

const FormInput = ({
  control,
  name,
  label,
  error,
  textType = 'default',
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
                  .replace(/[^a-zA-Z0-9 ]/g, '')
                  .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
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
  textType: PropTypes.oneOf(['text', 'number', 'combine']),
};

export default FormInput;
