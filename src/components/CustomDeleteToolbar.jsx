import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from 'prop-types';

const CustomDeleteToolbar = ({ selectedRows, handleBulkDelete }) => {
  if (selectedRows.length < 2) {
    return null;
  }

  return (
    <Tooltip title="Delete Selected">
      <IconButton
        onClick={handleBulkDelete}
        style={{ alignItems: 'center', display: 'flex' }}
      >
        <DeleteIcon color="primary" />
        <Box component="span" ml={1} display="flex" alignItems="center">
          <Typography color="primary" variant="body2" fontWeight="420">
            BULK DELETE
          </Typography>
        </Box>
      </IconButton>
    </Tooltip>
  );
};

CustomDeleteToolbar.propTypes = {
  selectedRows: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleBulkDelete: PropTypes.func.isRequired,
};

export default CustomDeleteToolbar;
