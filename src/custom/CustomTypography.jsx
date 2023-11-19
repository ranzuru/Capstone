import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

const CustomTypography = ({ variant, text, className, ...rest }) => {
  return (
    <Typography variant={variant} className={className} {...rest}>
      {text}
    </Typography>
  );
};

CustomTypography.propTypes = {
  variant: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
};

export default CustomTypography;
