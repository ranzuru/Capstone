import Header from '../../components/Header';
import Footer from '../../components/Footer';
import EmployeeMedicalGrid from '../../components/Grid/EmployeeMedicalGrid';

const FacultyCheckup = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Employee Medical Record" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <EmployeeMedicalGrid />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
export default FacultyCheckup;
