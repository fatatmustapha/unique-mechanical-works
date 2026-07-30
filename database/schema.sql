-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 30, 2026 at 03:36 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `unique_mechanical_works`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `admin_id` int(10) UNSIGNED NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `branch_id` int(10) UNSIGNED DEFAULT NULL,
  `role` enum('super_admin','branch_admin') NOT NULL DEFAULT 'branch_admin',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `appointment_id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `service_id` int(10) UNSIGNED NOT NULL,
  `branch_id` int(10) UNSIGNED NOT NULL,
  `scheduled_at` datetime NOT NULL,
  `vehicle_make` varchar(50) DEFAULT NULL,
  `vehicle_model` varchar(50) DEFAULT NULL,
  `vehicle_year` year(4) DEFAULT NULL,
  `vehicle_plate_number` varchar(30) DEFAULT NULL,
  `customer_notes` text DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  `cancelled_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `branch_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `whatsapp_number` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `opening_hours` varchar(255) DEFAULT NULL,
  `google_maps_url` varchar(500) DEFAULT NULL,
  `opened_year` year(4) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `branch_services`
--

CREATE TABLE `branch_services` (
  `branch_service_id` int(10) UNSIGNED NOT NULL,
  `branch_id` int(10) UNSIGNED NOT NULL,
  `service_id` int(10) UNSIGNED NOT NULL,
  `estimated_price_min` decimal(12,2) DEFAULT NULL,
  `estimated_price_max` decimal(12,2) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `car_id` int(10) UNSIGNED NOT NULL,
  `reference_number` varchar(40) NOT NULL,
  `slug` varchar(180) NOT NULL,
  `vin` varchar(50) DEFAULT NULL,
  `created_by_admin_id` int(10) UNSIGNED DEFAULT NULL,
  `submission_id` int(10) UNSIGNED DEFAULT NULL,
  `branch_id` int(10) UNSIGNED NOT NULL,
  `make` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `year` year(4) DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `mileage` int(10) UNSIGNED DEFAULT NULL,
  `condition_type` enum('New','Nigerian Used','Foreign Used') DEFAULT NULL,
  `transmission` enum('Automatic','Manual') DEFAULT NULL,
  `fuel_type` enum('Petrol','Diesel','Hybrid','Electric') DEFAULT NULL,
  `description` text DEFAULT NULL,
  `sale_status` enum('available','reserved','sold') NOT NULL DEFAULT 'available',
  `publication_status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `color_exterior` varchar(50) DEFAULT NULL,
  `color_interior` varchar(50) DEFAULT NULL,
  `engine_size` varchar(30) DEFAULT NULL,
  `horsepower` int(10) UNSIGNED DEFAULT NULL,
  `body_type` varchar(50) DEFAULT NULL,
  `num_doors` tinyint(3) UNSIGNED DEFAULT NULL,
  `num_seats` tinyint(3) UNSIGNED DEFAULT NULL,
  `drivetrain` enum('FWD','RWD','AWD','4WD') DEFAULT NULL,
  `registration_status` varchar(100) DEFAULT NULL,
  `num_previous_owners` int(10) UNSIGNED DEFAULT NULL,
  `import_status` varchar(100) DEFAULT NULL,
  `negotiable` tinyint(1) NOT NULL DEFAULT 1,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `warranty_status` varchar(150) DEFAULT NULL,
  `views_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `published_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `car_images`
--

