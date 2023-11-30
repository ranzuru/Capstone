import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DengueCombinedCharts from '../../components/DengueCombinedCharts';

const DengueMonitoringAnalysis = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Dengue Analytics" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <DengueCombinedCharts />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
export default DengueMonitoringAnalysis;
