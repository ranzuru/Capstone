import { Paper, Grid } from '@mui/material';
import { StudentMedicalBar, ScreeningPerGrade } from './Charts/MedicalChart';

const MedicalCombinedCharts = () => {
  return (
    <Paper
      elevation={3}
      style={{ padding: '20px', margin: '20px', height: '100%' }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <StudentMedicalBar />
        </Grid>
        <Grid item xs={12} md={6}>
          <ScreeningPerGrade />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MedicalCombinedCharts;
