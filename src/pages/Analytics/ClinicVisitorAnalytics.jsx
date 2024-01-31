import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ClinicVisitCombined from '../../components/ClinicVisitCombinedCharts';

const ClinicVisitorAnalytics = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Clinic Visit Analytics" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <ClinicVisitCombined />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
export default ClinicVisitorAnalytics;
