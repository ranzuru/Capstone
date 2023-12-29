import { useContext } from 'react';
import { SchoolYearContext } from '../context/SchoolYearContext';

export const useSchoolYear = () => {
  return useContext(SchoolYearContext);
};
