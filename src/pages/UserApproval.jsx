import Header from '../components/Header';
import Footer from '../components/Footer';
import UserApprovalGrid from '../components/Grid/UserApprovalGrid';

const UserApproval = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {' '}
      {/* Use min-h-screen to fill the screen height */}
      <Header title="User Approval" />
      <div className="flex-grow">
        {' '}
        {/* flex-grow to take available space */}
        <div className="p-4 flex flex-col h-full">
          {' '}
          {/* Remove overflow-hidden */}
          <UserApprovalGrid />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserApproval;
