import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Switch from '@mui/material/Switch';
import PropTypes from 'prop-types';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // Import from @mui/x-date-pickers
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const CalendarCreateForm = ({
  open = false,
  onClose,
  onSave,
  selectedDateTime,
}) => {
  const [EventTitle, setEventTitle] = useState('');
  const [startDateTime, setStartDateTime] = useState(selectedDateTime);
  const [endDateTime, setEndDateTime] = useState(selectedDateTime);
  const [description, setDescription] = useState('');
  const [isLongEvent, setIsLongEvent] = useState(false);

  const [titleError, setTitleError] = useState(false);
  const [startDateError, setStartDateError] = useState(false);
  const [endDateError, setEndDateError] = useState(false);

  useEffect(() => {
    setStartDateTime(selectedDateTime);
    setEndDateTime(selectedDateTime);
  }, [selectedDateTime]);

  const handleClose = () => {
    setTitleError(false);
    setStartDateError(false);
    setEndDateError(false);

    setIsLongEvent(false);
    onClose();
    setEventTitle('');
    setStartDateTime(null);
    setEndDateTime(null);
    setDescription('');
  };

  const handleSave = () => {
    if (!EventTitle) {
      setTitleError(true);
      return;
    }

    if (!startDateTime) {
      setStartDateError(true);
      return;
    }
    if (!isLongEvent && !endDateTime) {
      setEndDateError(true);
      return;
    }

    const endDate = isLongEvent ? endDateTime : false; // Set endDate for long events or false for single-day events
    onSave(EventTitle, description, startDateTime, endDate);

    setTitleError(false);
    setEventTitle('');
    setStartDateTime(null);
    setDescription('');
    if (isLongEvent) {
      setEndDateTime(null);
    }
    onClose();
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add Event</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter event title:</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Event Title"
          fullWidth
          required
          value={EventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          error={titleError} // Add error prop based on validation criteria
          helperText={titleError ? 'Title is required' : ''}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <DialogContentText>Long Events?</DialogContentText>
        <Switch
          checked={isLongEvent}
          onChange={() => setIsLongEvent(!isLongEvent)}
          color="primary"
        />
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="flex flex-col space-y-4">
            {isLongEvent ? (
              <>
                <DateTimePicker
                  label="Start Date & Time"
                  value={startDateTime}
                  onChange={(newDateTime) => setStartDateTime(newDateTime)}
                  timeZone="Asia/Taipei"
                  required
                  viewRenderers={{
                    hours: null,
                    minutes: null,
                    seconds: null,
                  }}
                  error={startDateError} // Add error prop based on validation criteria
                  helperText={
                    startDateError ? 'Date and time are required' : ''
                  }
                />
                <DateTimePicker
                  label="End Date & Time"
                  value={endDateTime}
                  timeZone="Asia/Taipei"
                  required
                  onChange={(newDateTime) => setEndDateTime(newDateTime)}
                  viewRenderers={{
                    hours: null,
                    minutes: null,
                    seconds: null,
                  }}
                  error={endDateError} // Add error prop based on validation criteria
                  helperText={endDateError ? 'Date and time are required' : ''}
                />
              </>
            ) : (
              <DateTimePicker
                label="Start Date & Time"
                value={startDateTime}
                timeZone="Asia/Taipei"
                required
                onChange={(newDateTime) => setStartDateTime(newDateTime)}
                viewRenderers={{
                  hours: null,
                  minutes: null,
                  seconds: null,
                }}
                error={startDateError} // Add error prop based on validation criteria
                helperText={startDateError ? 'Date and time are required' : ''}
              />
            )}
          </div>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CalendarCreateForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  selectedDateTime: PropTypes.instanceOf(Date),
};

export default CalendarCreateForm;
