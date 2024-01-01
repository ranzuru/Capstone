import { useState, useEffect } from 'react';
import axiosInstance from '../../config/axios-instance';
import generatePDF from '../../utils/PDFMakeUtil';
import { useSchoolYear } from '../../hooks/useSchoolYear';

const useDewormMonitoringReport = () => {
  const [dewormReportData, setDewormReportData] = useState([]);
  const [schoolYear, setSchoolYear] = useState('');
  const { activeSchoolYear } = useSchoolYear();

  useEffect(() => {
    const fetchDewormReport = async () => {
      try {
        const response = await axiosInstance.get(
          `/deworming/fetchPDFReport?schoolYear=${encodeURIComponent(
            activeSchoolYear
          )}`
        );
        setDewormReportData(response.data.DewormReport);
        setSchoolYear(response.data.SchoolYear);
      } catch (error) {
        console.error('Error fetching deworm report:', error);
      }
    };

    fetchDewormReport();
  }, [activeSchoolYear]);

  const columnWidths = [
    'auto',
    'auto',
    'auto',
    'auto',
    'auto',
    'auto',
    'auto',
    'auto',
    '*',
  ];

  const generatePdfDocument = () => {
    // Define the columns based on the structure provided by the `getDewormReport` controller
    const columns = [
      { title: 'Grade', key: 'grade' },
      { title: 'Enrolled 4Ps', key: 'enrolled4Ps' },
      { title: 'Enrolled Non-4Ps', key: 'enrolledNon4Ps' },
      { title: 'Total Enrolled', key: 'totalEnrolled' },
      { title: 'Dewormed 4Ps', key: 'dewormed4Ps' },
      { title: 'Dewormed Non-4Ps', key: 'dewormedNon4Ps' },
      { title: 'Total Dewormed', key: 'totalDewormed' },
      { title: 'Dewormed %', key: 'dewormedPercentage' },
      { title: 'Remarks', key: 'remarks' },
    ];

    const tableData = dewormReportData.map((report) => ({
      ...report,
      grade: report.grade,
      enrolled4Ps: String(report.enrolled4Ps),
      enrolledNon4Ps: String(report.enrolledNon4Ps),
      totalEnrolled: String(report.totalEnrolled),
      dewormed4Ps: String(report.dewormed4Ps),
      dewormedNon4Ps: String(report.dewormedNon4Ps),
      totalDewormed: String(report.totalDewormed),
      dewormedPercentage: report.dewormedPercentage,
      remarks: '',
    }));

    generatePDF(
      `Deworming Monitoring Report for SY ${schoolYear}`,
      [
        'Division/Province: Davao City',
        'City/Municipality/Barangay: Davao City/Davao del Sur',
        'Name of School/School District: DON JUAN DELA CRUZ CES/Daliaon District',
        'School ID Number: 129548',
      ],
      [],
      [
        {
          header: 'Deworming Monitoring Form',
          content: [
            {
              type: 'table',
              columns, // columns definition
              data: tableData,
              widths: columnWidths,
            },
          ],
        },
      ],
      'landScape'
    );
  };

  return {
    generatePdfDocument,
    dewormReportData,
    schoolYear,
  };
};

export default useDewormMonitoringReport;
