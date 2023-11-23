import Header from '../components/Header';
import Footer from '../components/Footer';
import RoleGrid from '../components/Grid/RoleGrid';

const Role = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Manage Role" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <RoleGrid />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Role;
