// useFetchSchoolYears.js
import { useState, useEffect } from 'react';
import axiosInstance from '../config/axios-instance';

const useFetchSchoolYears = () => {
  const [schoolYears, setSchoolYears] = useState([]);
  const [activeSchoolYear, setActiveSchoolYear] = useState('');

  useEffect(() => {
    const fetchSchoolYears = async () => {
      try {
        const response = await axiosInstance.get(
          '/academicYear/fetchSchoolYears'
        );
        const fetchedSchoolYears = response.data.map((year) => ({
          label: year.schoolYear,
          value: year.schoolYear,
        }));

        setSchoolYears(fetchedSchoolYears);

        // Find and set the active school year
        const activeYear = response.data.find((year) => year.isActive);
        if (activeYear) {
          setActiveSchoolYear(activeYear.schoolYear);
        }
      } catch (error) {
        console.error('Error fetching school years:', error);
      }
    };

    fetchSchoolYears();
  }, []);

  return { schoolYears, activeSchoolYear };
};

export default useFetchSchoolYears;
