import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useSchoolYear } from '../hooks/useSchoolYear';

export const SchoolYearDashboard = () => {
  const { schoolYears, activeSchoolYear, setActiveSchoolYear } =
    useSchoolYear();

  const handleChange = (event) => {
    setActiveSchoolYear(event.target.value);
  };

  return (
    <FormControl>
      <InputLabel id="school-year-select-label">School Year</InputLabel>
      <Select
        labelId="school-year-select-label"
        id="school-year-select"
        value={activeSchoolYear}
        label="School Year"
        onChange={handleChange}
        sx={{ height: 50, fontSize: '1.5rem' }}
      >
        {activeSchoolYear === 'No Active School Year' && (
          <MenuItem
            value="No Active School Year"
            disabled
            sx={{ fontSize: '1.5rem' }}
          >
            No Active School Year
          </MenuItem>
        )}
        {schoolYears.map((year) => (
          <MenuItem
            key={year.value}
            value={year.value}
            sx={{ fontSize: '1.5rem' }}
          >
            {year.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
