import { useState, useEffect } from 'react';
import {
  BarChart,
  PieChart,
  Pie,
  Bar,
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
import renderCustomizedLabel from '../RenderCustomizedLabel';
import { generateColor } from '../../utils/colorUtil.js';
import PropTypes from 'prop-types';

export const BmiChart = ({ schoolYear }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (schoolYear) {
      const fetchData = async () => {
        try {
          const response = await axiosInstance.get(
            `/feedingProgram/fetchComparisonPREAndPOST/${schoolYear}`
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
              Nutritional Status Improvement After Feeding Program
            </Typography>
            <Typography variant="body1" paragraph>
              Comparison of Pre and Post-Intervention BMI Classifications
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

BmiChart.propTypes = {
  schoolYear: PropTypes.string.isRequired,
};

export const BeneficiaryImpactChart = ({ schoolYear }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (schoolYear) {
      const fetchData = async () => {
        try {
          const response = await axiosInstance.get(
            `/feedingProgram/fetchBeneficiaryImpact/${schoolYear}` // Change this to your actual endpoint
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
              Health Metrics Comparison: POST vs PRE Measurements
            </Typography>
            <Typography variant="body1" paragraph>
              Comparison of average BMI, weight, and height
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="measurementType" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageBMI" fill="#8884d8" name="Average BMI" />
                <Bar
                  dataKey="averageWeight"
                  fill="#82ca9d"
                  name="Average Weight (kg)"
                />
                <Bar
                  dataKey="averageHeight"
                  fill="#ffc658"
                  name="Average Height (cm)"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

BeneficiaryImpactChart.propTypes = {
  schoolYear: PropTypes.string.isRequired,
};

export const MyPieChart = ({ schoolYear }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (schoolYear) {
      const fetchData = async () => {
        try {
          const response = await axiosInstance.get(
            `/feedingProgram/fetchSBFP/${schoolYear}`
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
              Distribution of SBFP Beneficiaries by Grade Level
            </Typography>
            <Typography variant="body1" paragraph>
              Proportional Representation Across Educational Stages
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
                    <Cell key={`cell-${index}`} fill={generateColor(index)} />
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

MyPieChart.propTypes = {
  schoolYear: PropTypes.string.isRequired,
};

export const FeedingSummary = ({ schoolYear }) => {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (schoolYear) {
      const fetchSummaryData = async () => {
        try {
          const response = await axiosInstance.get(
            `/feedingProgram/fetchComparisonStatistics/${schoolYear}`
          );
          setSummary(response.data.summary);
        } catch (error) {
          console.error('Failed to fetch medical summary:', error);
        }
      };

      fetchSummaryData();
    }
  }, [schoolYear]);

  return (
    <Container maxWidth="md">
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Feeding Summary for {schoolYear}
        </Typography>
        <Typography variant="body1" className="whitespace-pre-line">
          {summary || 'Loading...'}
        </Typography>
      </Box>
    </Container>
  );
};

FeedingSummary.propTypes = {
  schoolYear: PropTypes.string.isRequired,
};
