import { useState, useEffect } from 'react';
import axiosInstance from '../../config/axios-instance';
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Container, Typography, Grid, Box } from '@mui/material';
import PropTypes from 'prop-types';
import renderCustomizedLabel from '../RenderCustomizedLabel';

const DengueCasesByGradePieChart = ({ schoolYear }) => {
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
              Pie chart (Cases by grade level)
            </Typography>
            <Typography variant="body1" paragraph>
              Reveals grade level of the most affected, aiding targeted
              prevention.
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

export default DengueCasesByGradePieChart;
