package com.hotel.management.controller;

import com.hotel.management.entity.Booking;
import com.hotel.management.entity.Room;
import com.hotel.management.repository.BookingRepository;
import com.hotel.management.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        List<Room> rooms = roomRepository.findAll();
        List<Booking> bookings = bookingRepository.findAll();

        long totalBookings = bookings.size();
        long availableRooms = rooms.stream().filter(r -> "Available".equals(r.getStatus())).count();
        long currentGuests = bookings.stream().filter(b -> "Checked-In".equals(b.getStatus())).count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBookings", totalBookings);
        stats.put("availableRooms", availableRooms);
        stats.put("currentGuests", currentGuests);
        stats.put("revenueToday", 4250); // Hardcoded for demo
        
        return stats;
    }

    @GetMapping("/recent-bookings")
    public List<Booking> getRecentBookings() {
        return bookingRepository.findAll();
    }
}
