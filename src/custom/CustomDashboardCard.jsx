import PropTypes from 'prop-types';
import { Card, CardContent, Typography, Paper } from '@mui/material';

const DashboardCard = ({ icon: Icon, number, title, subtitle }) => {
  return (
    <Paper elevation={5}>
      <Card className="h-44">
        <CardContent className="pl-5 pt-3 pb-1 relative">
          <div className="flex items-center">
            {Icon && (
              <Icon sx={{ fontSize: 50, width: 50, height: 50 }} /> // Use sx prop for styling
            )}
            <div className="ml-10 flex flex-col justify-center">
              <Typography variant="h3" component="div">
                {number}
              </Typography>
            </div>
          </div>
          <div className="pt-4 flex flex-col items-start">
            <Typography gutterBottom variant="h6" component="div">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </div>
        </CardContent>
      </Card>
    </Paper>
  );
};

DashboardCard.propTypes = {
  icon: PropTypes.elementType, // Assuming icon is a string URL
  number: PropTypes.string, // or PropTypes.string if it's textual
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

export default DashboardCard;
