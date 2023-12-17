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
import { colorUtil } from '../../utils/colorUtil.js';
import PropTypes from 'prop-types';

export const StudentMedicalBar = ({ schoolYear }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (schoolYear) {
      const fetchData = async () => {
        try {
          const response = await axiosInstance.get(
            `/studentMedical/fetchBar/${schoolYear}`
          );
          setData(response.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
  }, [schoolYear]);

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
                    fill={colorUtil(key, index)}
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

StudentMedicalBar.propTypes = {
  schoolYear: PropTypes.string.isRequired,
};

export const ScreeningPerGrade = ({ schoolYear }) => {
  const [data, setData] = useState([]);
  const [selectedValue, setSelectedValue] = useState('Grade 1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          `/studentMedical/fetchScreeningPerGrade/${schoolYear}/${selectedValue}`
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (schoolYear && selectedValue) {
      fetchData();
    }
  }, [schoolYear, selectedValue]);

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
    .sort((a, b) => {
      if (a === 'Normal') return -1;
      if (b === 'Normal') return 1;
      return a.localeCompare(b);
    });

  return (
    <Container maxWidth="md">
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Health Screening Concerns by Grade
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
                    fill={colorUtil(key, index)}
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

ScreeningPerGrade.propTypes = {
  schoolYear: PropTypes.string.isRequired,
};

export const MedicalSummary = ({ schoolYear }) => {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (schoolYear) {
      const fetchSummaryData = async () => {
        try {
          const response = await axiosInstance.get(
            `/studentMedical/fetchComparisonStatistics/${schoolYear}`
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
          Medical Summary for {schoolYear}
        </Typography>
        <Typography variant="body1" className="whitespace-pre-line">
          {summary || 'Loading...'}
        </Typography>
      </Box>
    </Container>
  );
};

MedicalSummary.propTypes = {
  schoolYear: PropTypes.string.isRequired,
};
