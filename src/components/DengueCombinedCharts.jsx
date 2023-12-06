import { useState, useEffect } from 'react';
import { Paper, Grid, Typography } from '@mui/material';
import DengueCasesByGradePieChart from './Charts/DenguePieChart';
import DengueBarChart from './Charts/DengueBarChart';
import DengueCasesLineChart from './Charts/DengueLineChart';
import { SchoolYearSelect } from './SchoolYearSelect';
import useFetchSchoolYears from '../hooks/useFetchSchoolYears';

const DengueCombinedCharts = () => {
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
          style={{ width: '100%' }}
        />
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <DengueBarChart schoolYear={selectedYear} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DengueCasesLineChart schoolYear={selectedYear} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DengueCasesByGradePieChart schoolYear={selectedYear} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DengueCombinedCharts;
