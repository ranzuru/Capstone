import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { formatYearFromDate } from '../../utils/formatDateFromYear';
import { statusColors } from '../../utils/statusColor.js';

import StatusBadge from '../../custom/CustomStatusBadge';

const RecordInfoDialog = ({ open, onClose, record }) => {
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle className="bg-gray-100 text-gray-800">
          Student Medical Information
        </DialogTitle>
        <DialogContent className="divide-y divide-gray-200">
          {record ? (
            <div className="space-y-6 p-4">
              <div>
                <Typography variant="h6" className="font-semibold">
                  Basic Information
                </Typography>
                <div className="space-y-4">
                  {Object.entries({
                    'Date Of Examination': formatYearFromDate(
                      record.dateOfExamination
                    ),
                    'Student LRN': record.lrn,
                    Name: record.name,
                    Gender: record.gender,
                    'Birth Date': formatYearFromDate(record.dateOfBirth),
                    Age: record.age,
                    '4ps': record.is4p ? 'Yes' : 'No',
                    Grade: record.grade,
                    Section: record.section,
                    'School Year': record.schoolYear,
                    Status: (
                      <StatusBadge
                        value={record.status}
                        colorMapping={statusColors}
                      />
                    ),
                  }).map(([label, value]) => (
                    <Typography
                      key={label}
                      variant="subtitle1"
                      className="font-semibold"
                    >
                      {label}: <span className="text-gray-600">{value}</span>
                    </Typography>
                  ))}
                </div>
              </div>

              <div>
                <Typography variant="h6" className="font-semibold">
                  Health Metrics
                </Typography>
                <div className="space-y-4">
                  {Object.entries({
                    'Height (cm)': record.heightCm,
                    'Weight (kg)': record.weightKg,
                    BMI: record.bmi,
                    'BMI Classification': record.bmiClassification,
                    'Height for Age': record.heightForAge,
                    'Iron Supplementation': record.ironSupplementation
                      ? 'Yes'
                      : 'No',
                    Deworming: record.deworming ? 'Yes' : 'No',
                  }).map(([label, value]) => (
                    <Typography
                      key={label}
                      variant="subtitle1"
                      className="font-semibold"
                    >
                      {label}: <span className="text-gray-600">{value}</span>
                    </Typography>
                  ))}
                </div>
              </div>

              <div>
                <Typography variant="h6" className="font-semibold">
                  Screening Results
                </Typography>
                <div className="space-y-4">
                  {Object.entries({
                    'Pulse Rate': record.pulseRate,
                    'Respiratory Rate': record.respiratoryRate,
                    'Vision Screening': record.visionScreening,
                    'Auditory Screening': record.auditoryScreening,
                    'Scalp Screening': record.scalpScreening,
                    'Skin Screening': record.skinScreening,
                    'Eyes Screening': record.eyesScreening,
                    'Ear Screening': record.earScreening,
                    'Nose Screening': record.noseScreening,
                    'Mouth Screening': record.mouthScreening,
                    'Neck Screening': record.neckScreening,
                    'Throat Screening': record.throatScreening,
                    'Lung Screening': record.lungScreening,
                    'Heart Screening': record.heartScreening,
                    Abdomen: record.abdomen,
                    Deformities: record.deformities,
                    Menarche: record.menarche,
                    Temperature: record.temperature,
                    'Blood Pressure': record.bloodPressure,
                    'Heart Rate': record.heartRate,
                    Remarks: record.remarks,
                  }).map(([label, value]) => (
                    <Typography
                      key={label}
                      variant="subtitle1"
                      className="font-semibold"
                    >
                      {label}: <span className="text-gray-600">{value}</span>
                    </Typography>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Typography className="py-4 text-center text-gray-600">
              No student medical information available.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

RecordInfoDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  record: PropTypes.shape({
    dateOfExamination: PropTypes.string,
    lrn: PropTypes.string,
    name: PropTypes.string,
    gender: PropTypes.string,
    dateOfBirth: PropTypes.string,
    age: PropTypes.number,
    is4p: PropTypes.bool,
    schoolYear: PropTypes.string,
    grade: PropTypes.string,
    section: PropTypes.string,
    heightCm: PropTypes.number,
    weightKg: PropTypes.number,
    bmi: PropTypes.number,
    bmiClassification: PropTypes.string,
    heightForAge: PropTypes.string,
    ironSupplementation: PropTypes.bool,
    deworming: PropTypes.bool,
    pulseRate: PropTypes.number,
    respiratoryRate: PropTypes.number,
    visionScreening: PropTypes.string,
    auditoryScreening: PropTypes.string,
    scalpScreening: PropTypes.string,
    skinScreening: PropTypes.string,
    eyesScreening: PropTypes.string,
    earScreening: PropTypes.string,
    noseScreening: PropTypes.string,
    mouthScreening: PropTypes.string,
    neckScreening: PropTypes.string,
    throatScreening: PropTypes.string,
    lungScreening: PropTypes.string,
    heartScreening: PropTypes.string,
    abdomen: PropTypes.string,
    deformities: PropTypes.string,
    menarche: PropTypes.string,
    temperature: PropTypes.number,
    bloodPressure: PropTypes.string,
    heartRate: PropTypes.number,
    remarks: PropTypes.string,
    status: PropTypes.string,
  }),
};

export default RecordInfoDialog;
