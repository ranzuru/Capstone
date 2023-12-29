import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeedingProgramGrid from '../../components/Grid/FeedingProgramGrid';
import { useSchoolYear } from '../../hooks/useSchoolYear';

const FeedingProgram = () => {
  const { activeSchoolYear } = useSchoolYear();
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title={`Feeding Program SY: ${activeSchoolYear}`} />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <FeedingProgramGrid />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};
export default FeedingProgram;
