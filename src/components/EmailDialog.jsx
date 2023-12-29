import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';
import PropTypes from 'prop-types';

const EmailDialog = ({ open, handleClose, onEmailSubmit }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);

  const validateEmail = (email) => {
    const re =
      /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  };

  const handleEmailChange = (event) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
    setEmailError(!validateEmail(newEmail));
  };

  const handleSubmit = () => {
    if (validateEmail(email)) {
      onEmailSubmit(email);
      setEmail('');
      handleClose();
    } else {
      setEmailError(true);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>Reset Password</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="email"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={handleEmailChange}
          error={emailError}
          helperText={emailError ? 'Please enter a valid email' : ''}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={emailError}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

EmailDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  onEmailSubmit: PropTypes.func.isRequired,
};

export default EmailDialog;
