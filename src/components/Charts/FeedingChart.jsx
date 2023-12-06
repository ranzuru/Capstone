import { useState, useEffect } from 'react';
import {
  BarChart,
  LineChart,
  PieChart,
  Pie,
  Bar,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axiosInstance from '../../config/axios-instance.js';
import { Container, Typography, Grid, Box } from '@mui/material';
import bmiClassificationColors from '../../utils/bmiClassificationColors.js';
import ReUseSelect from '../ReUseSelect.jsx';
import { measurementTypeGraph } from '../../others/dropDownOptions.js';

export const BmiChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          '/feedingProgram/fetchComparisonPREAndPOST'
        );
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
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bmiClassification" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="PRE" fill="#8884d8" />
                <Bar dataKey="POST" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export const BmiClassificationLineChart = () => {
  const [data, setData] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/feedingProgram/fetchBMIClassification?measurementType=${selectedValue}`
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (selectedValue) {
      fetchData();
    }
  }, [selectedValue]);

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  // Define the list of BMI classifications
  const bmiClassifications = [
    'Severely Wasted',
    'Wasted',
    'Normal',
    'Overweight',
    'Obese',
  ];

  return (
    <>
      <Container maxWidth="md">
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Line Chart
              </Typography>
              <Typography variant="body1" paragraph>
                dummy.
              </Typography>
              <ReUseSelect
                label="Choose an Option"
                value={selectedValue}
                onChange={handleChange}
                options={measurementTypeGraph}
              />
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="schoolYear" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {bmiClassifications.map((classification, index) => (
                    <Line
                      key={index}
                      type="monotone"
                      dataKey={classification}
                      stroke={bmiClassificationColors[classification]} // Set the stroke color using the mapping
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export const MyPieChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/feedingProgram/fetchSBFP');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384'];

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              PIE CHART
            </Typography>
            <Typography variant="body1" paragraph>
              dummy.
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
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
