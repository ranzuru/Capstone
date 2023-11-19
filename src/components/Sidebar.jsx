import { useState, useEffect } from 'react';

import { List } from '@mui/material';
import { sidebarItems } from '../components/SidebarItems';

import SidebarLink from '../components/SidebarLink';
import SidebarSubmenu from '../components/SidebarSubmenu';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';


function Sidebar() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openedSubmenu, setOpenedSubmenu] = useState('');
  // const navigate = useNavigate();

 

  const itemsToDisplay = sidebarItems;



  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = async () => {
  
  };

  const toggleSubmenu = (submenuName) => {
    setOpenedSubmenu(openedSubmenu === submenuName ? '' : submenuName);
  };

  useEffect(() => {
    if (isSidebarCollapsed) {
      setOpenedSubmenu('');
    }
  }, [isSidebarCollapsed]);

  return (
    <div
      className={`h-screen overflow-y-auto bg-blue-700 text-white flex flex-col p-2 shadow-xl ${
        isSidebarCollapsed ? 'w-18' : 'w-66'
      }`}
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
