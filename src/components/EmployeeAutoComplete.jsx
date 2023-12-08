import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import axiosInstance from '../config/axios-instance';
import debounce from 'lodash/debounce';
import SearchIcon from '@mui/icons-material/Search';

const EmployeeAutoComplete = ({ onSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfiles = async (searchValue) => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/employeeProfile/fetchEmployee?search=${encodeURIComponent(
            searchValue
          )}`
        );
        setOptions(response.data.data);
      } catch (error) {
        console.error('Error fetching student profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    const debouncedFetchProfiles = debounce(fetchProfiles, 300);

    if (inputValue) {
      debouncedFetchProfiles(inputValue);
    } else {
      setOptions([]);
    }

    return () => {
      debouncedFetchProfiles.cancel();
    };
  }, [inputValue]);

  const noOptionsMessage = loading ? 'Loading...' : 'No record found';

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) =>
        `${option.employeeId} - ${option.lastName}, ${option.firstName}${
          option.middleName ? ` ${option.middleName}` : ''
        }${option.nameExtension ? ` ${option.nameExtension}` : ''}`
      }
      fullWidth
      popupIcon={<SearchIcon />}
      inputValue={inputValue}
      sx={{
        '& .MuiAutocomplete-popupIndicator': { transform: 'none' },
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(event, value) => {
        if (onSelect) {
          onSelect(value);
        }
      }}
      loading={loading}
      noOptionsText={noOptionsMessage}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search Employee"
          variant="outlined"
          margin="normal"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

EmployeeAutoComplete.propTypes = {
  onSelect: PropTypes.func, // Optional callback for additional handling when a student is selected
};

export default EmployeeAutoComplete;
