import { Paper, Grid } from '@mui/material';
import {
  BmiChart,
  BmiClassificationLineChart,
  MyPieChart,
} from './Charts/FeedingChart';

const FeedingCombineCharts = () => {
  return (
    <Paper
      elevation={3}
      style={{ padding: '20px', margin: '20px', height: '100%' }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <BmiChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <BmiClassificationLineChart />
        </Grid>
        <Grid item xs={12} md={6}>
          <MyPieChart />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FeedingCombineCharts;
