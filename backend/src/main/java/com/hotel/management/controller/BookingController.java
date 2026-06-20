package com.hotel.management.controller;

import com.hotel.management.entity.Booking;
import com.hotel.management.entity.Room;
import com.hotel.management.repository.BookingRepository;
import com.hotel.management.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        // Fetch the managed room entity first
        if (booking.getRoom() != null && booking.getRoom().getId() != null) {
            Room room = roomRepository.findById(booking.getRoom().getId()).orElse(null);
            if (room != null) {
                booking.setRoom(room);
                // Update room status if booking is confirmed
                if ("Confirmed".equals(booking.getStatus()) || "Checked-In".equals(booking.getStatus())) {
                    room.setStatus("Occupied");
                    roomRepository.save(room);
                }
            }
        }
        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Long id, @RequestBody Booking bookingDetails) {
        return bookingRepository.findById(id)
                .map(booking -> {
                    booking.setStatus(bookingDetails.getStatus());
                    // Handle room status updates based on booking status
                    if ("Checked-Out".equals(bookingDetails.getStatus()) || "Cancelled".equals(bookingDetails.getStatus())) {
                        if (booking.getRoom() != null) {
                            Room room = booking.getRoom();
                            room.setStatus("Available");
                            roomRepository.save(room);
                        }
                    }
                    return ResponseEntity.ok(bookingRepository.save(booking));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
