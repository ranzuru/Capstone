import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfileSettings from '../components/ProfileSettings';

const Role = () => {
  return (
    <div className="flex flex-col">
      <div className="flex-grow overflow-hidden">
        <Header title="Account Settings" />
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="flex items-center justify-center w-full">
            <ProfileSettings />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Role;
