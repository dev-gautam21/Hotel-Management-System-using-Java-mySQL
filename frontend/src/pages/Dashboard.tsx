import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Hotel as HotelIcon,
  AttachMoney as RevenueIcon,
  People as GuestIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';

const revenueData = [
  { name: 'Mon', total: 1200 },
  { name: 'Tue', total: 2100 },
  { name: 'Wed', total: 1800 },
  { name: 'Thu', total: 2400 },
  { name: 'Fri', total: 2800 },
  { name: 'Sat', total: 3200 },
  { name: 'Sun', total: 3800 },
];

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'guestName', headerName: 'Guest Name', width: 200 },
  { 
    field: 'room', 
    headerName: 'Room', 
    width: 130,
    valueGetter: (value, row) => row.room?.roomNumber || 'N/A'
  },
  { field: 'checkInDate', headerName: 'Check In', width: 130 },
  { field: 'checkOutDate', headerName: 'Check Out', width: 130 },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 130,
    renderCell: (params) => (
      <Box sx={{ 
        bgcolor: params.value === 'Confirmed' ? '#e0f2fe' : params.value === 'Checked-In' ? '#dcfce7' : '#fef3c7',
        color: params.value === 'Confirmed' ? '#0369a1' : params.value === 'Checked-In' ? '#15803d' : '#b45309',
        px: 2, py: 0.5, borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600
      }}>
        {params.value}
      </Box>
    )
  },
];

const StatCard = ({ title, value, icon, color }: any) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
      <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56, mr: 3 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography color="text.secondary" variant="subtitle2" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          {value !== null ? value : <CircularProgress size={24} />}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [stats, setStats] = useState<any>({
    totalBookings: null,
    availableRooms: null,
    currentGuests: null,
    revenueToday: null
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Connects to Spring Boot API
        const [statsRes, bookingsRes] = await Promise.all([
          axios.get('http://localhost:8080/api/dashboard/stats'),
          axios.get('http://localhost:8080/api/dashboard/recent-bookings')
        ]);
        setStats(statsRes.data);
        setRecentBookings(bookingsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data from API:', err);
        setError('Cannot connect to backend server. Is Spring Boot running?');
        setLoading(false);
      }
    };
    fetchData();
    // Refresh data every 3 seconds for real-time updates
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening at your hotel today.
        </Typography>
      </Box>

      {error && (
        <Box sx={{ bgcolor: '#fee2e2', color: '#b91c1c', p: 2, borderRadius: 2, mb: 4 }}>
          <Typography variant="body1" fontWeight={600}>{error}</Typography>
          <Typography variant="body2">Please ensure your MySQL database and Spring Boot server are running.</Typography>
        </Box>
      )}

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Bookings" value={stats.totalBookings} icon={<HotelIcon />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Available Rooms" value={stats.availableRooms} icon={<CheckIcon />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Current Guests" value={stats.currentGuests} icon={<GuestIcon />} color="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Revenue (Today)" value={stats.revenueToday ? `$${stats.revenueToday}` : null} icon={<RevenueIcon />} color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Revenue Overview
              </Typography>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                Recent Bookings
              </Typography>
              <Box sx={{ height: 350, width: '100%' }}>
                <DataGrid
                  rows={recentBookings}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 },
                    },
                  }}
                  pageSizeOptions={[5, 10]}
                  disableRowSelectionOnClick
                  loading={loading}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9' },
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f8fafc', borderBottom: 'none' },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
