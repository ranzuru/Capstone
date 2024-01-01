import { useState, useEffect } from 'react';
import axiosInstance from '../../config/axios-instance';
import generatePDF from '../../utils/PDFMakeUtil';
import { useSchoolYear } from '../../hooks/useSchoolYear';

const useDengueReport = () => {
  const [dengueCases, setDengueCases] = useState([]);
  const [schoolYear, setSchoolYear] = useState('');
  const { activeSchoolYear } = useSchoolYear();

  useEffect(() => {
    const fetchDengueCases = async () => {
      try {
        const response = await axiosInstance.get(
          `/dengueMonitoring/fetchPDFReport?schoolYear=${encodeURIComponent(
            activeSchoolYear
          )}`
        );
        setDengueCases(response.data.DengueCases);
        setSchoolYear(response.data.SchoolYear);
      } catch (error) {
        console.error('Error fetching dengue cases:', error);
      }
    };

    fetchDengueCases();
  }, [activeSchoolYear]);

  const generatePdfDocument = () => {
    const columns = [
      { title: 'No.', key: 'no' },
      { title: 'Name', key: 'name' },
      { title: 'Age', key: 'age' },
      { title: 'Sex', key: 'sex' },
      { title: 'Grade/Section', key: 'gradeSection' },
      { title: 'Adviser', key: 'adviser' },
      { title: 'Address', key: 'address' },
      { title: 'Date of Onset', key: 'dateOfOnset' },
      { title: 'Date of Admission', key: 'dateOfAdmission' },
      { title: 'Hospital Admission', key: 'hospitalOfAdmission' },
      { title: 'Date Discharge', key: 'dateDischarge' },
    ];

    const tableData = dengueCases.map((caseItem, index) => ({
      no: String(index + 1),
      name: caseItem.Name,
      age: String(caseItem.Age),
      sex: caseItem.Gender,
      gradeSection: caseItem.GradeSection,
      adviser: caseItem.Adviser,
      address: caseItem.Address,
      dateOfOnset: caseItem.DateOfOnset,
      dateOfAdmission: caseItem.DateOfAdmission,
      hospitalOfAdmission: caseItem.HospitalOfAdmission,
      dateDischarge: caseItem.DateOfDischarge,
    }));

    generatePDF(
      `Don Juan Dela Cruz Central Elementary School Dengue Monitoring SY ${schoolYear}`,
      [
        'Division/Province: Davao City',
        'City/Municipality/Barangay: Davao City/Davao del Sur',
        'Name of School/School District: DON JUAN DELA CRUZ CES/Daliaon District',
        'School ID Number: 129548',
      ],
      [],
      [
        {
          header: 'Dengue Cases Monitoring',
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
    dengueCases,
    schoolYear,
  };
};

export default useDengueReport;
