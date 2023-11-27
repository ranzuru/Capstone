import Header from '../../components/Header';
import Footer from '../../components/Footer';
import StudentMedicalGrid from '../../components/Grid/StudentMedicalGrid';

const MedicalCheckup = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Student Medical Record" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <StudentMedicalGrid />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
export default MedicalCheckup;
