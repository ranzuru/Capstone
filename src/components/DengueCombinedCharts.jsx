import { Paper, Grid } from '@mui/material';
import DengueCasesByGradePieChart from './Charts/DenguePieChart';
import DengueBarChart from './Charts/DengueBarChart';
import DengueCasesLineChart from './Charts/DengueLineChart';

const DengueCombinedCharts = () => {
  return (
    <Paper
      elevation={3}
      style={{ padding: '20px', margin: '20px', height: '100%' }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <DengueBarChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <DengueCasesLineChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <DengueCasesByGradePieChart />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DengueCombinedCharts;
