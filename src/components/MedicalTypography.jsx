import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

const MedicalTypography = ({ children, variant, sx }) => {
  return (
    <Typography
      variant={variant}
      sx={{
        fontSize: { xs: '.8rem', sm: '.8rem', md: '1.2rem' },
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
};

MedicalTypography.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'subtitle1',
    'subtitle2',
    'body1',
    'body2',
    'caption',
    'button',
    'overline',
  ]),
  sx: PropTypes.object,
};

MedicalTypography.defaultProps = {
  variant: 'h6',
  sx: {},
};

export default MedicalTypography;
