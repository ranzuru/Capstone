import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';

import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

const CustomDatePicker = ({ control, name, label, ...rest }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            {...field}
            label={label}
            slotProps={{
              textField: {
                fullWidth: true,
                margin: 'normal',
              },
            }}
            {...rest}
          />
        </LocalizationProvider>
      )}
    />
  );
};

CustomDatePicker.propTypes = {
  control: PropTypes.any.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default CustomDatePicker;
