-- Drop existing database aur fresh start
DROP DATABASE IF EXISTS hotel_management;
CREATE DATABASE hotel_management;
USE hotel_management;

-- Create rooms table
CREATE TABLE rooms (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(100),
  price DOUBLE,
  status VARCHAR(50)
);

-- Create bookings table
CREATE TABLE bookings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  guest_name VARCHAR(255),
  check_in_date DATE,
  check_out_date DATE,
  room_id BIGINT,
  status VARCHAR(50),
  CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- Insert sample data
INSERT INTO rooms (room_number, type, price, status) VALUES
('101','Single',49.99,'Available'),
('102','Double',79.99,'Occupied'),
('201','Deluxe',129.99,'Available');

INSERT INTO bookings (guest_name, check_in_date, check_out_date, room_id, status) VALUES
('Amit Sharma','2026-06-10','2026-06-12',2,'Checked In'),
('Ravi Kumar','2026-06-14','2026-06-16',3,'Booked');

-- Verify
SELECT * FROM rooms;
SELECT * FROM bookings;
