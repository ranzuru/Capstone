import Typography from '@mui/material/Typography';

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="h-12 flex items-center justify-center">
      <Typography
        variant="body1"
        className="text-gray-500"
        sx={{
          fontSize: { xs: '0.875rem', sm: '1rem' },
          pl: 2,
          pr: 2,
        }}
      >
        © {currentYear} Don Juan Dela Cruz Central Elementary School. All
        rights reserved.
      </Typography>
    </div>
  );
}

export default Footer;
