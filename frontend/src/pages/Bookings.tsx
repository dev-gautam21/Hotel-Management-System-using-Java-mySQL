import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newBooking, setNewBooking] = useState({ guestName: '', room: { id: '' }, checkInDate: '', checkOutDate: '', status: 'Pending' });

  const fetchData = async () => {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/bookings'),
        axios.get('http://localhost:8080/api/rooms')
      ]);
      setBookings(bookingsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 3 seconds
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:8080/api/bookings', newBooking);
      setOpenDialog(false);
      setNewBooking({ guestName: '', room: { id: '' }, checkInDate: '', checkOutDate: '', status: 'Pending' });
      fetchData();
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await axios.put(`http://localhost:8080/api/bookings/${id}`, { status });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'guestName', headerName: 'Guest Name', width: 200 },
    { 
      field: 'room', 
      headerName: 'Room',
      width: 150,
      valueGetter: (value, row) => row.room?.roomNumber || 'N/A'
    },
    { field: 'checkInDate', headerName: 'Check In', width: 130 },
    { field: 'checkOutDate', headerName: 'Check Out', width: 130 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 200,
      renderCell: (params) => (
        <TextField
          select
          size="small"
          value={params.value}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          sx={{ width: '100%', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
        >
          {['Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'].map(option => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Bookings Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpenDialog(true)}
        >
          New Booking
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%', p: 2, borderRadius: 2 }}>
        <DataGrid
          rows={bookings}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { page: 0, pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25]}
          disableRowSelectionOnClick
          loading={loading}
          sx={{ border: 'none' }}
        />
      </Paper>

      {/* Add Booking Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Booking</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField 
              label="Guest Name" 
              value={newBooking.guestName}
              onChange={(e) => setNewBooking({...newBooking, guestName: e.target.value})}
              fullWidth 
            />
            <TextField 
              select 
              label="Assign Room" 
              value={newBooking.room.id}
              onChange={(e) => setNewBooking({...newBooking, room: { id: e.target.value }})}
              fullWidth
            >
              {rooms.map(room => (
                <MenuItem key={room.id} value={room.id}>
                  Room {room.roomNumber} ({room.type}) - {room.status}
                </MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Check In Date" 
              type="date"
              value={newBooking.checkInDate}
              onChange={(e) => setNewBooking({...newBooking, checkInDate: e.target.value})}
              InputLabelProps={{ shrink: true }}
              fullWidth 
            />
            <TextField 
              label="Check Out Date" 
              type="date"
              value={newBooking.checkOutDate}
              onChange={(e) => setNewBooking({...newBooking, checkOutDate: e.target.value})}
              InputLabelProps={{ shrink: true }}
              fullWidth 
            />
            <TextField 
              select 
              label="Initial Status" 
              value={newBooking.status}
              onChange={(e) => setNewBooking({...newBooking, status: e.target.value})}
              fullWidth
            >
              {['Pending', 'Confirmed'].map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained">Create Booking</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
