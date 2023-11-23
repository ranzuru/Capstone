// LayoutWithSidebar.jsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const LayoutWithSidebar = () => {
  return (
    <div className="flex h-screen">
      <div className="w-64 overflow-y-auto">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default LayoutWithSidebar;
