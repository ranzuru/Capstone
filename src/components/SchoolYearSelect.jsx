// SchoolYearSelect.js
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import useFetchSchoolYears from '../hooks/useFetchSchoolYears';
import PropTypes from 'prop-types';

export const SchoolYearSelect = ({ selectedYear, onChange }) => {
  const { schoolYears, activeSchoolYear } = useFetchSchoolYears();

  return (
    <FormControl sx={{ width: 'auto', minWidth: 120 }} size="small">
      <InputLabel id="school-year-select-label">School Year</InputLabel>
      <Select
        labelId="school-year-select-label"
        id="school-year-select"
        value={selectedYear || activeSchoolYear}
        label="School Year"
        onChange={onChange}
      >
        {schoolYears.map((year) => (
          <MenuItem key={year.value} value={year.value}>
            {year.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

SchoolYearSelect.propTypes = {
  selectedYear: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
