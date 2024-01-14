import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { AuthProvider } from './context/AuthProvider'; IBALIK AFTER
import { ThemeProvider } from '@mui/material/styles';
import Login from './components/Login';
import theme from './theme/theme';
import LayoutWithSidebar from './components/LayoutWithSidebar';
// import ProtectedRoute from './utils/ProtectedRoute'; IBALIK AFTER
import PageNotFound from './pages/PageNotFound';
import { SchoolYearProvider } from './context/SchoolYearContext';
// Analytics
import ClinicVisitorAnalytics from './pages/Analytics/ClinicVisitorAnalytics';
import DengueMonitoringAnalytics from './pages/Analytics/DengueMonitoringAnalytics';
import DewormedMonitoringAnalytics from './pages/Analytics/DewormedMonitoringAnalytics';
import FeedingProgramAnalytics from './pages/Analytics/FeedingProgramAnalytics';
import MedicalCheckupAnalytics from './pages/Analytics/MedicalCheckupAnalytics';
// Clinic Programs
import ClinicVisitPage from './pages/ClinicProgram/ClinicRecords';
import DengueMonitoring from './pages/ClinicProgram/DengueMonitoring';
import DewormingMonitoring from './pages/ClinicProgram/DewormingMonitoring';
import FacultyCheckup from './pages/ClinicProgram/FacultyCheckup';
import FeedingProgram from './pages/ClinicProgram/FeedingProgram';
import MedicalCheckup from './pages/ClinicProgram/MedicalCheckup';
// Pages
import Dashboard from './components/Dashboard';
import AcademicYear from './pages/AcademicYear';
import Events from './pages/Events';
import EmployeeProfile from './pages/EmployeeProfile';
import Logs from './pages/Logs';
import ManageUser from './pages/ManageUser';
import MedicineItem from './pages/MedicineItem';
import MedicineBatch from './pages/MedicineBatch';
import MedicineIn from './pages/MedicineIn';
import MedicineDispense from './pages/MedicineDispense';
import MedicineAdjustment from './pages/MedicineAdjustment';
import StudentProfile from './pages/StudentProfile';
import Role from './pages/Role';
import PasswordResetPage from './pages/PasswordReset';
import Settings from './pages/Settings';

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Router>
          {/* <AuthProvider> */}
          <SchoolYearProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/reset-password" element={<PasswordResetPage />} />
              {/* <Route element={<ProtectedRoute />}> */}
              <Route path="/app" element={<LayoutWithSidebar />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="manage-users" element={<ManageUser />} />
                <Route path="students-profile" element={<StudentProfile />} />
                <Route path="employee-profile" element={<EmployeeProfile />} />
                <Route path="academic-year" element={<AcademicYear />} />
                <Route path="role" element={<Role />} />
                <Route path="medicine-item" element={<MedicineItem />} />
                <Route path="medicine-batch" element={<MedicineBatch />} />
                <Route path="medicine-in" element={<MedicineIn />} />
                <Route path="medicine-dispense" element={<MedicineDispense />} />
                <Route path="medicine-adjustment" element={<MedicineAdjustment />} />
                <Route path="events" element={<Events />} />
                <Route path="logs" element={<Logs />} />
                <Route path="clinic-records" element={<ClinicVisitPage />} />
                <Route
                  path="dengue-monitoring"
                  element={<DengueMonitoring />}
                />
                <Route
                  path="dewormed-monitoring"
                  element={<DewormingMonitoring />}
                />
                <Route path="faculty-checkup" element={<FacultyCheckup />} />
                <Route path="feeding-program" element={<FeedingProgram />} />
                <Route path="medical-checkup" element={<MedicalCheckup />} />
                <Route
                  path="clinic-analytics"
                  element={<ClinicVisitorAnalytics />}
                />
                <Route
                  path="dengue-analytics"
                  element={<DengueMonitoringAnalytics />}
                />
                <Route
                  path="dewormed-analytics"
                  element={<DewormedMonitoringAnalytics />}
                />
                <Route
                  path="feeding-analytics"
                  element={<FeedingProgramAnalytics />}
                />
                <Route
                  path="medical-analytics"
                  element={<MedicalCheckupAnalytics />}
                />
              </Route>
              {/* </Route> */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </SchoolYearProvider>
          {/* </AuthProvider> */}
        </Router>
      </ThemeProvider>
    </>
  );
}

export default App;
