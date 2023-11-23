import Header from '../components/Header';
import Footer from '../components/Footer';
import AcademicYearGrid from '../components/Grid/AcademicYearGrid';

const AcademicYear = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Manage Academic Year" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <AcademicYearGrid />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AcademicYear;
