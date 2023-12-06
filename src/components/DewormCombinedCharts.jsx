import { Paper, Grid } from '@mui/material';
import { DewormingBar, DewormedPieChart } from './Charts/DewormingChart';

const DewormCombinedCharts = () => {
  return (
    <Paper
      elevation={3}
      style={{ padding: '20px', margin: '20px', height: '100%' }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <DewormingBar />
        </Grid>
        <Grid item xs={12} md={6}>
          <DewormedPieChart />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DewormCombinedCharts;
