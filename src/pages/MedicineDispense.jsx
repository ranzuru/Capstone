import Header from '../components/Header';
import Footer from '../components/Footer';
import Grid from '../components/Grid/MedicineDispenseGrid';

const MedicineDispense = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Medicine Inventory: Quantity Dispense" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <Grid />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MedicineDispense;
