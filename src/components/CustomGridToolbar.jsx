import PropTypes from 'prop-types';
import { IconButton, Tooltip, Typography, Box } from '@mui/material';
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import GetAppRoundedIcon from '@mui/icons-material/GetAppRounded';

function CustomGridToolbar({ onExport, handleImport }) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <Tooltip title="Import">
        <label
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <input type="file" hidden onChange={handleImport} accept=".xlsx" />
          <IconButton
            component="span"
            style={{
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <FileUploadRoundedIcon color="primary" />
            <Box component="span" ml={1} display="flex" alignItems="center">
              <Typography color="primary" variant="body2" fontWeight="420">
                IMPORT
              </Typography>
            </Box>
          </IconButton>
        </label>
      </Tooltip>
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
  handleImport: PropTypes.func,
};

export default CustomGridToolbar;