CREATE TABLE `car_images` (
  `image_id` int(10) UNSIGNED NOT NULL,
  `car_id` int(10) UNSIGNED NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `image_label` enum('front','back','side','interior','engine','other') NOT NULL DEFAULT 'other',
  `alt_text` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `car_sale_submissions`
--

CREATE TABLE `car_sale_submissions` (
  `submission_id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `branch_id` int(10) UNSIGNED NOT NULL,
  `make` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `year` year(4) DEFAULT NULL,
  `mileage` int(10) UNSIGNED DEFAULT NULL,
  `condition_type` enum('New','Nigerian Used','Foreign Used') DEFAULT NULL,
  `transmission` enum('Automatic','Manual') DEFAULT NULL,
  `fuel_type` enum('Petrol','Diesel','Hybrid','Electric') DEFAULT NULL,
  `color_exterior` varchar(50) DEFAULT NULL,
  `expected_price` decimal(12,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `contact_phone` varchar(30) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by_admin_id` int(10) UNSIGNED DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `approved_car_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `car_submission_images`
--

CREATE TABLE `car_submission_images` (
  `submission_image_id` int(10) UNSIGNED NOT NULL,
  `submission_id` int(10) UNSIGNED NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(10) UNSIGNED NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `preferred_branch_id` int(10) UNSIGNED DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `customer_id` int(10) UNSIGNED NOT NULL,
  `car_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `invoice_id` int(10) UNSIGNED NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `appointment_id` int(10) UNSIGNED DEFAULT NULL,
  `car_id` int(10) UNSIGNED DEFAULT NULL,
  `created_by_admin_id` int(10) UNSIGNED NOT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `amount_paid` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` char(3) NOT NULL DEFAULT 'NGN',
  `payment_status` enum('pending','partial','paid') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `issued_at` datetime NOT NULL DEFAULT current_timestamp(),
  `due_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `invoice_item_id` int(10) UNSIGNED NOT NULL,
  `invoice_id` int(10) UNSIGNED NOT NULL,
  `description` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 1.00,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `line_total` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `short_description` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `testimonials`
--

CREATE TABLE `testimonials` (
  `testimonial_id` int(10) UNSIGNED NOT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL,
  `branch_id` int(10) UNSIGNED DEFAULT NULL,
  `service_id` int(10) UNSIGNED DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED NOT NULL,
  `comment` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by_admin_id` int(10) UNSIGNED DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `uq_admins_email` (`email`),
  ADD KEY `idx_admins_branch` (`branch_id`),
  ADD KEY `idx_admins_role_active` (`role`,`is_active`);

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `idx_appointments_customer` (`customer_id`,`scheduled_at`),
  ADD KEY `idx_appointments_branch_status` (`branch_id`,`status`,`scheduled_at`),
  ADD KEY `idx_appointments_service` (`service_id`,`scheduled_at`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`branch_id`),
  ADD UNIQUE KEY `uq_branches_name` (`name`),
  ADD KEY `idx_branches_city` (`city`),
  ADD KEY `idx_branches_active` (`is_active`);

--
-- Indexes for table `branch_services`
--
ALTER TABLE `branch_services`
  ADD PRIMARY KEY (`branch_service_id`),
  ADD UNIQUE KEY `uq_branch_services` (`branch_id`,`service_id`),
  ADD KEY `idx_branch_services_branch` (`branch_id`,`is_available`),
  ADD KEY `idx_branch_services_service` (`service_id`,`is_available`);

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`car_id`),
  ADD UNIQUE KEY `uq_cars_reference_number` (`reference_number`),
  ADD UNIQUE KEY `uq_cars_slug` (`slug`),
  ADD UNIQUE KEY `uq_cars_vin` (`vin`),
  ADD UNIQUE KEY `uq_cars_submission` (`submission_id`),
  ADD KEY `idx_cars_admin` (`created_by_admin_id`),
  ADD KEY `idx_cars_branch` (`branch_id`),
  ADD KEY `idx_cars_public_status` (`publication_status`,`sale_status`),
  ADD KEY `idx_cars_featured` (`is_featured`,`publication_status`),
  ADD KEY `idx_cars_make_model` (`make`,`model`),
  ADD KEY `idx_cars_year` (`year`),
  ADD KEY `idx_cars_price` (`price`),
  ADD KEY `idx_cars_marketplace` (`branch_id`,`publication_status`,`sale_status`,`make`,`year`,`price`);

--
-- Indexes for table `car_images`
--
ALTER TABLE `car_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `idx_car_images_order` (`car_id`,`sort_order`),
  ADD KEY `idx_car_images_primary` (`car_id`,`is_primary`);

--
-- Indexes for table `car_sale_submissions`
--
ALTER TABLE `car_sale_submissions`
  ADD PRIMARY KEY (`submission_id`),
  ADD UNIQUE KEY `uq_submission_approved_car` (`approved_car_id`),
  ADD KEY `idx_submissions_customer` (`customer_id`,`created_at`),
  ADD KEY `idx_submissions_branch` (`branch_id`,`status`),
  ADD KEY `idx_submissions_status` (`status`,`created_at`),
  ADD KEY `idx_submissions_reviewer` (`reviewed_by_admin_id`);

--
-- Indexes for table `car_submission_images`
--
ALTER TABLE `car_submission_images`
  ADD PRIMARY KEY (`submission_image_id`),
  ADD KEY `idx_submission_images_order` (`submission_id`,`sort_order`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `uq_customers_email` (`email`),
  ADD KEY `idx_customers_branch` (`preferred_branch_id`),
  ADD KEY `idx_customers_active` (`is_active`),
  ADD KEY `idx_customers_name` (`last_name`,`first_name`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`customer_id`,`car_id`),
  ADD KEY `idx_favorites_car` (`car_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`invoice_id`),
  ADD UNIQUE KEY `uq_invoices_number` (`invoice_number`),
  ADD KEY `idx_invoices_customer` (`customer_id`,`payment_status`,`issued_at`),
  ADD KEY `idx_invoices_appointment` (`appointment_id`),
  ADD KEY `idx_invoices_car` (`car_id`),
  ADD KEY `idx_invoices_admin` (`created_by_admin_id`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`invoice_item_id`),
  ADD KEY `idx_invoice_items_invoice` (`invoice_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`),
  ADD UNIQUE KEY `uq_services_name` (`name`),
  ADD UNIQUE KEY `uq_services_slug` (`slug`),
  ADD KEY `idx_services_active_order` (`is_active`,`display_order`),
  ADD KEY `idx_services_category` (`category`);

--
-- Indexes for table `testimonials`
--
ALTER TABLE `testimonials`
  ADD PRIMARY KEY (`testimonial_id`),
  ADD KEY `idx_testimonials_customer` (`customer_id`),
  ADD KEY `idx_testimonials_branch` (`branch_id`),
  ADD KEY `idx_testimonials_service` (`service_id`),
  ADD KEY `idx_testimonials_status` (`status`,`created_at`),
  ADD KEY `fk_testimonials_reviewer` (`reviewed_by_admin_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `admin_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `appointment_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `branch_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `branch_services`
--
ALTER TABLE `branch_services`
  MODIFY `branch_service_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cars`
--
ALTER TABLE `cars`
  MODIFY `car_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `car_images`
--
ALTER TABLE `car_images`
  MODIFY `image_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `car_sale_submissions`
--
ALTER TABLE `car_sale_submissions`
  MODIFY `submission_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `car_submission_images`
--
ALTER TABLE `car_submission_images`
  MODIFY `submission_image_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `invoice_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `invoice_item_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `testimonials`
--
ALTER TABLE `testimonials`
  MODIFY `testimonial_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `fk_admins_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `fk_appointments_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_appointments_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_appointments_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON UPDATE CASCADE;

--
-- Constraints for table `branch_services`
--
ALTER TABLE `branch_services`
  ADD CONSTRAINT `fk_branch_services_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_branch_services_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON UPDATE CASCADE;

--
-- Constraints for table `cars`
--
ALTER TABLE `cars`
  ADD CONSTRAINT `fk_cars_admin` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins` (`admin_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cars_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_cars_submission` FOREIGN KEY (`submission_id`) REFERENCES `car_sale_submissions` (`submission_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `car_images`
--
ALTER TABLE `car_images`
  ADD CONSTRAINT `fk_car_images_car` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `car_sale_submissions`
--
ALTER TABLE `car_sale_submissions`
  ADD CONSTRAINT `fk_submissions_approved_car` FOREIGN KEY (`approved_car_id`) REFERENCES `cars` (`car_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_submissions_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_submissions_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_submissions_reviewer` FOREIGN KEY (`reviewed_by_admin_id`) REFERENCES `admins` (`admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `car_submission_images`
--
ALTER TABLE `car_submission_images`
  ADD CONSTRAINT `fk_submission_images_submission` FOREIGN KEY (`submission_id`) REFERENCES `car_sale_submissions` (`submission_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `fk_customers_preferred_branch` FOREIGN KEY (`preferred_branch_id`) REFERENCES `branches` (`branch_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fk_favorites_car` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_favorites_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoices_admin` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins` (`admin_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invoices_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`appointment_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invoices_car` FOREIGN KEY (`car_id`) REFERENCES `cars` (`car_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_invoices_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON UPDATE CASCADE;

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `fk_invoice_items_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `testimonials`
--
ALTER TABLE `testimonials`
  ADD CONSTRAINT `fk_testimonials_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_testimonials_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_testimonials_reviewer` FOREIGN KEY (`reviewed_by_admin_id`) REFERENCES `admins` (`admin_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_testimonials_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
