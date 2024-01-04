import { useState, useEffect } from 'react';
import { List } from '@mui/material';
import { sidebarItems } from '../components/SidebarItems';
import SidebarLink from '../components/SidebarLink';
import SidebarSubmenu from '../components/SidebarSubmenu';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import schoolLogo from '/assets/DonjuanTransparent.webp';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

function Sidebar() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openedSubmenu, setOpenedSubmenu] = useState('');
  const navigate = useNavigate();

  // bypass login - start
  // const { user, logout } = useAuth();

  // const navigationScopes = user?.role?.navigationScopes || [];
  // const logoutItem = sidebarItems.find((item) => item.primary === 'Logout');

  // const itemsToDisplay = sidebarItems
  //   .filter((item) => {
  //     if (item.type === 'link' && item.primary !== 'Logout') {
  //       return navigationScopes.includes(item.primary);
  //     } else if (item.type === 'submenu') {
  //       item.submenuLinks = item.submenuLinks.filter((subItem) =>
  //         navigationScopes.includes(subItem.primary)
  //       );
  //       return item.submenuLinks.length > 0;
  //     }
  //     return false;
  //   })
  //   .concat(logoutItem ? [logoutItem] : []); // Ensure logout is always included
  
  // bypass login - end
  // remove comment tag below
  const itemsToDisplay = sidebarItems;

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = async () => {
    try {
      // await logout();
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
        width: isSidebarCollapsed ? 'w-18' : 'w-64',
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
          <div className="flex flex-col items-center mb-2">
            <img
              src={schoolLogo}
              alt="School Logo"
              style={{ width: '100px', height: '100px' }}
            />
            <div className="text-center text-white mt-2">
              <h5 className="text-sm font-semibold">
                DON JUAN DELA CRUZ CENTRAL ELEMENTARY SCHOOL
              </h5>
            </div>
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