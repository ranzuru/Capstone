import { useState, useEffect } from 'react';
import { List } from '@mui/material';
import { sidebarItems } from '../components/SidebarItems';
import SidebarLink from '../components/SidebarLink';
import SidebarSubmenu from '../components/SidebarSubmenu';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function Sidebar() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openedSubmenu, setOpenedSubmenu] = useState('');
  const navigate = useNavigate();

  const { logout } = useAuth();

  const itemsToDisplay = sidebarItems;

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSubmenu = (submenuName) => {
    if (openedSubmenu === submenuName) {
      setOpenedSubmenu(''); // Collapse the submenu if it's already open
    } else {
      setOpenedSubmenu(submenuName); // Otherwise, set the opened submenu to the clicked submenu
    }
  };

  useEffect(() => {
    if (isSidebarCollapsed) {
      setOpenedSubmenu('');
    }
  }, [isSidebarCollapsed]);

  return (
    <div
      className={`h-screen overflow-y-auto bg-blue-700 text-white flex flex-col p-2 shadow-xl ${
        isSidebarCollapsed ? 'collapsed overflow-x-hidden' : ''
      }`}
      style={{
        width: isSidebarCollapsed ? 'w-18' : 'w-66',
      }}
    >
      <div
        className={`flex items-center p-2 ${
          isSidebarCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <button onClick={toggleSidebar}>
          <MenuOutlinedIcon />
        </button>
      </div>
      {!isSidebarCollapsed && (
        <>
          <div className="flex justify-center mb-2">
            {/* <img
              src={userImage}
              alt={userName}
              className="rounded-full h-24 w-24 object-cover"
            /> */}
          </div>
          <div className="text-center mb-6 text-white">
            <h1 className="text-lg font-semibold">Hello</h1>
          </div>
        </>
      )}
      <List>
        {itemsToDisplay.map((item) =>
          item.type === 'link' ? (
            <SidebarLink
              key={item.to}
              {...item}
              isSidebarCollapsed={isSidebarCollapsed}
              onClick={item.primary === 'Logout' ? handleLogout : undefined}
            />
          ) : (
            <SidebarSubmenu
              key={item.primary}
              {...item}
              isOpened={openedSubmenu === item.primary}
              toggleSubmenu={toggleSubmenu}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          )
        )}
      </List>
    </div>
  );
}

export default Sidebar;
