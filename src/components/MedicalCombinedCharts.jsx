import { Paper, Grid } from '@mui/material';
import { StudentMedicalBar } from './Charts/MedicalChart';

const MedicalCombinedCharts = () => {
  return (
    <Paper
      elevation={3}
      style={{ padding: '20px', margin: '20px', height: '100%' }}
    >
      <Grid container spacing={2}>
        <Grid item>
          <StudentMedicalBar />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default MedicalCombinedCharts;
