import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useSchoolYear } from '../hooks/useSchoolYear';

export const SchoolYearDashboard = () => {
  const { schoolYears, activeSchoolYear, setActiveSchoolYear } =
    useSchoolYear();

  const handleChange = (event) => {
    setActiveSchoolYear(event.target.value);
  };

  return (
    <FormControl sx={{ width: 'auto', minWidth: 120 }} size="small">
      <InputLabel id="school-year-select-label">School Year</InputLabel>
      <Select
        labelId="school-year-select-label"
        id="school-year-select"
        value={activeSchoolYear}
        label="School Year"
        onChange={handleChange}
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
