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
      let bmiCategoryLabel = 'Unknown';
      const bmiCategory = bmiData.find(
        (row) => row.Month === ageInMonths && row.Gender === gender
      );
      if (bmiCategory) {
        const bmiValue = parseFloat(calculatedBmi);

        if (bmiValue <= parseFloat(bmiCategory['Wasted From']) + epsilon) {
          bmiCategoryLabel = 'Severely Wasted';
        } else if (
          bmiValue >= parseFloat(bmiCategory['Wasted From']) - epsilon &&
          bmiValue <= parseFloat(bmiCategory['Wasted To']) + epsilon
        ) {
          bmiCategoryLabel = 'Wasted';
        } else if (
          bmiValue >= parseFloat(bmiCategory['Normal From']) - epsilon &&
          bmiValue <= parseFloat(bmiCategory['Normal To']) + epsilon
        ) {
          bmiCategoryLabel = 'Normal';
        } else if (
          bmiValue >= parseFloat(bmiCategory['Overweight From']) - epsilon &&
          bmiValue <= parseFloat(bmiCategory['Overweight To']) + epsilon
        ) {
          bmiCategoryLabel = 'Overweight';
        } else if (
          bmiValue >
          parseFloat(bmiCategory['Overweight To']) - epsilon
        ) {
          bmiCategoryLabel = 'Obese';
        }

        setBmiClassification(bmiCategoryLabel);
      }

      // Determine if the student is a beneficiary of SBFP based on the BMI classification
      setBeneficiaryOfSBFP(
        bmiCategoryLabel === 'Wasted' || bmiCategoryLabel === 'Severely Wasted'
      );

      // Find the Height for Age category
      let heightCategoryLabel = 'Unknown';
      const heightCategory = heightForAgeData.find(
        (row) => row.Months === ageInMonths && row.Gender === gender
      );
      if (heightCategory) {
        const heightValue = parseFloat(height);

        if (
          heightValue <=
          parseFloat(heightCategory['Severely Stunted']) + epsilon
        ) {
          heightCategoryLabel = 'Severely Stunted';
        } else if (
          heightValue >=
            parseFloat(heightCategory['Stunted Start']) - epsilon &&
          heightValue <= parseFloat(heightCategory['Stunted End']) + epsilon
        ) {
          heightCategoryLabel = 'Stunted';
        } else if (
          heightValue >= parseFloat(heightCategory['Normal Start']) - epsilon &&
          heightValue <= parseFloat(heightCategory['Normal End']) + epsilon
        ) {
          heightCategoryLabel = 'Normal';
        } else if (
          heightValue >=
          parseFloat(heightCategory['Tall']) - epsilon
        ) {
          heightCategoryLabel = 'Tall';
        }

        setHeightForAge(heightCategoryLabel);
      }
    }
  }, [birthDate, gender, age, weight, height, bmiData, heightForAgeData]);

  return {
    bmi,
    bmiClassification,
    heightForAge,
    beneficiaryOfSBFP,
  };
};
