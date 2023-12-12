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
import { Container, Typography, Grid, Box } from '@mui/material';
import axiosInstance from '../../config/axios-instance';
import PropTypes from 'prop-types';

const DengueCasesLineChart = ({ schoolYear }) => {
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    if (schoolYear) {
      const fetchMonthlyData = async () => {
        try {
          const response = await axiosInstance.get(
            `/dengueMonitoring/fetchLine/${schoolYear}`
          );
          setMonthlyData(response.data);
        } catch (error) {
          console.error('Failed to fetch monthly dengue cases:', error);
        }
      };

      fetchMonthlyData();
    }
  }, [schoolYear]);

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Multi-line Graph (Monthly cases by grade level)
            </Typography>
            <Typography variant="body1" paragraph>
              Tracks dengue cases by month. Helps to identify the trends.
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalCases"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

DengueCasesLineChart.propTypes = {
  schoolYear: PropTypes.string,
};

export default DengueCasesLineChart;
