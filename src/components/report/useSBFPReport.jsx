import { useState, useEffect } from 'react';
import axiosInstance from '../../config/axios-instance';
import generatePDF from '../../utils/PDFMakeUtil';

const useSBFPReport = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [schoolYear, setSchoolYear] = useState('');

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        const response = await axiosInstance.get('/feedingProgram/fetchPDF');
        setBeneficiaries(response.data.Beneficiaries);
        setSchoolYear(response.data.SchoolYear);
      } catch (error) {
        console.error('Error fetching beneficiaries:', error);
      }
    };

    fetchBeneficiaries();
  }, []);

  const generatePdfDocument = () => {
    const columns = [
      { title: 'No.', key: 'no' },
      { title: 'Name', key: 'name' },
      { title: 'Sex', key: 'sex' },
      { title: 'Grade/Section', key: 'gradeSection' },
      { title: 'Date of Birth', key: 'dateOfBirth' },
      { title: 'Date of Weighing', key: 'dateMeasured' },
      { title: 'Age', key: 'age' },
      { title: 'Weight (kg)', key: 'weight' },
      { title: 'Height (cm)', key: 'height' },
      { title: 'BMI', key: 'bmi' },
      { title: 'BMI Classification', key: 'bmiClassification' },
      { title: 'Height For Age', key: 'heightForAge' },
      { title: 'SBFP', key: 'sbfp' },
      { title: 'Remarks', key: 'remarks' },
    ];
    const tableData = beneficiaries.map((beneficiary, index) => ({
      no: String(index + 1),
      name: beneficiary.Name,
      sex: beneficiary.Gender,
      gradeSection: beneficiary.GradeSection,
      dateOfBirth: beneficiary.DOB,
      dateMeasured: beneficiary.DateMeasured,
      age: beneficiary.Age,
      weight: String(beneficiary.Weight),
      height: String(beneficiary.Height),
      bmi: String(beneficiary.BMI),
      bmiClassification: beneficiary.BMIClassification,
      heightForAge: beneficiary.HeightForAge,
      sbfp: beneficiary.SBFP,
      remarks: beneficiary.Remarks,
    }));

    generatePDF(
      `Master List Beneficiaries for School-Based Feeding Program (SBFP) SY ${schoolYear}`,
      [
        'Division/Province: Davao City',
        'City/Municipality/Barangay: Davao City/Davao del Sur',
        'Name of School/School District: DON JUAN DELA CRUZ CES/Daliaon District',
        'School ID Number: 129548',
      ],
      ['Name of Principal: ', 'Name of Feeding Focal Person: '],
      [
        {
          header: 'SBFP Form 1 (2021)',
          content: [
            {
              type: 'table',
              columns, // columns definition
              data: tableData, // data for the table
            },
          ],
        },
      ],
      'landscape'
    );
  };

  return {
    generatePdfDocument,
    beneficiaries,
    schoolYear,
  };
};

export default useSBFPReport;
