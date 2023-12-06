import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DewormCombinedCharts from '../../components/DewormCombinedCharts';

const DewormedMonitoringAnalytics = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Deworming Analytics" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <DewormCombinedCharts />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default DewormedMonitoringAnalytics;
