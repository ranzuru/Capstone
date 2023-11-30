import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { SchoolYearSelect } from '../SchoolYearSelect';
import axiosInstance from '../../config/axios-instance';

const DengueCasesLineChart = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const response = await axiosInstance.get(
          `/dengueMonitoring/fetchLine/${selectedYear}`
        );
        setMonthlyData(response.data);
      } catch (error) {
        console.error('Failed to fetch monthly dengue cases:', error);
      }
    };

    if (selectedYear) {
      fetchMonthlyData();
    }
  }, [selectedYear]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Multi-line Graph (Monthly cases by grade level)
              </Typography>
              <Typography variant="body1" paragraph>
                Tracks dengue cases by month. Helps to identify the trends.
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <SchoolYearSelect
                    selectedYear={selectedYear}
                    onChange={handleYearChange}
                  />
                </Grid>
              </Grid>
              {monthlyData.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalCases"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DengueCasesLineChart;
