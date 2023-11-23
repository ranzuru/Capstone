import Header from '../components/Header';
import Footer from '../components/Footer';
import Calendar from '../components/Calendar';

const Events = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header title="Events" />
      <div className="flex-grow">
        <div className="p-4 overflow-auto h-full">
          <Calendar />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Events;
