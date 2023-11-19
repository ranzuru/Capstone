import {
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SidebarLink from '../components/SidebarLink';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function SidebarSubmenu({
  primary,
  icon: IconComponent,
  submenuLinks,
  isOpened,
  toggleSubmenu,
  isSidebarCollapsed,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    toggleSubmenu(primary);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const constructTooltipContent = () => {
    let content = primary + '\n\n'; // main menu item
    submenuLinks.forEach((link) => {
      content += '- ' + link.primary + '\n';
    });
    return content.trim();
  };

  const tooltipStyles = {
    whiteSpace: 'pre-line',
  };

  return (
    <>
      <ListItem
        onClick={handleMenuOpen}
        className={`transition duration-200 hover:bg-blue-800 rounded-lg`}
      >
        <Tooltip
          title={constructTooltipContent()}
          arrow
          placement="right"
          style={tooltipStyles}
        >
          <ListItemIcon>
            {<IconComponent style={{ color: 'white' }} />}
          </ListItemIcon>
        </Tooltip>
        {!isSidebarCollapsed && <ListItemText primary={primary} />}
        {!isSidebarCollapsed && (isOpened ? <ExpandLess /> : <ExpandMore />)}
      </ListItem>
      {isSidebarCollapsed ? (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          className="ml-4"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {submenuLinks.map((link) => (
            <MenuItem
              key={link.to}
              onClick={handleMenuClose}
              component={Link}
              to={link.to}
            >
              {link.primary}
            </MenuItem>
          ))}
        </Menu>
      ) : (
        <Collapse in={isOpened} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {submenuLinks.map((link) => (
              <SidebarLink
                key={link.to}
                to={link.to}
                primary={link.primary}
                icon={link.icon}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

SidebarSubmenu.propTypes = {
  primary: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  submenuLinks: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      primary: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
    })
  ).isRequired,
  isOpened: PropTypes.bool.isRequired,
  toggleSubmenu: PropTypes.func.isRequired,
  isSidebarCollapsed: PropTypes.bool.isRequired,
};
export default SidebarSubmenu;
