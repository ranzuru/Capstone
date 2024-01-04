import { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import axiosInstance from '../../config/axios-instance';
import PropTypes from 'prop-types';

const DengueSummary = ({ schoolYear }) => {
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

export default DengueSummary;
