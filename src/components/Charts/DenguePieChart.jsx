import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';

const DengueCasesByGradePieChart = () => {
  // Sample data: replace this with your actual data
  const data = [
    { name: 'Grade 1', value: 240 },
    { name: 'Grade 2', value: 300 },
    { name: 'Grade 3', value: 100 },
    { name: 'Grade 4', value: 80 },
    { name: 'Grade 5', value: 90 },
    { name: 'Grade 6', value: 50 },
    // ... other grades
  ];

  // Colors array, add more colors if you have more grades
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#855CF8',
    '#D9455F',
  ];

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h4" gutterBottom>
                Pie chart (Cases by grade level)
              </Typography>
              <Typography variant="body1" paragraph>
                Reveals age and gender groups most affected, aiding targeted
                prevention.
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DengueCasesByGradePieChart;
