import Header from '../components/Header';
import Footer from '../components/Footer';
import ManageUserGrid from '../components/Grid/ManageUserGrid';

const ManageUser = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Manage User" />
      <div className="flex-grow">
        <div className="p-4 flex flex-col h-full">
          <ManageUserGrid />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ManageUser;
