import Header from '../components/Header';
import Footer from '../components/Footer';
import StudentProfileGrid from '../components/Grid/StudentProfileGrid';
import { useSchoolYear } from '../hooks/useSchoolYear';

const StudentProfile = () => {
  const { activeSchoolYear } = useSchoolYear();
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title={`Student Records SY: ${activeSchoolYear}`} />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <StudentProfileGrid />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default StudentProfile;
