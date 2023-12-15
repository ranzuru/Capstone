import { useState, useEffect } from 'react';
import axiosInstance from '../../config/axios-instance';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Container, Typography, Grid, Box } from '@mui/material';
import ReUseSelect from '../ReUseSelect.jsx';
import { gradeOptions } from '../../others/dropDownOptions';

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

  // Assuming each data item has the name of the condition as the key and the count as the value
  // Find all unique condition keys across all data items, including 'Normal'
  const conditionKeys = [
    ...new Set(
      data.flatMap((item) => Object.keys(item).filter((key) => key !== 'name'))
    ),
  ].sort((a, b) => a.localeCompare(b)); // Sort to maintain consistent color mapping

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Health Screening Outcomes by Condition
            </Typography>
            <Typography variant="body1" paragraph>
              Comparative Analysis of Normal vs. Specific Conditions Across
              Screening Categories.
            </Typography>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart
                width={600}
                height={300}
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
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
                    value: 'Total Number',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                  }}
                />
                <Tooltip />
                {conditionKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={colorUtil(index)}
                    stackId="a"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

// Define your color scheme for each condition
const colorUtil = (index) => {
  const hue = index * 137.508; // Use golden angle approximation for good distribution
  const saturation = 50 + (index % 4) * 10; // Alternate between 50%, 60%, 70%, and 80%
  const lightness = 50 + (index % 3) * 5; // Alternate between 50%, 55%, and 60%
  return `hsl(${hue % 360}, ${saturation}%, ${lightness}%)`;
};

export const ScreeningPerGrade = () => {
  const [data, setData] = useState([]);
  const [selectedValue, setSelectedValue] = useState('Grade 1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/studentMedical/fetchScreeningPerGrade/${selectedValue}`
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

  const issueKeys = data
    .reduce((acc, item) => {
      Object.keys(item).forEach((key) => {
        if (key !== 'grade' && key !== 'screeningType' && !acc.includes(key)) {
          acc.push(key);
        }
      });
      return acc;
    }, [])
    .sort();

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Prevalence of Health Screening Concerns by Grade
            </Typography>
            <Typography variant="body1" paragraph>
              Detailed Breakdown of Non-Normal Findings in Student Health
              Assessments.
            </Typography>
            <ReUseSelect
              label="Options"
              value={selectedValue}
              onChange={handleChange}
              options={gradeOptions}
            />
            <ResponsiveContainer
              width="100%"
              height={400}
              style={{ marginTop: '18px' }}
            >
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
                  dataKey="screeningType"
                  interval={0}
                  angle={-75}
                  textAnchor="end"
                />
                <YAxis
                  label={{
                    value: 'Total Number',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                  }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />

                {issueKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={colorUtil(index)}
                    stackId="a"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};
