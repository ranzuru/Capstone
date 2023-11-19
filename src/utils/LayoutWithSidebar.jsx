// LayoutWithSidebar.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const LayoutWithSidebar = () => {
  return (
    <div className="flex min-h-screen">
      <div className="w-64">
        <Sidebar />
      </div>
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutWithSidebar;
