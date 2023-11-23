import { useState, useRef, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import CalendarCreateForm from '../components/Form/CalendarCreateForm';
import CalendarEditForm from '../components/Form/CalendarEditForm.jsx';
import { addHours } from 'date-fns';
import axiosInstance from '../config/axios-instance.js';

const Calendar = () => {
  const [calendarCreateFormOpen, setCalendarCreateFormOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const calendarRef = useRef(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [calendarEditFormOpen, setCalendarEditFormOpen] = useState(false); // Step 2: Control the form display
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDateClick = async (selected) => {
    await addEventToCalendar();
    setSelectedDateTime(selected.start);
    setCalendarCreateFormOpen(true);
  };

  useEffect(() => {
    addEventToCalendar();
  }, []);

  const handleOpenDeleteDialog = () => {
    setCalendarEditFormOpen(true);
    setDeleteDialogOpen(true);
  };

  const handleEventSave = async (
    title,
    description,
    startDateTime,
    endDateTime
  ) => {
    try {
      // If endDateTime is not provided, set it to 6 hours after startDateTime
      if (!endDateTime) {
        endDateTime = addHours(startDateTime, 6);
      }

      // Create an object with the event data
      const eventData = {
        title,
        description,
        startDateTime,
        endDateTime,
      };

      // Make a POST request to your API endpoint using Axios
      await axiosInstance.post('/events/createEvent', eventData);

      // Add the event to FullCalendar using the addEventToCalendar function
      setEvents([...events, eventData]);
      addEventToCalendar();
      // Close the dialog and clear the selected date
      setCalendarCreateFormOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
      // Handle any network or other errors
    }
  };

  const addEventToCalendar = async () => {
    try {
      const response = await axiosInstance.get('/events/fetchEvent');

      // Accessing the correct fields from MongoDB document
      const formattedEvents = response.data.map((event) => ({
        id: event._id,
        title: event.title,
        description: event.description,
        start: new Date(event.startDateTime), // Note the changed field name
        end: new Date(event.endDateTime), // Note the changed field name
      }));

      setEvents(formattedEvents);

      if (calendarRef.current) {
        calendarRef.current.getApi().rerenderEvents(); // Re-render events
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleEventClick = (selected) => {
    setSelectedEvent(selected.event);
    setCalendarEditFormOpen(true);
  };

  const handleEventEditSave = async (
    title,
    description,
    startDateTime,
    endDateTime
  ) => {
    try {
      if (!endDateTime) {
        endDateTime = addHours(startDateTime, 6);
      }

      const eventData = { title, description, startDateTime, endDateTime };

      await axiosInstance.put(
        `/events/updateEvent/${selectedEvent.id}`,
        eventData
      );

      const updatedEvents = events.map((event) => {
        if (event.id === selectedEvent.id) {
          return { ...event, ...eventData };
        }
        return event;
      });
      setEvents(updatedEvents);
      // Force re-render of the calendar
      if (calendarRef.current) {
        calendarRef.current.getApi().rerenderEvents();
      }
      // Update local state, or refetch events here...
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleEventDelete = async (eventId) => {
    try {
      // API Call
      await axiosInstance.delete(`/events/deleteEvent/${selectedEvent.id}`);

      // Update local state
      const updatedEvents = events.filter((event) => event.id !== eventId);
      setEvents(updatedEvents);

      // Use rerenderEvents like in handleEventEditSave
      if (calendarRef.current) {
        calendarRef.current.getApi().rerenderEvents();
      }

      // Close the edit form
      setDeleteDialogOpen(false);
      setCalendarEditFormOpen(false);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <>
      <div className="h-full">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          headerToolbar={{
            left: 'prev,next,today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth',
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          select={handleDateClick}
          eventClick={handleEventClick}
          events={events}
          height="100%"
        />
      </div>
      <CalendarCreateForm
        open={calendarCreateFormOpen}
        onClose={() => {
          setSelectedDateTime(null); // Clear the selected date and time
          setCalendarCreateFormOpen(false);
        }}
        onSave={handleEventSave} // Create this function to handle event saving
        addEventToCalendar={addEventToCalendar}
        selectedDateTime={selectedDateTime}
      />
      <CalendarEditForm // Step 5: Render the CalendarEditForm
        open={calendarEditFormOpen}
        onClose={() => {
          setSelectedEvent(null); // Clear the selected event
          setCalendarEditFormOpen(false);
        }}
        onSave={handleEventEditSave}
        onDelete={handleOpenDeleteDialog}
        eventData={{
          description:
            selectedEvent && selectedEvent._def
              ? selectedEvent._def.extendedProps.description
              : '',
          title: selectedEvent ? selectedEvent.title : '',
          startDate:
            selectedEvent && selectedEvent.start
              ? new Date(selectedEvent.start)
              : null,
          endDate:
            selectedEvent && selectedEvent.end
              ? new Date(selectedEvent.end)
              : null,
        }}
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleEventDelete(selectedEvent.id)}
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Calendar;
