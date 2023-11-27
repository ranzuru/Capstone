import { Controller } from 'react-hook-form';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import PropTypes from 'prop-types';

const MedicalAutoComplete = ({
  control,
  name,
  options,
  label,
  errors = {},
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth margin="normal" error={!!errors[name]}>
          <Autocomplete
            {...field}
            options={options}
            freeSolo
            disableClearable
            onChange={(_, data) => field.onChange(data)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={!!errors[name]}
                helperText={errors[name]?.message}
              />
            )}
          />
        </FormControl>
      )}
    />
  );
};

MedicalAutoComplete.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  errors: PropTypes.object,
};

export default MedicalAutoComplete;
