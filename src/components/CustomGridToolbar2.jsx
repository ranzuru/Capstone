import PropTypes from 'prop-types';
import { IconButton, Tooltip, Typography, Box } from '@mui/material';
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';

function CustomGridToolbar({ onExport }) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <Tooltip title="Export">
        <IconButton
          onClick={onExport}
          style={{ alignItems: 'center', display: 'flex' }}
        >
          <GetAppRoundedIcon color="primary" />
          <Box component="span" ml={1} display="flex" alignItems="center">
            <Typography color="primary" variant="body2" fontWeight="420">
              EXPORT
            </Typography>
          </Box>
        </IconButton>
      </Tooltip>
    </GridToolbarContainer>
  );
}

CustomGridToolbar.propTypes = {
  onExport: PropTypes.func,
};

export default CustomGridToolbar;
