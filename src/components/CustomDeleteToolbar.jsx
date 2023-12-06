import { GridToolbarContainer } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import PropTypes from 'prop-types';

const CustomDeleteToolbar = ({ selectedRows, handleBulkDelete }) => {
  if (selectedRows.length < 2) {
    return null;
  }

  return (
    <GridToolbarContainer>
      <Tooltip title="Delete Selected">
        <IconButton onClick={handleBulkDelete} color="primary">
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </GridToolbarContainer>
  );
};

CustomDeleteToolbar.propTypes = {
  selectedRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleBulkDelete: PropTypes.func.isRequired,
};

export default CustomDeleteToolbar;
