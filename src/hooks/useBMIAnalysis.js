import { useState, useEffect } from 'react';
import useCSVData from './useCSVData';

const epsilon = 0.01; // A small value for range comparisons

export const useBMIAnalysis = (birthDate, gender, age, weight, height) => {
  const { bmiData, heightForAgeData } = useCSVData();
  const [bmiClassification, setBmiClassification] = useState('');
  const [heightForAge, setHeightForAge] = useState('');
  const [bmi, setBmi] = useState('');
  const [beneficiaryOfSBFP, setBeneficiaryOfSBFP] = useState(false);

  useEffect(() => {
    if (birthDate && gender && age && weight && height) {
      const now = new Date();
      const ageInMonths = Math.floor(
        (now - new Date(birthDate)) / (1000 * 60 * 60 * 24 * 30.44)
      );

      // Calculate BMI
      const calculatedBmi =
        parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2);
      setBmi(calculatedBmi.toFixed(2));

      // Find the BMI category
      const bmiCategory = bmiData.find(
        (row) => row.Month === ageInMonths && row.Gender === gender
      );
      if (bmiCategory) {
        let categoryLabel = 'Unknown';
        const bmiValue = parseFloat(calculatedBmi);

        if (bmiValue <= parseFloat(bmiCategory['Wasted From']) + epsilon) {
          categoryLabel = 'Severely Wasted';
        } else if (
          bmiValue >= parseFloat(bmiCategory['Wasted From']) - epsilon &&
          bmiValue <= parseFloat(bmiCategory['Wasted To']) + epsilon
        ) {
          categoryLabel = 'Wasted';
        } else if (
          bmiValue >= parseFloat(bmiCategory['Normal From']) - epsilon &&
          bmiValue <= parseFloat(bmiCategory['Normal To']) + epsilon
        ) {
          categoryLabel = 'Normal';
        } else if (
          bmiValue >= parseFloat(bmiCategory['Overweight From']) - epsilon &&
          bmiValue <= parseFloat(bmiCategory['Overweight To']) + epsilon
        ) {
          categoryLabel = 'Overweight';
        } else if (
          bmiValue >
          parseFloat(bmiCategory['Overweight To']) - epsilon
        ) {
          categoryLabel = 'Obese';
        }

        setBmiClassification(categoryLabel);
      }

      // Find the Height for Age category
      const heightCategory = heightForAgeData.find(
        (row) => row.Months === ageInMonths && row.Gender === gender
      );
      if (heightCategory) {
        let categoryLabel = 'Unknown';
        const heightValue = parseFloat(height);

        if (
          heightValue <=
          parseFloat(heightCategory['Severely Stunted']) + epsilon
        ) {
          categoryLabel = 'Severely Stunted';
        } else if (
          heightValue >=
            parseFloat(heightCategory['Stunted Start']) - epsilon &&
          heightValue <= parseFloat(heightCategory['Stunted End']) + epsilon
        ) {
          categoryLabel = 'Stunted';
        } else if (
          heightValue >= parseFloat(heightCategory['Normal Start']) - epsilon &&
          heightValue <= parseFloat(heightCategory['Normal End']) + epsilon
        ) {
          categoryLabel = 'Normal';
        } else if (
          heightValue >=
          parseFloat(heightCategory['Tall']) - epsilon
        ) {
          categoryLabel = 'Tall';
        }

        setHeightForAge(categoryLabel);
      }

      // Determine if the student is a beneficiary of SBFP based on the BMI classification
      setBeneficiaryOfSBFP(bmiClassification.includes('Wasted'));
    }
  }, [
    birthDate,
    gender,
    age,
    weight,
    height,
    bmiData,
    heightForAgeData,
    bmiClassification,
  ]);

  return {
    bmi,
    bmiClassification,
    heightForAge,
    beneficiaryOfSBFP,
  };
};
