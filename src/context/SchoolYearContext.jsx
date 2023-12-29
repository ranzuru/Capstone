import { createContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios-instance';
import PropTypes from 'prop-types';

export const SchoolYearContext = createContext(null);

export const SchoolYearProvider = ({ children }) => {
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

  SchoolYearProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return (
    <SchoolYearContext.Provider
      value={{ schoolYears, activeSchoolYear, setActiveSchoolYear }}
    >
      {children}
    </SchoolYearContext.Provider>
  );
};
