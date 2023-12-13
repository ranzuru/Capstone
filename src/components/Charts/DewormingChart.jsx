import { useState, useEffect } from 'react';
import axiosInstance from '../../config/axios-instance';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { Container, Typography, Grid, Box } from '@mui/material';
import renderCustomizedLabel from '../RenderCustomizedLabel';
import PropTypes from 'prop-types';

export const DewormingBar = ({ schoolYear }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (schoolYear) {
      const fetchData = async () => {
        try {
          const response = await axiosInstance.get(
            `/deworming/fetchBar/${schoolYear}`
          );
          setData(response.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
  }, [schoolYear]);

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Deworming Distribution by Grade
            </Typography>
            <Typography variant="body1" paragraph>
              Comparative overview of dewormed students across grades
              categorized by participation in the 4Ps program.
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                width={600}
                height={300}
                data={data}
                margin={{ top: 0, right: 0, left: 0, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="grade"
                  label={{
                    value: 'Grade Level',
                    position: 'insideBottom',
                    offset: -20,
                  }}
                />
                <YAxis
                  label={{
                    value: 'Total number',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
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
                <Bar
                  dataKey="dewormedBoys4Ps"
                  stackId="a"
                  fill="#4178BE"
                  name="Dewormed Boys 4Ps"
                />
                <Bar
                  dataKey="dewormedGirls4Ps"
                  stackId="a"
                  fill="#9C6ADE"
                  name="Dewormed Girls 4Ps"
                />
                <Bar
                  dataKey="dewormedBoysNon4Ps"
                  stackId="a"
                  fill="#5AAE61"
                  name="Dewormed Boys not 4Ps"
                />
                <Bar
                  dataKey="dewormedGirlsNon4Ps"
                  stackId="a"
                  fill="#D291BC"
                  name="Dewormed Girls not 4Ps"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

DewormingBar.propTypes = {
  schoolYear: PropTypes.string,
};

export const DewormedPieChart = ({ schoolYear }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/deworming/fetchPie/${schoolYear}`
        );
        const keys = [
          'total4Ps',
          'totalNot4Ps',
          'dewormed4Ps',
          'dewormedNot4Ps',
        ];
        const labels = [
          '4Ps Enrolled',
          'Non-4Ps Enrolled',
          'Dewormed 4Ps',
          'Dewormed Non-4Ps',
        ];

        const pieData = keys.map((key, index) => ({
          name: labels[index],
          value: response.data[key],
        }));
        setData(pieData);
      } catch (error) {
        console.error('Error fetching pie chart data:', error);
      }
    };
    fetchData();
  }, [schoolYear]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Deworming Program Coverage Breakdown
            </Typography>
            <Typography variant="body1" paragraph>
              Distribution of dewormed students by 4Ps enrollment status.
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="85%"
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
        </Grid>
      </Grid>
    </Container>
  );
};

DewormedPieChart.propTypes = {
  schoolYear: PropTypes.string,
};
