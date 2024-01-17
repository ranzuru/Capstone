import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CustomDashboardCard from '../custom/CustomDashboardCard';
import { Grid, Typography, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FaceIcon from '@mui/icons-material/Face';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import RiceBowlIcon from '@mui/icons-material/RiceBowl';
import { SchoolYearDashboard } from './SchoolYearDashboard';
import { useAuth } from '../hooks/useAuth';
import { useSchoolYear } from '../hooks/useSchoolYear.js';
import axiosInstance from '../config/axios-instance.js';
import MedicineDashboard from './MedicineDashboard.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeSchoolYear } = useSchoolYear();
  const [isLoading, setIsLoading] = useState(false);
  const [counts, setCounts] = useState({
    userCount: 0,
    studentCount: 0,
    clinicVisitCount: 0,
    feedingProgramCount: 0,
  });

  const fetchCounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/dashboard/dashboard-counts`, {
        params: { schoolYear: activeSchoolYear },
      });
      setCounts(response.data);
    } catch (error) {
      console.error('Error fetching dashboard counts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeSchoolYear]);

  useEffect(() => {
    if (activeSchoolYear) {
      fetchCounts();
    }
  }, [activeSchoolYear, fetchCounts]);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </div>
    );
  }

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
      <div className="flex flex-col min-h-screen bg-custom-blue">
        <Header title={`Hi, ${user?.firstName || 'User'} 👋`} />
        <div className="flex-grow">
          <div className="dashboard-content">
            <Grid className="pt-14 pr-4 pl-4" container spacing={3}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomDashboardCard
                  icon={PersonIcon}
                  number={counts.userCount.toString()}
                  title="Number of User"
                  subtitle="Number of user of this system."
                  onCardClick={handleCardClickManageUser}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomDashboardCard
                  icon={FaceIcon}
                  number={counts.studentCount.toString()}
                  title="Number of Students"
                  subtitle="Number of students."
                  onCardClick={handleCardClickStudents}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomDashboardCard
                  icon={LocalHospitalIcon}
                  number={counts.clinicVisitCount.toString()}
                  title="Clinic Visitors"
                  subtitle="Number of clinic visitors."
                  onCardClick={handleCardClickClinic}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <CustomDashboardCard
                  icon={RiceBowlIcon}
                  number={counts.feedingProgramCount.toString()}
                  title="Feeding Program"
                  subtitle="Students eligible for feeding program."
                  onCardClick={handleCardClickFeeding}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Typography variant="h6" component="div" gutterBottom>
                  Select School Year:
                </Typography>
                <SchoolYearDashboard />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" component="div" gutterBottom>
                  Inventory Expiration Overview
                </Typography>
                <MedicineDashboard />
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
