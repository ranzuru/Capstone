import { useState, useEffect } from 'react';
import { Paper, Grid, Typography } from '@mui/material';
import {
  DewormingBar,
  DewormedPieChart,
  DewormSummary,
} from './Charts/DewormingChart';
import { SchoolYearSelect } from './SchoolYearSelect';
import useFetchSchoolYears from '../hooks/useFetchSchoolYears';

const DewormCombinedCharts = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const { activeSchoolYear } = useFetchSchoolYears();

  useEffect(() => {
    if (activeSchoolYear) {
      setSelectedYear(activeSchoolYear);
    }
  }, [activeSchoolYear]);

  const handleSchoolYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <Paper
      elevation={3}
      style={{ padding: '20px', margin: '20px', height: '100%' }}
    >
      <Typography variant="h6" gutterBottom>
        Select School Year
      </Typography>
      <div className="ml-5" style={{ display: 'flex', marginBottom: '20px' }}>
        <SchoolYearSelect
          selectedYear={selectedYear}
          onChange={handleSchoolYearChange}
        />
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <DewormingBar schoolYear={selectedYear} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DewormedPieChart schoolYear={selectedYear} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DewormSummary schoolYear={selectedYear} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DewormCombinedCharts;
