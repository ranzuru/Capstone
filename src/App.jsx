import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { ThemeProvider } from '@mui/material/styles';
import Login from './components/Login';
import theme from './theme/theme';
import LayoutWithSidebar from './utils/LayoutWithSidebar';
// import ProtectedRoute from './utils/ProtectedRoute';
import PageNotFound from './pages/PageNotFound';
// Analytics
import ClinicVisitorAnalytics from './pages/Analytics/ClinicVisitorAnalytics';
import DengueMonitoringAnalytics from './pages/Analytics/DengueMonitoringAnalytics';
import DewormedMonitoringAnalytics from './pages/Analytics/DewormedMonitoringAnalytics';
import FeedingProgramAnalytics from './pages/Analytics/FeedingProgramAnalytics';
import MedicalCheckupAnalytics from './pages/Analytics/MedicalCheckupAnalytics';
// Clinic Programs
import ClinicRecords from './pages/ClinicProgram/ClinicRecords';
import DengueMonitoring from './pages/ClinicProgram/DengueMonitoring';
import DewormingMonitoring from './pages/ClinicProgram/DewormingMonitoring';
import FacultyCheckup from './pages/ClinicProgram/FacultyCheckup';
import FeedingProgram from './pages/ClinicProgram/FeedingProgram';
import MedicalCheckup from './pages/ClinicProgram/MedicalCheckup';
// Pages
import Dashboard from './components/Dashboard';
import AcademicYear from './pages/AcademicYear';
import Events from './pages/Events';
import FacultyProfile from './pages/FacultyProfile';
import Logs from './pages/Logs';
import ManageUser from './pages/ManageUser';
import MedicineInventory from './pages/MedicineInventory';
import StudentProfile from './pages/StudentProfile';
import UserApproval from './pages/UserApproval';

function App() {
  return (
    <>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              {/* <Route element={<ProtectedRoute />}> */}
              <Route path="/app" element={<LayoutWithSidebar />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="user-approval" element={<UserApproval />} />
                <Route path="manage-users" element={<ManageUser />} />
                <Route path="students-profile" element={<StudentProfile />} />
                <Route path="faculty-profile" element={<FacultyProfile />} />
                <Route path="academic-year" element={<AcademicYear />} />
                <Route
                  path="medicine-inventory"
                  element={<MedicineInventory />}
                />
                <Route path="events" element={<Events />} />
                <Route path="logs" element={<Logs />} />
                <Route path="clinic-records" element={<ClinicRecords />} />
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
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}

export default App;
