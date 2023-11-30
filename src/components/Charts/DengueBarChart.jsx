import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import axiosInstance from '../../config/axios-instance.js';

const DengueBarChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/dengueMonitoring/fetchBar'); // Update the API endpoint
        setChartData(response.data);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Handle error appropriately
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Grouped Bar Chart (Cases by age and gender)
              </Typography>
              <Typography variant="body1" paragraph>
                Reveals age and gender groups most affected, aiding targeted
                prevention.
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="ageGroup"
                    label={{
                      value: 'Ages',
                      position: 'insideBottom',
                      offset: -2,
                    }}
                  />
                  <YAxis
                    label={{
                      value: 'Cases',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Male" fill="#8884d8" />
                  <Bar dataKey="Female" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DengueBarChart;
