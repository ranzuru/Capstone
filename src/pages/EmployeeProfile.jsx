import Header from '../components/Header';
import Footer from '../components/Footer';
import EmployeeProfileGrid from '../components/Grid/EmployeeGrid';
import { useSchoolYear } from '../hooks/useSchoolYear';

const EmployeeProfile = () => {
  const { activeSchoolYear } = useSchoolYear();
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title={`Employee Records SY: ${activeSchoolYear}`} />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <EmployeeProfileGrid />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default EmployeeProfile;
