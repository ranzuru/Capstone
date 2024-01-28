import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';
import { Container, Typography, Grid, Box } from '@mui/material';
import axiosInstance from '../../config/axios-instance.js';
import PropTypes from 'prop-types';
import renderCustomizedLabel from '../RenderCustomizedLabel';

export const DengueBarChart = ({ schoolYear }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (schoolYear) {
      const fetchData = async () => {
        try {
          const response = await axiosInstance.get(
            `/dengueMonitoring/fetchBar/${schoolYear}`
          );
          setChartData(response.data);
        } catch (error) {
          console.error('Error fetching chart data:', error);
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
              Case Distribution by Age Group and Gender for SY {schoolYear}
            </Typography>
            <Typography variant="body1" paragraph>
              Chart displays dengue case counts by gender across age groups,
              guiding targeted prevention.
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="ageGroup"
                  label={{
                    value: 'Ages',
                    position: 'insideBottom',
                    offset: -20,
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
                <Legend
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ position: 'relative', bottom: -5 }}
                />
                <Bar dataKey="Male" fill="#8884d8" />
                <Bar dataKey="Female" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

DengueBarChart.propTypes = {
  schoolYear: PropTypes.string,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { totalCases, hospitalCases, nonHospitalCases, year } =
      payload[0].payload;
    return (
      <div className="custom-tooltip bg-white p-2 border border-gray-300 shadow-lg">
        <p className="font-bold">{`${label} ${year}`}</p>
        <p className="text-sm">{`Total Cases: ${totalCases}`}</p>
        <p
          className="text-sm"
          style={{ color: '#413ea0' }}
        >{`Hospital Cases: ${hospitalCases}`}</p>
        <p
          className="text-sm"
          style={{ color: '#ff7300' }}
        >{`Non-Hospital Cases: ${nonHospitalCases}`}</p>
      </div>
    );
  }

  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.string,
};

CustomTooltip.defaultProps = {
  active: false,
  payload: [],
  label: '',
};

export const DengueCasesLineChart = ({ schoolYear }) => {
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
              Monthly Dengue Trends for SY {schoolYear}
            </Typography>
            <Typography variant="body1" paragraph>
              Line graph showing monthly dengue cases to pinpoint trend
              patterns.
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  interval={0}
                  angle={-45}
                  height={70}
                  textAnchor="end"
                />
                <YAxis
                  label={{
                    value: 'Number of Cases',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="hospitalCases"
                  barSize={20}
                  fill="#413ea0"
                  name="Hospital Cases"
                />
                <Line
                  type="monotone"
                  dataKey="nonHospitalCases"
                  stroke="#ff7300"
                  name="Non-Hospital Cases"
                  activeDot={{ r: 8 }}
                />
              </ComposedChart>
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

export const DengueCasesByGradePieChart = ({ schoolYear }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (schoolYear) {
      const fetchData = async () => {
        try {
          const response = await axiosInstance.get(
            `/dengueMonitoring/fetchPie/${schoolYear}`
          );
          setData(
            response.data.map((item) => ({ name: item._id, value: item.count }))
          );
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [schoolYear]);

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
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Grade-Level Impact Distribution for SY {schoolYear}
            </Typography>
            <Typography variant="body1" paragraph>
              Pie chart breakdown of dengue cases by school grade for targeted
              prevention planning.
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius="85%"
                  labelLine={false}
                  label={renderCustomizedLabel}
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

DengueCasesByGradePieChart.propTypes = {
  schoolYear: PropTypes.string,
};

export const DengueSummary = ({ schoolYear }) => {
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
            `/dengueMonitoring/fetchComparisonAnalytics/${schoolYear}`
          );
          setSummary(response.data.summary);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to fetch dengue summary:', error);
          setError(
            error.response?.data?.message ||
              'No summary data available for this school year.'
          );
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
          Dengue Case Summary for {schoolYear}
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

DengueSummary.propTypes = {
  schoolYear: PropTypes.string.isRequired,
};
