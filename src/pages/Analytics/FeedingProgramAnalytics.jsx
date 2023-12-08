import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeedingCombineCharts from '../../components/FeedingCombineCharts';

const FeedingProgramAnalytics = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Nutritional Status Analytics" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <FeedingCombineCharts />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default FeedingProgramAnalytics;
