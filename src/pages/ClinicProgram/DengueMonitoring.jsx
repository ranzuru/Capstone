import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DengueMonitoringGrid from '../../components/Grid/DengueMonitoringGrid';

const DengueMonitoring = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Dengue Monitoring" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <DengueMonitoringGrid />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
export default DengueMonitoring;
