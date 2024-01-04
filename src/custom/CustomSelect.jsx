import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';

const FormSelect = ({
  control,
  name,
  label,
  options,
  errors,
  isDisabled,
  ...rest
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth margin="normal" disabled={isDisabled}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select labelId={`${name}-label`} label={label} {...field} {...rest}>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errors && name in errors && (
            <FormHelperText error>{errors[name]?.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

FormSelect.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  errors: PropTypes.object,
  isDisabled: PropTypes.bool,
};

export default FormSelect;
