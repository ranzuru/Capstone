import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CustomDashboardCard from '../custom/CustomDashboardCard';
import { Grid } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FaceIcon from '@mui/icons-material/Face';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import { SchoolYearDashboard } from './SchoolYearDashboard';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCardClickManageUser = () => {
    navigate('/app/manage-users');
  };

  const handleCardClickStudents = () => {
    navigate('/app/students-profile');
  };

  const handleCardClickClinic = () => {
    navigate('/app/clinic-records');
  };

  const handleCardClickFeeding = () => {
    navigate('/app/feeding-program');
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header title="Dashboard" />
        <div className="flex-grow">
          <div className="dashboard-content">
            <Grid className="pt-14 pr-4 pl-4" container spacing={3}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomDashboardCard
                  icon={PersonIcon}
                  number="69"
                  title="Number of User"
                  subtitle="Number of user of this system."
                  onCardClick={handleCardClickManageUser}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomDashboardCard
                  icon={FaceIcon}
                  number="69"
                  title="Number of Students"
                  subtitle="Number of students."
                  onCardClick={handleCardClickStudents}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomDashboardCard
                  icon={LocalHospitalIcon}
                  number="250"
                  title="Clinic Visitors"
                  subtitle="Number of clinic visitors."
                  onCardClick={handleCardClickClinic}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomDashboardCard
                  icon={RiceBowlIcon}
                  number="250"
                  title="Feeding Program"
                  subtitle="Students eligible for feeding program."
                  onCardClick={handleCardClickFeeding}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SchoolYearDashboard />
              </Grid>
            </Grid>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
