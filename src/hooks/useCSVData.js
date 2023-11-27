// hooks/useCSVData.js
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const useCSVData = () => {
  const [bmiData, setBmiData] = useState([]);
  const [heightForAgeData, setHeightForAgeData] = useState([]);

  useEffect(() => {
    // Function to load BMI Data
    const loadBMI = () => {
      Papa.parse('/assets/data/combined_bmi_updated.csv', {
        header: true,
        download: true,
        dynamicTyping: true,
        complete: (results) => setBmiData(results.data),
      });
    };

    // Function to load Height-for-Age Data
    const loadHeightForAge = () => {
      Papa.parse('/assets/data/HeightForAge_Combined.csv', {
        header: true,
        download: true,
        dynamicTyping: true,
        complete: (results) => setHeightForAgeData(results.data),
      });
    };

    loadBMI();
    loadHeightForAge();
  }, []);

  return { bmiData, heightForAgeData };
};

export default useCSVData;
