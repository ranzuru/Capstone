import { useState, useEffect } from 'react';
import { Paper, Grid, Typography } from '@mui/material';
import {
  ClinicVisitsLineChart,
  MaladyDistributionBarChart,
  GradeLevelPieChart,
  ClinicVisitSummary,
} from './Charts/ClinicVisitChart';
import { SchoolYearSelect } from './SchoolYearSelect';
import useFetchSchoolYears from '../hooks/useFetchSchoolYears';

const ClinicVisitCombined = () => {
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
          <ClinicVisitsLineChart schoolYear={selectedYear} />
        </Grid>
        <Grid item xs={12} md={6}>
          <MaladyDistributionBarChart schoolYear={selectedYear} />
        </Grid>
        <Grid item xs={12} md={6}>
          <GradeLevelPieChart schoolYear={selectedYear} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ClinicVisitSummary schoolYear={selectedYear} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ClinicVisitCombined;
