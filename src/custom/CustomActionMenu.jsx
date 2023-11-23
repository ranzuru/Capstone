import { useState } from 'react';
import PropTypes from 'prop-types';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { MenuItem, Tooltip, Menu, IconButton } from '@mui/material';

const ActionMenu = ({ onEdit, onDelete, onView, onArchive }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Tooltip title="More actions">
        <IconButton
          aria-label="more"
          aria-controls="long-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreHorizIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {onView && (
          <MenuItem
            onClick={() => {
              onView();
              handleClose();
            }}
          >
            View
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem
            onClick={() => {
              onEdit();
              handleClose();
            }}
          >
            Edit
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem
            onClick={() => {
              onDelete();
              handleClose();
            }}
          >
            Delete
          </MenuItem>
        )}
        {onArchive && (
          <MenuItem
            onClick={() => {
              onArchive();
              handleClose();
            }}
          >
            Archive
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

ActionMenu.propTypes = {
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  onArchive: PropTypes.func, // Added prop type for archive
};

export default ActionMenu;
