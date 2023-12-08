import Header from '../../components/Header';
import Footer from '../../components/Footer';
import MedicalCombinedCharts from '../../components/MedicalCombinedCharts';

const MedicalCheckupAnalytics = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Student Medical Analytics" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <MedicalCombinedCharts />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MedicalCheckupAnalytics;
