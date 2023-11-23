import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';

const CustomRadioGroup = ({ control, name, label, errors = {} }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth margin="normal" error={!!errors[name]}>
          <FormLabel component="legend">{label}</FormLabel>
          <RadioGroup row {...field}>
            <FormControlLabel value="true" control={<Radio />} label="Yes" />
            <FormControlLabel value="false" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>
      )}
    />
  );
};

CustomRadioGroup.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  errors: PropTypes.object,
};

export default CustomRadioGroup;
