import { useState, useEffect } from 'react';
import axiosInstance from '../../config/axios-instance';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Container, Typography, Grid, Box } from '@mui/material';

export const StudentMedicalBar = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/studentMedical/fetchBar');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Stacked bar
            </Typography>
            <Typography variant="body1" paragraph>
              This bar graph shows the distribution of screening results.
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                width={600}
                height={300}
                data={data}
                margin={{
                  bottom: 75, // Increase bottom margin
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-75}
                  textAnchor="end"
                />
                <YAxis
                  label={{
                    value: 'Total number',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip />
                <Legend
                  verticalAlign="top"
                  align="center"
                  wrapperStyle={{
                    padding: 10,
                  }}
                />
                <Bar dataKey="Normal" fill="#82ca9d" stackId="a" />
                <Bar dataKey="Other Conditions" fill="#8884d8" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export const CategoryDistributionChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/studentMedical/fetchBarTwo');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Stacked bar
            </Typography>
            <Typography variant="body1" paragraph>
              This bar graph shows the distribution of screening results.
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                width={600}
                height={300}
                data={data}
                margin={{
                  bottom: 75, // Increase bottom margin
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  interval={0}
                  angle={-75}
                  textAnchor="end"
                />
                <YAxis
                  label={{
                    value: 'Total number',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip />
                <Legend
                  verticalAlign="top"
                  align="center"
                  wrapperStyle={{
                    padding: 10,
                  }}
                />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
