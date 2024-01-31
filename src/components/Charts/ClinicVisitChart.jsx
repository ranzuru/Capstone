import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
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
import axiosInstance from '../../config/axios-instance';
import PropTypes from 'prop-types';
import { generateColor } from '../../utils/colorUtil.js';
import renderCustomizedLabel from '../RenderCustomizedLabel';

export const ClinicVisitsLineChart = ({ schoolYear }) => {
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    if (schoolYear) {
      const fetchMonthlyData = async () => {
        try {
          const response = await axiosInstance.get(
            `/clinicVisit/fetchLineChart/${schoolYear}`
          );
          setMonthlyData(response.data);
        } catch (error) {
          console.error('Failed to fetch monthly clinic visits:', error);
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
              Monthly Clinic Visit Trends for {schoolYear}
            </Typography>
            <Typography variant="body1" paragraph>
              Tracks clinic visits by month for the selected school year.
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  interval={'preserveStartEnd'}
                  angle={-45}
                  height={70}
                  textAnchor="end"
                />
                <YAxis
                  label={{
                    value: 'Number of Visits',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visitCount"
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

ClinicVisitsLineChart.propTypes = {
  schoolYear: PropTypes.string,
};

// Bar Chart:

export const MaladyDistributionBarChart = ({ schoolYear }) => {
  const [maladyData, setMaladyData] = useState([]);

  useEffect(() => {
    if (schoolYear) {
      const fetchMaladyData = async () => {
        try {
          const response = await axiosInstance.get(
            `/clinicVisit/fetchBarChart/${schoolYear}`
          );
          setMaladyData(response.data);
        } catch (error) {
          console.error('Failed to fetch malady distribution:', error);
        }
      };

      fetchMaladyData();
    }
  }, [schoolYear]);

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Malady Distribution for {schoolYear}
            </Typography>
            <Typography variant="body1" paragraph>
              Shows the count of different maladies reported during the selected
              school year.
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={maladyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-45}
                  height={70}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

MaladyDistributionBarChart.propTypes = {
  schoolYear: PropTypes.string,
};

// Pie
export const GradeLevelPieChart = ({ schoolYear }) => {
  const [gradeData, setGradeData] = useState([]);

  useEffect(() => {
    if (schoolYear) {
      const fetchGradeData = async () => {
        try {
          const response = await axiosInstance.get(
            `/clinicVisit/fetchPieChart/${schoolYear}`
          );
          setGradeData(response.data);
        } catch (error) {
          console.error('Failed to fetch grade level demographics:', error);
        }
      };

      fetchGradeData();
    }
  }, [schoolYear]);

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Grade Level Demographics for {schoolYear}
            </Typography>
            <Typography variant="body1" paragraph>
              Distribution of clinic visits across different grades during the
              selected school year.
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={gradeData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius="85%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={generateColor(index)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

GradeLevelPieChart.propTypes = {
  schoolYear: PropTypes.string,
};

export const ClinicVisitSummary = ({ schoolYear }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (schoolYear) {
      setIsLoading(true);
      setError('');
      const fetchSummaryData = async () => {
        try {
          const response = await axiosInstance.get(
            `/clinicVisit/fetchSummary/${schoolYear}`
          );
          setSummary(response.data.summary);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to fetch medical summary:', error);
          setError('No summary data available for this school year.');
          setIsLoading(false);
        }
      };

      fetchSummaryData();
    } else {
      setError('Please select a school year.');
      setIsLoading(false);
    }
  }, [schoolYear]);

  return (
    <Container maxWidth="md">
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Clinic Visit Summary for {schoolYear}
        </Typography>
        {isLoading ? (
          <Typography variant="body1">Loading...</Typography>
        ) : error ? (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        ) : (
          <Typography variant="body1" className="whitespace-pre-line">
            {summary}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

ClinicVisitSummary.propTypes = {
  schoolYear: PropTypes.string.isRequired,
};
