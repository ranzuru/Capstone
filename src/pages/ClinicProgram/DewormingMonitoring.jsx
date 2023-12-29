import Header from '../../components/Header';
import Footer from '../../components/Footer';
import DewormingGrid from '../../components/Grid/DewormingGrid';
import { useSchoolYear } from '../../hooks/useSchoolYear';

const DewormingMonitoring = () => {
  const { activeSchoolYear } = useSchoolYear();
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title={`Deworming Records SY: ${activeSchoolYear}`} />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <DewormingGrid />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
export default DewormingMonitoring;
