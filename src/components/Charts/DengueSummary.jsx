import { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import axiosInstance from '../../config/axios-instance';
import PropTypes from 'prop-types';

const DengueSummary = ({ schoolYear }) => {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (schoolYear) {
      const fetchSummaryData = async () => {
        try {
          const response = await axiosInstance.get(
            `/dengueMonitoring/fetchComparisonAnalytics/${schoolYear}`
          );
          setSummary(response.data.summary);
        } catch (error) {
          console.error('Failed to fetch dengue summary:', error);
        }
      };

      fetchSummaryData();
    }
  }, [schoolYear]);

  return (
    <Container maxWidth="md">
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          Dengue Case Summary for {schoolYear}
        </Typography>
        <Typography variant="body1" className="whitespace-pre-line">
          {summary || 'Loading...'}
        </Typography>
      </Box>
    </Container>
  );
};

DengueSummary.propTypes = {
  schoolYear: PropTypes.string.isRequired,
};

export default DengueSummary;
