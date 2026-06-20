import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [newRoom, setNewRoom] = useState({ roomNumber: '', type: 'Standard', price: '', status: 'Available' });

  const fetchRooms = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // Refresh data every 3 seconds
    const interval = setInterval(fetchRooms, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:8080/api/rooms', newRoom);
      setOpenDialog(false);
      setNewRoom({ roomNumber: '', type: 'Standard', price: '', status: 'Available' });
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'roomNumber', headerName: 'Room Number', width: 150 },
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'price', headerName: 'Price ($)', width: 130 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Box sx={{ 
          bgcolor: params.value === 'Available' ? '#dcfce7' : params.value === 'Occupied' ? '#fee2e2' : '#fef3c7',
          color: params.value === 'Available' ? '#15803d' : params.value === 'Occupied' ? '#b91c1c' : '#b45309',
          px: 2, py: 0.5, borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600
        }}>
          {params.value}
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Rooms Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setOpenDialog(true)}
        >
          Add Room
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%', p: 2, borderRadius: 2 }}>
        <DataGrid
          rows={rooms}
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

      {/* Add Room Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Room</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField 
              label="Room Number" 
              value={newRoom.roomNumber}
              onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
              fullWidth 
            />
            <TextField 
              select 
              label="Room Type" 
              value={newRoom.type}
              onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
              fullWidth
            >
              {['Standard', 'Deluxe', 'Suite'].map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Price" 
              type="number"
              value={newRoom.price}
              onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
              fullWidth 
            />
            <TextField 
              select 
              label="Status" 
              value={newRoom.status}
              onChange={(e) => setNewRoom({...newRoom, status: e.target.value})}
              fullWidth
            >
              {['Available', 'Maintenance'].map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save Room</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
