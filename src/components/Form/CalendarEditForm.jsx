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

const CalendarEditForm = ({
  open = false,
  onClose,
  onSave,
  onDelete,
  eventData = {
    title: '',
    startDate: null,
    endDate: null,
    description: '',
  }, // Default to empty object to avoid undefined
  selectedEvent = null, // New prop
}) => {
  const [EventTitle, setEventTitle] = useState(eventData.title);
  const [startDateTime, setStartDateTime] = useState(eventData.startDate);
  const [endDateTime, setEndDateTime] = useState(eventData.endDate);
  const [description, setDescription] = useState(eventData.description);
  const [isLongEvent, setIsLongEvent] = useState(!!eventData.endDate);

  const [titleError, setTitleError] = useState(false);
  const [startDateError, setStartDateError] = useState(false);
  const [endDateError, setEndDateError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEventTitle(eventData?.title || '');
    setStartDateTime(eventData?.startDate || null);
    setEndDateTime(eventData?.endDate || null);
    setDescription(eventData?.description || '');
    setIsLongEvent(!!eventData?.endDate);
  }, [eventData]);

  useEffect(() => {
    if (selectedEvent) {
      setEventTitle(selectedEvent.title || '');
      setStartDateTime(selectedEvent.start || null);
      setEndDateTime(selectedEvent.end || null);
      setDescription(selectedEvent.description || '');
      setIsLongEvent(!!selectedEvent?.end);
    }
  }, [selectedEvent]);

  const handleClose = () => {
    setTitleError(false);
    setStartDateError(false);
    setEndDateError(false);
    onClose();
  };

  const validateForm = () => {
    let errorFlag = false;
    const errors = {};

    if (!EventTitle) {
      errors.title = 'Title is required';
      errorFlag = true;
    }

    if (!startDateTime) {
      errors.start = 'Start Date & Time are required';
      errorFlag = true;
    }

    if (isLongEvent && !endDateTime) {
      errors.end = 'End Date & Time are required';
      errorFlag = true;
    } else if (isLongEvent && endDateTime < startDateTime) {
      errors.end = 'End Date & Time should be after Start Date & Time';
      errorFlag = true;
    }

    setTitleError(errors.title);
    setStartDateError(errors.start);
    setEndDateError(errors.end);
    return errorFlag;
  };

  const handleSave = async () => {
    if (validateForm()) return;

    setIsLoading(true);
    const endDate = isLongEvent ? endDateTime : null;
    await onSave(EventTitle, description, startDateTime, endDate); // Assuming onSave is an async function
    setIsLoading(false);
    handleClose();
  };

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogContent>
            <DialogContentText>Edit event details:</DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Event Title"
              fullWidth
              required
              value={EventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              error={titleError}
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
              disabled
              checked={isLongEvent}
              onChange={() => setIsLongEvent(!isLongEvent)}
              color="primary"
            />
            <div className="flex flex-col space-y-4">
              <DateTimePicker
                label="Start Date & Time"
                value={startDateTime}
                required
                onChange={(newDateTime) => setStartDateTime(newDateTime)}
                viewRenderers={{
                  hours: null,
                  minutes: null,
                  seconds: null,
                }}
                error={startDateError}
                helperText={startDateError ? 'Date and time are required' : ''}
              />
              {isLongEvent && (
                <DateTimePicker
                  label="End Date & Time"
                  value={endDateTime}
                  required
                  onChange={(newDateTime) => setEndDateTime(newDateTime)}
                  viewRenderers={{
                    hours: null,
                    minutes: null,
                    seconds: null,
                  }}
                  error={endDateError}
                  helperText={endDateError ? 'Date and time are required' : ''}
                />
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button variant="outlined" onClick={onDelete} color="error">
              Delete
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </>
  );
};
CalendarEditForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  eventData: PropTypes.shape({
    title: PropTypes.string,
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    description: PropTypes.string,
  }),
  selectedEvent: PropTypes.object,
};
export default CalendarEditForm;
