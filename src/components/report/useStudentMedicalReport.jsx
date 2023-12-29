import { useState } from 'react';
import axiosInstance from '../../config/axios-instance';
import generatePDF from '../../utils/PDFMakeUtil';

const useStudentMedicalReport = () => {
  const [schoolYear, setSchoolYear] = useState('');

  const fetchMedicalRecord = async (recordId) => {
    if (!recordId) {
      return null;
    }

    try {
      const response = await axiosInstance.get(
        `/studentMedical/fetchPDFReport/${recordId}`
      );
      setSchoolYear(response.data.SchoolYear);
      return response.data;
    } catch (error) {
      console.error('Error fetching medical record:', error);
      return null;
    }
  };

  const generatePdfDocument = async (recordId) => {
    const fetchedData = await fetchMedicalRecord(recordId);
    if (
      !fetchedData ||
      !fetchedData.HealthRecord ||
      fetchedData.HealthRecord.length === 0
    ) {
      console.error('No medicalRecord data available to generate the PDF');
      return;
    }

    const medicalRecord = fetchedData.HealthRecord;

    const headerDetails = [
      `Name: ${medicalRecord.Name}`,
      `LRN: ${medicalRecord.LRN}`,
      `Date Of Birth: ${medicalRecord.DOB}`,
      `Age: ${medicalRecord.Age}`,
      `Grade And Section: ${medicalRecord.GradeSection}`,
      `Date Of Examination: ${medicalRecord.DateOfExamination}`,
    ];

    const verticalHeaders = [
      'Date Of Examination',
      'Temperature',
      'Blood Pressure',
      'Heart Rate',
      'Pulse Rate',
      'Respiratory Rate',
      'Weight (kg)',
      'Height (cm)',
      'BMI',
      'BMI Classification',
      'Height For Age',
      'Vision Screening',
      'Auditory Screening',
      'Skin Screening',
      'Scalp Screening',
      'Eyes Screening',
      'Ears Screening',
      'Nose Screening',
      'Mouth Screening',
      'Throat Screening',
      'Neck Screening',
      'Lung Screening',
      'Heart Screening',
      'Abdomen',
      'Deformities',
      'Iron Supplementation',
      'Deworming',
      'Menarche',
      'Remarks',
    ];

    // Data for the vertical table
    const verticalTableData = [
      medicalRecord.DateOfExamination,
      medicalRecord.Temperature,
      medicalRecord.BloodPressure,
      medicalRecord.HeartRate,
      medicalRecord.PulseRate,
      medicalRecord.RespiratoryRate,
      medicalRecord.WeightKg,
      medicalRecord.HeightCm,
      medicalRecord.BMI,
      medicalRecord.BMIClassification,
      medicalRecord.HeightForAge,
      medicalRecord.VisionScreening,
      medicalRecord.AuditoryScreening,
      medicalRecord.SkinScreening,
      medicalRecord.ScalpScreening,
      medicalRecord.EyesScreening,
      medicalRecord.EarScreening,
      medicalRecord.NoseScreening,
      medicalRecord.MouthScreening,
      medicalRecord.ThroatScreening,
      medicalRecord.NeckScreening,
      medicalRecord.LungScreening,
      medicalRecord.HeartScreening,
      medicalRecord.Abdomen,
      medicalRecord.Deformities,
      medicalRecord.IronSupplementation,
      medicalRecord.Deworming,
      medicalRecord.Menarche,
      medicalRecord.Remarks,
    ];

    generatePDF(
      `School Health Examination Card SY ${schoolYear}`,
      headerDetails,
      [
        'School ID Number: 129548',
        'Region: XI',
        'Division/Province: Davao City',
        'Telephone No.:',
      ],
      [
        {
          header: 'Medical Record',
          content: [
            {
              type: 'verticalTable',
              headers: verticalHeaders,
              data: verticalTableData,
            },
          ],
        },
      ]
    );
  };

  return {
    generatePdfDocument,
    schoolYear,
  };
};

export default useStudentMedicalReport;
