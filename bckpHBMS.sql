-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: HBMS
-- ------------------------------------------------------
-- Server version	8.0.46-0ubuntu0.22.04.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `amenities`
--

DROP TABLE IF EXISTS `amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `amenities` (
  `amenity_id` int NOT NULL AUTO_INCREMENT,
  `amenity_name` varchar(100) NOT NULL,
  PRIMARY KEY (`amenity_id`),
  UNIQUE KEY `amenity_name` (`amenity_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `amenities`
--

LOCK TABLES `amenities` WRITE;
/*!40000 ALTER TABLE `amenities` DISABLE KEYS */;
INSERT INTO `amenities` VALUES (3,'Free Breakfast'),(2,'Pool'),(1,'Wi-Fi');
/*!40000 ALTER TABLE `amenities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `availability_statuses`
--

DROP TABLE IF EXISTS `availability_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `availability_statuses` (
  `availability_status_id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(50) NOT NULL,
  PRIMARY KEY (`availability_status_id`),
  UNIQUE KEY `status_name` (`status_name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `availability_statuses`
--

LOCK TABLES `availability_statuses` WRITE;
/*!40000 ALTER TABLE `availability_statuses` DISABLE KEYS */;
INSERT INTO `availability_statuses` VALUES (1,'AVAILABLE'),(2,'BOOKED'),(3,'HELD'),(4,'MAINTENANCE');
/*!40000 ALTER TABLE `availability_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_cancellations`
--

DROP TABLE IF EXISTS `booking_cancellations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_cancellations` (
  `cancellation_id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `cancelled_by` bigint NOT NULL,
  `cancellation_reason` varchar(100) NOT NULL,
  `remarks` text,
  `refund_percentage` decimal(5,2) NOT NULL,
  `refund_amount` decimal(10,2) NOT NULL,
  `cancellation_charge` decimal(10,2) NOT NULL,
  `cancelled_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cancellation_id`),
  KEY `fk_cancel_booking` (`booking_id`),
  KEY `fk_cancel_user` (`cancelled_by`),
  CONSTRAINT `fk_cancel_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  CONSTRAINT `fk_cancel_user` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_cancellations`
--

LOCK TABLES `booking_cancellations` WRITE;
/*!40000 ALTER TABLE `booking_cancellations` DISABLE KEYS */;
INSERT INTO `booking_cancellations` VALUES (5,36,43,'Plans Changed','sadsa',50.00,2200.00,2200.00,'2026-06-29 12:47:19'),(6,38,43,'Plans Changed','',50.00,2000.00,2000.00,'2026-06-29 12:57:49'),(7,41,22,'Plans Changed','wadasdas',50.00,4000.00,4000.00,'2026-06-30 09:27:51'),(8,39,22,'Found Better Price','',50.00,1200.00,1200.00,'2026-06-30 12:41:42'),(9,42,43,'Plans Changed','sqadasdsa',50.00,2750.00,2750.00,'2026-07-01 04:54:32'),(10,43,43,'Found Better Price','sassadsa',100.00,5500.00,0.00,'2026-07-01 05:15:15');
/*!40000 ALTER TABLE `booking_cancellations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_holds`
--

DROP TABLE IF EXISTS `booking_holds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_holds` (
  `hold_id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `room_id` bigint NOT NULL,
  `adults` int NOT NULL,
  `children` int NOT NULL,
  `checkin_date` date NOT NULL,
  `checkout_date` date NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`hold_id`),
  KEY `room_id` (`room_id`),
  KEY `idx_holds_user_expiry` (`user_id`,`expires_at`),
  CONSTRAINT `booking_holds_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `booking_holds_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_holds`
--

LOCK TABLES `booking_holds` WRITE;
/*!40000 ALTER TABLE `booking_holds` DISABLE KEYS */;
INSERT INTO `booking_holds` VALUES (1,5,56,2,1,'2026-06-25','2026-07-01','2026-06-11 19:03:47','2026-06-11 13:23:47'),(2,10,57,2,1,'2026-06-25','2026-07-01','2026-06-11 19:04:00','2026-06-11 13:24:00'),(3,5,60,2,1,'2026-06-25','2026-07-01','2026-06-11 19:04:47','2026-06-11 13:24:47');
/*!40000 ALTER TABLE `booking_holds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_modifications`
--

DROP TABLE IF EXISTS `booking_modifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_modifications` (
  `modification_id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `modified_by` bigint NOT NULL,
  `old_checkin_date` date NOT NULL,
  `new_checkin_date` date NOT NULL,
  `old_checkout_date` date NOT NULL,
  `new_checkout_date` date NOT NULL,
  `old_adults` int NOT NULL,
  `new_adults` int NOT NULL,
  `old_children` int NOT NULL,
  `new_children` int NOT NULL,
  `old_room_id` bigint NOT NULL,
  `new_room_id` bigint NOT NULL,
  `modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`modification_id`),
  KEY `fk_booking_modification_booking` (`booking_id`),
  KEY `fk_booking_modification_user` (`modified_by`),
  KEY `fk_booking_modification_old_room` (`old_room_id`),
  KEY `fk_booking_modification_new_room` (`new_room_id`),
  CONSTRAINT `fk_booking_modification_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  CONSTRAINT `fk_booking_modification_new_room` FOREIGN KEY (`new_room_id`) REFERENCES `rooms` (`room_id`),
  CONSTRAINT `fk_booking_modification_old_room` FOREIGN KEY (`old_room_id`) REFERENCES `rooms` (`room_id`),
  CONSTRAINT `fk_booking_modification_user` FOREIGN KEY (`modified_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_modifications`
--

LOCK TABLES `booking_modifications` WRITE;
/*!40000 ALTER TABLE `booking_modifications` DISABLE KEYS */;
INSERT INTO `booking_modifications` VALUES (1,36,43,'2026-06-29','2026-06-28','2026-07-01','2026-06-30',2,2,1,1,61,61,'2026-06-29 09:55:04'),(2,36,43,'2026-06-28','2026-06-27','2026-06-30','2026-07-02',2,2,1,1,61,61,'2026-06-29 11:46:15'),(3,41,22,'2026-06-30','2026-06-29','2026-07-02','2026-07-02',2,2,0,0,123,123,'2026-06-30 09:27:28'),(4,46,43,'2026-07-02','2026-07-04','2026-07-03','2026-07-05',2,2,0,0,89,89,'2026-07-01 08:04:45'),(5,45,43,'2026-07-01','2026-06-30','2026-07-03','2026-07-09',2,2,0,0,86,86,'2026-07-01 08:05:45');
/*!40000 ALTER TABLE `booking_modifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_rooms`
--

DROP TABLE IF EXISTS `booking_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_rooms` (
  `booking_room_id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `room_id` bigint NOT NULL,
  `rate_per_night` decimal(10,2) NOT NULL,
  PRIMARY KEY (`booking_room_id`),
  KEY `booking_id` (`booking_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `booking_rooms_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  CONSTRAINT `booking_rooms_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_rooms`
--

LOCK TABLES `booking_rooms` WRITE;
/*!40000 ALTER TABLE `booking_rooms` DISABLE KEYS */;
INSERT INTO `booking_rooms` VALUES (23,1,51,100.00),(24,2,52,100.00),(25,3,56,200.00),(26,4,57,200.00),(27,5,61,120.00),(28,6,62,120.00),(29,7,93,4500.00),(30,8,96,3200.00),(31,9,51,2500.00),(32,10,98,6000.00),(33,11,53,4500.00),(34,11,54,4500.00),(35,12,55,7500.00),(36,13,57,2800.00),(37,14,58,4800.00),(38,14,59,4800.00),(39,15,61,2200.00),(40,15,62,2200.00),(41,16,63,4200.00),(42,16,64,4200.00),(43,17,60,8000.00),(44,18,65,7000.00),(45,19,81,2000.00),(46,19,82,2000.00),(47,20,53,4500.00),(48,20,54,4500.00),(49,21,61,2200.00),(50,22,62,2200.00),(51,23,63,4200.00),(52,24,91,2400.00),(53,25,92,2400.00),(54,26,88,5000.00),(55,27,89,5000.00),(56,28,86,2800.00),(57,29,87,2800.00),(58,30,86,2800.00),(59,31,87,2800.00),(60,32,90,9000.00),(61,33,51,2500.00),(62,34,73,4800.00),(63,35,64,4200.00),(65,37,87,2800.00),(68,40,90,9000.00),(72,44,90,9100.00),(73,45,86,5500.00),(74,46,89,5500.00),(75,47,61,2200.00);
/*!40000 ALTER TABLE `booking_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_sources`
--

DROP TABLE IF EXISTS `booking_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_sources` (
  `booking_source_id` int NOT NULL AUTO_INCREMENT,
  `source_name` varchar(50) NOT NULL,
  PRIMARY KEY (`booking_source_id`),
  UNIQUE KEY `source_name` (`source_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_sources`
--

LOCK TABLES `booking_sources` WRITE;
/*!40000 ALTER TABLE `booking_sources` DISABLE KEYS */;
INSERT INTO `booking_sources` VALUES (1,'ONLINE'),(3,'PHONE'),(2,'WALK_IN');
/*!40000 ALTER TABLE `booking_sources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_statuses`
--

DROP TABLE IF EXISTS `booking_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_statuses` (
  `booking_status_id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(50) NOT NULL,
  PRIMARY KEY (`booking_status_id`),
  UNIQUE KEY `status_name` (`status_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_statuses`
--

LOCK TABLES `booking_statuses` WRITE;
/*!40000 ALTER TABLE `booking_statuses` DISABLE KEYS */;
INSERT INTO `booking_statuses` VALUES (5,'CANCELLED'),(3,'CHECKED_IN'),(4,'CHECKED_OUT'),(2,'CONFIRMED'),(1,'PENDING');
/*!40000 ALTER TABLE `booking_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `booking_id` bigint NOT NULL AUTO_INCREMENT,
  `hotel_id` int NOT NULL,
  `user_id` bigint NOT NULL,
  `booking_status_id` int NOT NULL,
  `booking_source_id` int NOT NULL,
  `booking_reference` varchar(20) NOT NULL,
  `checkin_date` date NOT NULL,
  `checkout_date` date NOT NULL,
  `adults` int NOT NULL DEFAULT '1',
  `children` int NOT NULL DEFAULT '0',
  `total_amount` decimal(10,2) NOT NULL,
  `special_requests` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  UNIQUE KEY `booking_reference` (`booking_reference`),
  KEY `user_id` (`user_id`),
  KEY `booking_status_id` (`booking_status_id`),
  KEY `booking_source_id` (`booking_source_id`),
  KEY `idx_bookings_hotel_checkin` (`hotel_id`,`checkin_date`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`booking_status_id`) REFERENCES `booking_statuses` (`booking_status_id`),
  CONSTRAINT `bookings_ibfk_4` FOREIGN KEY (`booking_source_id`) REFERENCES `booking_sources` (`booking_source_id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,1,2,1,'HBMS001','2026-06-10','2026-06-15',2,0,500.00,NULL,'2026-06-09 05:09:36','2026-06-10 08:37:04'),(2,1,5,2,1,'HBMS002','2026-06-12','2026-06-18',2,1,750.00,NULL,'2026-06-09 05:09:36','2026-06-09 05:09:36'),(3,2,6,4,1,'HBMS003','2026-06-16','2026-06-17',1,0,400.00,NULL,'2026-06-09 05:09:36','2026-06-17 05:21:55'),(4,2,7,3,1,'HBMS004','2026-06-16','2026-06-19',2,0,600.00,NULL,'2026-06-09 05:09:36','2026-06-16 04:21:57'),(5,3,8,5,1,'HBMS005','2026-06-10','2026-06-15',2,0,500.00,NULL,'2026-06-09 05:09:36','2026-06-09 05:09:36'),(6,3,10,4,1,'HBMS006','2026-05-01','2026-05-05',2,0,300.00,NULL,'2026-06-09 05:09:36','2026-06-09 05:09:36'),(7,9,22,2,1,'HBMS-8MGSQK','2026-06-17','2026-06-23',2,0,27000.00,NULL,'2026-06-11 12:39:40','2026-06-11 12:39:40'),(8,10,22,2,1,'HBMS-VZVK0G','2026-06-11','2026-06-23',2,0,38400.00,NULL,'2026-06-11 12:45:42','2026-06-11 12:45:42'),(9,1,22,2,1,'HBMS-TMREPI','2026-06-17','2026-06-18',2,0,2500.00,NULL,'2026-06-11 13:09:44','2026-06-11 13:09:44'),(10,10,22,2,1,'HBMS-27NNOP','2026-06-12','2026-06-17',2,0,30000.00,NULL,'2026-06-11 13:13:59','2026-06-11 13:13:59'),(11,1,22,2,1,'HBMS-B15OLV','2026-06-12','2026-06-14',4,0,18000.00,NULL,'2026-06-11 13:18:16','2026-06-11 13:18:16'),(12,1,22,2,1,'HBMS-5HFEBM','2026-06-12','2026-06-14',2,0,15000.00,NULL,'2026-06-11 13:20:18','2026-06-11 13:20:18'),(13,2,22,2,1,'HBMS-XCCRYB','2026-06-16','2026-06-19',2,0,5600.00,NULL,'2026-06-11 13:33:06','2026-06-16 04:21:57'),(14,2,22,2,1,'HBMS-WECH1T','2026-06-16','2026-06-19',2,0,19200.00,NULL,'2026-06-11 13:35:13','2026-06-16 04:21:57'),(15,3,22,2,1,'HBMS-8GH3IR','2026-06-13','2026-06-16',4,0,13200.00,NULL,'2026-06-12 04:41:08','2026-06-12 04:41:08'),(16,3,22,2,1,'HBMS-Y9OYF6','2026-06-13','2026-06-16',4,0,25200.00,NULL,'2026-06-12 04:42:42','2026-06-12 04:42:42'),(17,2,22,3,1,'HBMS-TWR0FC','2026-06-16','2026-06-19',2,0,72000.00,NULL,'2026-06-12 06:22:50','2026-06-16 04:21:57'),(18,3,22,2,1,'HBMS-S4532B','2026-06-13','2026-06-22',2,0,63000.00,NULL,'2026-06-12 06:31:04','2026-06-12 06:31:04'),(19,7,22,2,1,'HBMS-5BBZ4H','2026-06-17','2026-06-30',2,0,52000.00,NULL,'2026-06-12 13:24:40','2026-06-12 13:24:40'),(20,1,22,2,1,'HBMS-0I1NIN','2026-06-15','2026-06-19',2,0,36000.00,NULL,'2026-06-15 04:40:47','2026-06-15 04:40:47'),(21,3,22,2,1,'HBMS-EJFGVE','2026-06-17','2026-06-23',2,0,13200.00,NULL,'2026-06-15 06:52:31','2026-06-15 06:52:31'),(22,3,22,2,1,'HBMS-PX833M','2026-06-18','2026-06-20',2,0,4400.00,NULL,'2026-06-15 11:51:16','2026-06-15 11:51:16'),(23,3,22,2,1,'HBMS-UKW1YS','2026-06-17','2026-07-03',2,0,67200.00,NULL,'2026-06-15 13:48:43','2026-06-15 13:48:43'),(24,9,22,2,1,'HBMS-C8JI4C','2026-06-17','2026-06-19',2,0,4800.00,NULL,'2026-06-16 08:40:26','2026-06-16 08:40:26'),(25,9,22,2,1,'HBMS-FG0N12','2026-06-17','2026-06-19',2,0,4800.00,NULL,'2026-06-16 10:21:34','2026-06-16 10:21:34'),(26,8,18,4,1,'HBMS-4LBZ1N','2026-06-17','2026-06-18',2,0,5000.00,NULL,'2026-06-17 05:50:04','2026-06-17 06:26:15'),(27,8,18,4,1,'HBMS-VZFQ36','2026-06-17','2026-06-18',4,0,5000.00,NULL,'2026-06-17 06:22:23','2026-06-17 06:53:45'),(28,8,18,4,1,'HBMS-BTIB1F','2026-06-17','2026-06-18',2,0,2800.00,NULL,'2026-06-17 06:37:55','2026-06-17 06:58:06'),(29,8,18,4,1,'HBMS-6Z7ZVN','2026-06-17','2026-06-18',2,0,2800.00,NULL,'2026-06-17 07:52:31','2026-06-17 07:54:33'),(30,8,22,4,1,'HBMS-NOP9T2','2026-06-18','2026-06-19',2,0,2800.00,NULL,'2026-06-18 10:06:14','2026-06-19 04:51:27'),(31,8,22,4,1,'HBMS-8PXJVJ','2026-06-19','2026-06-20',2,0,2800.00,NULL,'2026-06-18 12:05:58','2026-06-29 05:36:08'),(32,8,18,2,1,'HBMS-1DUJMC','2026-06-18','2026-06-19',2,0,9000.00,NULL,'2026-06-18 12:55:03','2026-06-18 12:55:03'),(33,1,22,2,1,'HBMS-R04KII','2026-06-20','2026-06-21',2,0,2500.00,NULL,'2026-06-19 09:42:17','2026-06-19 09:42:17'),(34,5,22,2,1,'HBMS-21K9EL','2026-06-23','2026-06-26',2,0,14400.00,NULL,'2026-06-22 05:08:44','2026-06-22 05:08:44'),(35,3,22,2,1,'HBMS-9XRLFX','2026-06-23','2026-06-26',2,0,12600.00,NULL,'2026-06-22 05:10:34','2026-06-22 05:10:34'),(36,3,43,5,1,'HBMS-81N4YS','2026-06-27','2026-07-02',2,1,4400.00,'','2026-06-29 05:32:49','2026-06-29 12:47:19'),(37,8,22,4,1,'HBMS-MZ7PCR','2026-06-29','2026-06-30',2,0,2800.00,NULL,'2026-06-29 06:53:51','2026-07-01 07:47:49'),(38,7,43,5,1,'HBMS-05YB8Q','2026-06-30','2026-07-02',2,0,4000.00,NULL,'2026-06-29 12:57:07','2026-06-29 12:57:49'),(39,28,22,5,1,'HBMS-XI2NPP','2026-06-29','2026-07-01',2,0,2400.00,NULL,'2026-06-29 13:59:42','2026-06-30 12:41:42'),(40,8,18,4,1,'HBMS-TLA7UO','2026-06-30','2026-07-02',4,1,18000.00,NULL,'2026-06-30 05:16:41','2026-07-01 11:29:41'),(41,28,22,5,1,'HBMS-18PXJN','2026-06-29','2026-07-02',2,0,8000.00,'sdfdsfdsfds','2026-06-30 09:26:58','2026-06-30 09:27:51'),(42,8,43,5,1,'HBMS-4TGUXQ','2026-07-01','2026-07-02',2,0,5500.00,NULL,'2026-07-01 04:53:52','2026-07-01 04:54:32'),(43,8,43,5,1,'HBMS-HQVBST','2026-07-02','2026-07-03',2,0,5500.00,NULL,'2026-07-01 05:14:46','2026-07-01 05:15:15'),(44,8,43,2,1,'HBMS-E3XOY6','2026-07-02','2026-07-10',2,0,72800.00,NULL,'2026-07-01 06:38:30','2026-07-01 06:38:30'),(45,8,43,2,1,'HBMS-WMGJTO','2026-06-30','2026-07-09',2,0,11000.00,'','2026-07-01 07:00:00','2026-07-01 08:05:45'),(46,8,43,2,1,'HBMS-UA8Z75','2026-07-04','2026-07-05',2,0,5500.00,'ssss','2026-07-01 08:02:47','2026-07-01 08:04:45'),(47,3,22,2,1,'HBMS-GE9SCB','2026-07-01','2026-07-03',2,0,4400.00,NULL,'2026-07-01 13:21:13','2026-07-01 13:21:13');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cancellation_policies`
--

DROP TABLE IF EXISTS `cancellation_policies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cancellation_policies` (
  `policy_id` int NOT NULL AUTO_INCREMENT,
  `hotel_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `free_cancellation_hours` int NOT NULL DEFAULT '24',
  `refund_percentage` decimal(5,2) NOT NULL DEFAULT '100.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`policy_id`),
  UNIQUE KEY `uq_hotel_roomtype_policy` (`hotel_id`,`room_type_id`),
  KEY `room_type_id` (`room_type_id`),
  CONSTRAINT `cancellation_policies_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`),
  CONSTRAINT `cancellation_policies_ibfk_2` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cancellation_policies`
--

LOCK TABLES `cancellation_policies` WRITE;
/*!40000 ALTER TABLE `cancellation_policies` DISABLE KEYS */;
INSERT INTO `cancellation_policies` VALUES (1,1,1,12,50.00,'2026-06-11 06:07:38'),(4,28,42,48,75.00,'2026-06-30 12:37:31'),(5,8,24,23,30.00,'2026-07-01 06:36:59'),(8,8,44,24,50.00,'2026-07-01 08:12:48');
/*!40000 ALTER TABLE `cancellation_policies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guest_identifications`
--

DROP TABLE IF EXISTS `guest_identifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_identifications` (
  `guest_id_id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `verified_by` bigint NOT NULL,
  `id_type_id` int NOT NULL,
  `id_number` varchar(100) DEFAULT NULL,
  `document_url` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verification_status` enum('APPROVED','FAILED') DEFAULT 'APPROVED',
  `remarks` text,
  PRIMARY KEY (`guest_id_id`),
  KEY `booking_id` (`booking_id`),
  KEY `user_id` (`user_id`),
  KEY `id_type_id` (`id_type_id`),
  KEY `ib_fk_3` (`verified_by`),
  CONSTRAINT `guest_identifications_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  CONSTRAINT `guest_identifications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `guest_identifications_ibfk_3` FOREIGN KEY (`id_type_id`) REFERENCES `id_types` (`id_type_id`),
  CONSTRAINT `ib_fk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_identifications`
--

LOCK TABLES `guest_identifications` WRITE;
/*!40000 ALTER TABLE `guest_identifications` DISABLE KEYS */;
INSERT INTO `guest_identifications` VALUES (4,26,18,9,1,'7418/529630','https://ik.imagekit.io/7efdqayix/hotel_documents/doc_1781675454742_Manthon_5MY6A6i1H.jpg','2026-06-17 05:50:58','APPROVED','HBMS-4LBZ1N verified\r\n'),(5,27,18,9,3,'7417418741','https://ik.imagekit.io/7efdqayix/hotel_documents/doc_1781677432956_screen_bDRUZUbrg.png','2026-06-17 06:23:59','APPROVED','Verified HBMS-VZFQ36'),(6,28,18,9,2,'7412589630','https://ik.imagekit.io/7efdqayix/hotel_documents/doc_1781679463165_milan_xbVXCs_s-.jpeg','2026-06-17 06:57:44','APPROVED','HBMS-BTIB1F verified'),(7,29,18,9,1,'131231243243','https://ik.imagekit.io/7efdqayix/hotel_documents/doc_1781682852989_milan_rI_Mavk7i.jpeg','2026-06-17 07:54:14','APPROVED','HBMS-6Z7ZVN GIVEN'),(8,30,22,9,1,'741258963000','https://ik.imagekit.io/7efdqayix/hotel_documents/doc_1781777221467_milan_usfi9I7su.jpeg','2026-06-18 10:07:06','APPROVED','HBMS-NOP9T2 verified'),(9,31,22,9,1,'12306547890','https://ik.imagekit.io/7efdqayix/hotel_documents/doc_1781862598055_milan_mSv2cDmKp.jpeg','2026-06-19 09:50:01','APPROVED','HBMS-8PXJVJ approved'),(10,37,22,9,1,'8797498790','https://ik.imagekit.io/7efdqayix/hotel_documents/doc_1782716074983_Image_Editor.png_BlAOWj20F.jpg','2026-06-29 06:54:37','APPROVED','HBMS-MZ7PCR checkedIN'),(11,40,18,9,2,'741085209630','https://ik.imagekit.io/7efdqayix/hotel_documents/doc_1782796714555_Image_Editor.png_Wa1dYg5gB.jpg','2026-06-30 05:18:42','APPROVED','HBMS-TLA7UO accepted\r\n');
/*!40000 ALTER TABLE `guest_identifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotels`
--

DROP TABLE IF EXISTS `hotels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotels` (
  `hotel_id` int NOT NULL AUTO_INCREMENT,
  `tenant_status_id` int NOT NULL DEFAULT '1',
  `name` varchar(150) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `cover_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`hotel_id`),
  UNIQUE KEY `uq_slug` (`slug`),
  KEY `idx_tenant_status` (`tenant_status_id`),
  CONSTRAINT `fk_hotels_tenant_status` FOREIGN KEY (`tenant_status_id`) REFERENCES `tenant_statuses` (`tenant_status_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `hotels_ibfk_1` FOREIGN KEY (`tenant_status_id`) REFERENCES `tenant_statuses` (`tenant_status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotels`
--

LOCK TABLES `hotels` WRITE;
/*!40000 ALTER TABLE `hotels` DISABLE KEYS */;
INSERT INTO `hotels` VALUES (1,1,'Royal Orchid Ahmedabad','royal-orchid-ahmedabad','SG Highway','Ahmedabad','Gujarat','India','9876500001','info@royalorchid.com','https://ik.imagekit.io/7efdqayix/hotels/logos/logo-1781073020573_WozkOnjSl','https://ik.imagekit.io/7efdqayix/hotels/covers/cover-1781073022817_xWLSR_Mr1','2026-06-08 07:12:03','2026-06-10 08:41:41'),(2,1,'Grand Palace Residency','grand-palace-residency','Prahlad Nagar','Ahmedabad','Gujarat','India','9876500002','info@grandpalace.com','logo2.png','cover2.jpg','2026-06-08 07:12:03','2026-06-08 07:12:03'),(3,1,'Sunrise Suites','sunrise-suites','Satellite Road','Ahmedabad','Gujarat','India','9876500003','info@sunrise.com','https://ik.imagekit.io/7efdqayix/hotels/logos/logo-1782725508583_6RfEGcNhW','https://ik.imagekit.io/7efdqayix/hotels/covers/cover-1782725510222_nNVzWc7LS','2026-06-08 07:12:03','2026-06-29 09:31:51'),(4,1,'Blue Lagoon Hotel','blue-lagoon-hotel','CG Road','Ahmedabad','Gujarat','India','9876500004','info@bluelagoon.com','logo4.png','cover4.jpg','2026-06-08 07:12:03','2026-06-08 07:12:03'),(5,1,'Urban Nest Inn','urban-nest-inn','Bodakdev','Ahmedabad','Gujarat','India','9876500005','info@urbannest.com','logo5.png','cover5.jpg','2026-06-08 07:12:03','2026-06-08 07:12:03'),(6,1,'Emerald Stay','emerald-stay','Navrangpura','Ahmedabad','Gujarat','India','9876500006','info@emeraldstay.com','logo6.png','cover6.jpg','2026-06-08 07:12:03','2026-06-08 07:12:03'),(7,1,'The Heritage Plaza','the-heritage-plaza','Ashram Road','Ahmedabad','Gujarat','India','9876500007','info@heritageplaza.com','logo7.png','cover7.jpg','2026-06-08 07:12:03','2026-06-08 07:12:03'),(8,1,'Comfort Crown','comfort-crown','Vastrapur','Ahmedabad','Gujarat','India','9876500008','info@comfortcrown.com','logo8.png','cover8.jpg','2026-06-08 07:12:03','2026-06-08 07:12:03'),(9,1,'Elite Horizon','elite-horizon','Science City Road','Ahmedabad','Gujarat','India','9876500009','info@elitehorizon.com','logo9.png','cover9.jpg','2026-06-08 07:12:03','2026-06-08 07:12:03'),(10,1,'Skyline Retreat','skyline-retreat','Thaltej','Ahmedabad','Gujarat','India','9876500010','info@skyline.com','logo10.png','cover10.jpg','2026-06-08 07:12:03','2026-06-29 06:59:25'),(22,1,'Kelsey Leon','kelsey-leon-1781241740125','Placeat non magni a','ahmedabad','gujrat','india','9456848576','fern@gmail.com','https://ik.imagekit.io/7efdqayix/hotels/logos/logo-1781241737046_B28zV0HeO','https://media.istockphoto.com/id/104731717/photo/luxury-resort.jpg?s=612x612&w=0&k=20&c=cODMSPbYyrn1FHake1xYz9M8r15iOfGz9Aosy9Db7mI=','2026-06-12 05:22:20','2026-07-01 11:58:18'),(24,1,'Grand Palace Hotel','grand-palace','MG Road','Ahmedabad','Gujarat','India','9876543210','info@grandpalace.com',NULL,NULL,'2026-06-15 12:13:46','2026-06-15 12:13:46'),(25,1,'Ocean View Resort','ocean-view','Marine Drive','Mumbai','Maharashtra','India','9876543211','info@oceanview.com',NULL,NULL,'2026-06-15 12:13:46','2026-06-15 12:13:46'),(26,2,'Declan Robles','declan-robles-1781616350983','Molestiae esse enim','Département de Dogondoutchi','Dosso Region','Niger','+1 (914) 327-1398','qijybyjo@mailinator.com',NULL,NULL,'2026-06-16 13:25:50','2026-06-16 13:25:56'),(28,1,'Sher-A-punjab','sher-a-punjab-1782720505991','G-BLOCH, doodho ki malai, kulcha circle, lassi char rasta','Ludhiana','Punjab','India','8976546657','sherapunjab@gmail.com','https://ik.imagekit.io/7efdqayix/hotels/logos/logo-1782720502922_LLHawUoC4','https://ik.imagekit.io/7efdqayix/hotels/covers/cover-1782720504618_fKXVCv6AY','2026-06-29 08:08:25','2026-06-29 08:08:25');
/*!40000 ALTER TABLE `hotels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `id_types`
--

DROP TABLE IF EXISTS `id_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `id_types` (
  `id_type_id` int NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id_type_id`),
  UNIQUE KEY `type_name` (`type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `id_types`
--

LOCK TABLES `id_types` WRITE;
/*!40000 ALTER TABLE `id_types` DISABLE KEYS */;
INSERT INTO `id_types` VALUES (1,'Aadhaar Card'),(3,'Driving License'),(2,'Passport'),(4,'Voter ID');
/*!40000 ALTER TABLE `id_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `incidental_charges`
--

DROP TABLE IF EXISTS `incidental_charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incidental_charges` (
  `incidental_id` bigint NOT NULL AUTO_INCREMENT,
  `hotel_id` int NOT NULL,
  `booking_id` bigint NOT NULL,
  `added_by` bigint NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`incidental_id`),
  KEY `hotel_id` (`hotel_id`),
  KEY `booking_id` (`booking_id`),
  KEY `added_by` (`added_by`),
  CONSTRAINT `incidental_charges_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`),
  CONSTRAINT `incidental_charges_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  CONSTRAINT `incidental_charges_ibfk_3` FOREIGN KEY (`added_by`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `incidental_charges`
--

LOCK TABLES `incidental_charges` WRITE;
/*!40000 ALTER TABLE `incidental_charges` DISABLE KEYS */;
INSERT INTO `incidental_charges` VALUES (1,1,11,11,'Minibar - snacks & drinks',500.00,'2026-06-12 08:54:58'),(2,1,11,11,'Laundry service',300.00,'2026-06-12 08:54:58'),(3,1,1,11,'Room service - dinner',750.00,'2026-06-12 08:55:09'),(4,3,23,11,'Minibar - snacks & drinks',1000.00,'2026-06-17 12:23:07'),(5,3,23,11,'Laundry service',200.00,'2026-06-17 12:23:07'),(6,3,22,11,'Minibar - snacks & drinks',1000.00,'2026-06-17 12:37:07'),(7,3,22,11,'Laundry service',200.00,'2026-06-17 12:37:07'),(10,8,31,9,'Salon',147.00,'2026-06-19 09:26:18'),(11,8,31,9,'MiniBar',741.00,'2026-06-19 09:27:13'),(12,8,32,9,'Bar',740.00,'2026-06-19 09:28:23'),(17,8,40,9,'Laundry',7400.00,'2026-06-30 05:19:08'),(18,8,40,9,'Minibar',7800.00,'2026-06-30 05:19:15');
/*!40000 ALTER TABLE `incidental_charges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `invoice_id` bigint NOT NULL AUTO_INCREMENT,
  `hotel_id` int NOT NULL,
  `booking_id` bigint NOT NULL,
  `room_charges` decimal(10,2) NOT NULL,
  `incidentals` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `uq_booking_invoice` (`booking_id`),
  KEY `hotel_id` (`hotel_id`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`),
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`)
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (1,1,11,18000.00,800.00,2256.00,21056.00,'2026-06-12 10:48:53'),(3,1,1,500.00,750.00,150.00,1400.00,'2026-06-12 10:41:14'),(20,2,4,600.00,0.00,72.00,672.00,'2026-06-16 07:51:19'),(50,2,3,200.00,0.00,24.00,224.00,'2026-06-17 05:21:55'),(95,8,26,5000.00,0.00,600.00,5600.00,'2026-06-17 06:26:15'),(96,8,27,5000.00,0.00,600.00,5600.00,'2026-06-17 06:53:45'),(97,8,28,2800.00,0.00,336.00,3136.00,'2026-06-17 06:58:06'),(98,8,29,2800.00,0.00,336.00,3136.00,'2026-06-17 07:54:33'),(99,3,15,13200.00,0.00,1584.00,14784.00,'2026-06-17 12:04:20'),(101,9,25,4800.00,0.00,576.00,5376.00,'2026-06-17 12:18:48'),(107,9,24,4800.00,0.00,576.00,5376.00,'2026-06-17 12:18:15'),(109,3,23,67200.00,1200.00,8208.00,76608.00,'2026-06-17 12:30:12'),(112,3,22,4400.00,1200.00,672.00,6272.00,'2026-06-17 12:37:22'),(115,1,20,36000.00,0.00,4320.00,40320.00,'2026-06-18 08:19:33'),(116,8,30,2800.00,0.00,336.00,3136.00,'2026-06-19 04:51:27'),(117,8,32,9000.00,740.00,1168.80,10908.80,'2026-06-19 09:55:02'),(119,8,31,2800.00,888.00,442.56,4130.56,'2026-06-29 05:36:08'),(120,8,37,2800.00,0.00,336.00,3136.00,'2026-07-01 07:47:49'),(121,3,36,4400.00,0.00,528.00,4928.00,'2026-06-29 09:47:51'),(122,7,38,0.00,0.00,0.00,0.00,'2026-06-29 12:57:56'),(123,28,39,2400.00,0.00,288.00,2688.00,'2026-06-29 14:00:14'),(124,8,40,18000.00,15200.00,3984.00,37184.00,'2026-07-01 11:29:41'),(125,28,41,0.00,0.00,0.00,0.00,'2026-06-30 09:28:14'),(126,8,42,0.00,0.00,0.00,0.00,'2026-07-01 04:54:38'),(128,8,43,0.00,0.00,0.00,0.00,'2026-07-01 05:16:30'),(129,8,44,72800.00,0.00,8736.00,81536.00,'2026-07-01 06:55:35'),(131,3,47,4400.00,0.00,528.00,4928.00,'2026-07-01 13:21:21');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `payment_method_id` int NOT NULL AUTO_INCREMENT,
  `method_name` varchar(50) NOT NULL,
  PRIMARY KEY (`payment_method_id`),
  UNIQUE KEY `uq_method_name` (`method_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_methods`
--

LOCK TABLES `payment_methods` WRITE;
/*!40000 ALTER TABLE `payment_methods` DISABLE KEYS */;
INSERT INTO `payment_methods` VALUES (4,'BYPASS'),(2,'CARD'),(1,'CASH'),(3,'UPI');
/*!40000 ALTER TABLE `payment_methods` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_statuses`
--

DROP TABLE IF EXISTS `payment_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_statuses` (
  `payment_status_id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(50) NOT NULL,
  PRIMARY KEY (`payment_status_id`),
  UNIQUE KEY `uq_payment_status_name` (`status_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_statuses`
--

LOCK TABLES `payment_statuses` WRITE;
/*!40000 ALTER TABLE `payment_statuses` DISABLE KEYS */;
INSERT INTO `payment_statuses` VALUES (4,'BYPASSED'),(3,'FAILED'),(6,'PARTIALLY_REFUNDED'),(1,'PENDING'),(5,'REFUNDED'),(2,'SUCCESS');
/*!40000 ALTER TABLE `payment_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `hotel_id` int NOT NULL,
  `booking_id` bigint NOT NULL,
  `payment_method_id` int NOT NULL,
  `payment_status_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `is_bypassed` tinyint(1) NOT NULL DEFAULT '0',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`),
  KEY `idx_payment_booking` (`booking_id`),
  KEY `fk_payment_hotel` (`hotel_id`),
  KEY `fk_payment_method` (`payment_method_id`),
  KEY `fk_payment_status` (`payment_status_id`),
  CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`),
  CONSTRAINT `fk_payment_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`),
  CONSTRAINT `fk_payment_method` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`payment_method_id`),
  CONSTRAINT `fk_payment_status` FOREIGN KEY (`payment_status_id`) REFERENCES `payment_statuses` (`payment_status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,9,7,2,2,27000.00,0,'2026-06-11 12:39:40','2026-06-11 12:39:40'),(2,10,8,2,2,38400.00,0,'2026-06-11 12:45:42','2026-06-11 12:45:42'),(3,1,9,2,2,2500.00,0,'2026-06-11 13:09:44','2026-06-11 13:09:44'),(4,10,10,2,2,30000.00,0,'2026-06-11 13:13:59','2026-06-11 13:13:59'),(5,1,11,2,2,18000.00,0,'2026-06-11 13:18:16','2026-06-11 13:18:16'),(6,1,12,2,2,15000.00,0,'2026-06-11 13:20:18','2026-06-11 13:20:18'),(7,2,13,2,2,5600.00,0,'2026-06-11 13:33:06','2026-06-11 13:33:06'),(8,2,14,2,2,19200.00,0,'2026-06-11 13:35:13','2026-06-11 13:35:13'),(9,3,15,2,2,13200.00,0,'2026-06-12 04:41:08','2026-06-12 04:41:08'),(10,3,16,2,2,25200.00,0,'2026-06-12 04:42:42','2026-06-12 04:42:42'),(11,2,17,2,2,72000.00,0,'2026-06-12 06:22:50','2026-06-12 06:22:50'),(12,3,18,2,2,63000.00,0,'2026-06-12 06:31:04','2026-06-12 06:31:04'),(13,7,19,2,2,52000.00,0,'2026-06-12 13:24:40','2026-06-12 13:24:40'),(14,1,20,2,2,36000.00,0,'2026-06-15 04:40:47','2026-06-15 04:40:47'),(15,3,21,2,2,13200.00,0,'2026-06-15 06:52:31','2026-06-15 06:52:31'),(16,3,22,2,2,4400.00,0,'2026-06-15 11:51:16','2026-06-15 11:51:16'),(17,3,23,2,2,67200.00,0,'2026-06-15 13:48:43','2026-06-15 13:48:43'),(18,9,24,2,2,4800.00,0,'2026-06-16 08:40:26','2026-06-16 08:40:26'),(19,9,25,2,2,4800.00,0,'2026-06-16 10:21:34','2026-06-16 10:21:34'),(20,8,26,3,2,5000.00,0,'2026-06-17 05:50:04','2026-06-17 05:50:04'),(21,8,27,3,2,5000.00,0,'2026-06-17 06:22:23','2026-06-17 06:22:23'),(22,8,28,3,2,2800.00,0,'2026-06-17 06:37:55','2026-06-17 06:37:55'),(23,8,29,3,2,2800.00,0,'2026-06-17 07:52:31','2026-06-17 07:52:31'),(24,8,30,2,2,2800.00,0,'2026-06-18 10:06:14','2026-06-18 10:06:14'),(25,8,31,2,2,2800.00,0,'2026-06-18 12:05:58','2026-06-18 12:05:58'),(26,8,32,3,2,9000.00,0,'2026-06-18 12:55:03','2026-06-18 12:55:03'),(27,1,33,2,2,2500.00,0,'2026-06-19 09:42:17','2026-06-19 09:42:17'),(28,5,34,2,2,14400.00,0,'2026-06-22 05:08:44','2026-06-22 05:08:44'),(29,3,35,2,2,12600.00,0,'2026-06-22 05:10:34','2026-06-22 05:10:34'),(30,3,36,2,6,4400.00,0,'2026-06-29 05:32:49','2026-06-29 05:32:49'),(31,8,37,2,2,2800.00,0,'2026-06-29 06:53:51','2026-06-29 06:53:51'),(32,7,38,2,6,4000.00,0,'2026-06-29 12:57:07','2026-06-29 12:57:07'),(33,28,39,2,6,2400.00,0,'2026-06-29 13:59:42','2026-06-29 13:59:42'),(34,8,40,3,2,18000.00,0,'2026-06-30 05:16:41','2026-06-30 05:16:41'),(35,28,41,2,6,8000.00,0,'2026-06-30 09:26:59','2026-06-30 09:26:58'),(36,8,42,2,6,5500.00,0,'2026-07-01 04:53:52','2026-07-01 04:53:52'),(37,8,43,2,5,5500.00,0,'2026-07-01 05:14:46','2026-07-01 05:14:46'),(38,8,44,2,2,72800.00,0,'2026-07-01 06:38:30','2026-07-01 06:38:30'),(39,8,45,2,2,11000.00,0,'2026-07-01 07:00:00','2026-07-01 07:00:00'),(40,8,46,2,2,5500.00,0,'2026-07-01 08:02:47','2026-07-01 08:02:47'),(41,3,47,2,2,4400.00,0,'2026-07-01 13:21:13','2026-07-01 13:21:13');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_availability`
--

DROP TABLE IF EXISTS `room_availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_availability` (
  `availability_id` bigint NOT NULL AUTO_INCREMENT,
  `room_id` bigint NOT NULL,
  `availability_status_id` int NOT NULL,
  `date` date NOT NULL,
  `price_override` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`availability_id`),
  UNIQUE KEY `uq_room_date` (`room_id`,`date`),
  KEY `availability_status_id` (`availability_status_id`),
  KEY `idx_availability_search` (`room_id`,`date`,`availability_status_id`),
  CONSTRAINT `room_availability_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`room_id`),
  CONSTRAINT `room_availability_ibfk_2` FOREIGN KEY (`availability_status_id`) REFERENCES `availability_statuses` (`availability_status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3001 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_availability`
--

LOCK TABLES `room_availability` WRITE;
/*!40000 ALTER TABLE `room_availability` DISABLE KEYS */;
INSERT INTO `room_availability` VALUES (1,100,1,'2026-06-08',NULL),(2,99,1,'2026-06-08',NULL),(3,98,1,'2026-06-08',NULL),(4,97,1,'2026-06-08',NULL),(5,96,1,'2026-06-08',NULL),(6,95,2,'2026-06-08',NULL),(7,94,1,'2026-06-08',NULL),(8,93,2,'2026-06-08',NULL),(9,92,1,'2026-06-08',NULL),(10,91,2,'2026-06-08',NULL),(11,90,1,'2026-06-08',NULL),(12,89,1,'2026-06-08',NULL),(13,88,1,'2026-06-08',NULL),(14,87,2,'2026-06-08',NULL),(15,86,2,'2026-06-08',NULL),(16,85,1,'2026-06-08',NULL),(17,84,1,'2026-06-08',NULL),(18,83,2,'2026-06-08',NULL),(19,82,1,'2026-06-08',NULL),(20,81,1,'2026-06-08',NULL),(21,80,1,'2026-06-08',NULL),(22,79,1,'2026-06-08',NULL),(23,78,1,'2026-06-08',NULL),(24,77,1,'2026-06-08',NULL),(25,76,1,'2026-06-08',NULL),(26,75,1,'2026-06-08',NULL),(27,74,1,'2026-06-08',NULL),(28,73,2,'2026-06-08',NULL),(29,72,1,'2026-06-08',NULL),(30,71,1,'2026-06-08',NULL),(31,70,1,'2026-06-08',NULL),(32,69,2,'2026-06-08',NULL),(33,68,1,'2026-06-08',NULL),(34,67,1,'2026-06-08',NULL),(35,66,1,'2026-06-08',NULL),(36,65,1,'2026-06-08',NULL),(37,64,1,'2026-06-08',NULL),(38,63,1,'2026-06-08',NULL),(39,62,1,'2026-06-08',NULL),(40,61,2,'2026-06-08',NULL),(41,60,1,'2026-06-08',NULL),(42,59,1,'2026-06-08',NULL),(43,58,1,'2026-06-08',NULL),(44,57,1,'2026-06-08',NULL),(45,56,1,'2026-06-08',NULL),(46,55,1,'2026-06-08',NULL),(47,54,2,'2026-06-08',NULL),(48,53,2,'2026-06-08',NULL),(49,52,1,'2026-06-08',NULL),(50,51,1,'2026-06-08',NULL),(51,100,1,'2026-06-09',NULL),(52,99,1,'2026-06-09',NULL),(53,98,1,'2026-06-09',NULL),(54,97,1,'2026-06-09',NULL),(55,96,1,'2026-06-09',NULL),(56,95,2,'2026-06-09',NULL),(57,94,1,'2026-06-09',NULL),(58,93,1,'2026-06-09',NULL),(59,92,2,'2026-06-09',NULL),(60,91,3,'2026-06-09',NULL),(61,90,1,'2026-06-09',NULL),(62,89,1,'2026-06-09',NULL),(63,88,1,'2026-06-09',NULL),(64,87,2,'2026-06-09',NULL),(65,86,2,'2026-06-09',NULL),(66,85,1,'2026-06-09',NULL),(67,84,1,'2026-06-09',NULL),(68,83,1,'2026-06-09',NULL),(69,82,1,'2026-06-09',NULL),(70,81,1,'2026-06-09',NULL),(71,80,1,'2026-06-09',NULL),(72,79,1,'2026-06-09',NULL),(73,78,1,'2026-06-09',NULL),(74,77,1,'2026-06-09',NULL),(75,76,1,'2026-06-09',NULL),(76,75,1,'2026-06-09',NULL),(77,74,1,'2026-06-09',NULL),(78,73,1,'2026-06-09',NULL),(79,72,1,'2026-06-09',NULL),(80,71,2,'2026-06-09',NULL),(81,70,1,'2026-06-09',NULL),(82,69,1,'2026-06-09',NULL),(83,68,1,'2026-06-09',NULL),(84,67,1,'2026-06-09',NULL),(85,66,1,'2026-06-09',NULL),(86,65,1,'2026-06-09',NULL),(87,64,1,'2026-06-09',NULL),(88,63,1,'2026-06-09',NULL),(89,62,1,'2026-06-09',NULL),(90,61,1,'2026-06-09',NULL),(91,60,1,'2026-06-09',NULL),(92,59,2,'2026-06-09',NULL),(93,58,1,'2026-06-09',NULL),(94,57,1,'2026-06-09',NULL),(95,56,1,'2026-06-09',NULL),(96,55,1,'2026-06-09',NULL),(97,54,1,'2026-06-09',NULL),(98,53,1,'2026-06-09',NULL),(99,52,1,'2026-06-09',NULL),(100,51,2,'2026-06-09',NULL),(101,100,2,'2026-06-10',NULL),(102,99,1,'2026-06-10',NULL),(103,98,1,'2026-06-10',NULL),(104,97,1,'2026-06-10',NULL),(105,96,1,'2026-06-10',NULL),(106,95,1,'2026-06-10',NULL),(107,94,2,'2026-06-10',NULL),(108,93,1,'2026-06-10',NULL),(109,92,1,'2026-06-10',NULL),(110,91,1,'2026-06-10',NULL),(111,90,1,'2026-06-10',NULL),(112,89,1,'2026-06-10',NULL),(113,88,1,'2026-06-10',NULL),(114,87,1,'2026-06-10',NULL),(115,86,2,'2026-06-10',NULL),(116,85,1,'2026-06-10',NULL),(117,84,1,'2026-06-10',NULL),(118,83,1,'2026-06-10',NULL),(119,82,1,'2026-06-10',NULL),(120,81,2,'2026-06-10',NULL),(121,80,1,'2026-06-10',NULL),(122,79,2,'2026-06-10',NULL),(123,78,2,'2026-06-10',NULL),(124,77,1,'2026-06-10',NULL),(125,76,1,'2026-06-10',NULL),(126,75,1,'2026-06-10',NULL),(127,74,1,'2026-06-10',NULL),(128,73,1,'2026-06-10',NULL),(129,72,1,'2026-06-10',NULL),(130,71,1,'2026-06-10',NULL),(131,70,1,'2026-06-10',NULL),(132,69,1,'2026-06-10',NULL),(133,68,2,'2026-06-10',NULL),(134,67,1,'2026-06-10',NULL),(135,66,3,'2026-06-10',NULL),(136,65,1,'2026-06-10',NULL),(137,64,1,'2026-06-10',NULL),(138,63,1,'2026-06-10',NULL),(139,62,2,'2026-06-10',NULL),(140,61,1,'2026-06-10',NULL),(141,60,1,'2026-06-10',NULL),(142,59,1,'2026-06-10',NULL),(143,58,2,'2026-06-10',NULL),(144,57,1,'2026-06-10',NULL),(145,56,1,'2026-06-10',NULL),(146,55,1,'2026-06-10',NULL),(147,54,1,'2026-06-10',NULL),(148,53,1,'2026-06-10',NULL),(149,52,2,'2026-06-10',NULL),(150,51,1,'2026-06-10',NULL),(151,100,1,'2026-06-11',NULL),(152,99,1,'2026-06-11',NULL),(153,98,1,'2026-06-11',NULL),(154,97,1,'2026-06-11',NULL),(155,96,1,'2026-06-11',NULL),(156,95,1,'2026-06-11',NULL),(157,94,2,'2026-06-11',NULL),(158,93,3,'2026-06-11',NULL),(159,92,1,'2026-06-11',NULL),(160,91,1,'2026-06-11',NULL),(161,90,1,'2026-06-11',NULL),(162,89,2,'2026-06-11',NULL),(163,88,1,'2026-06-11',NULL),(164,87,1,'2026-06-11',NULL),(165,86,1,'2026-06-11',NULL),(166,85,1,'2026-06-11',NULL),(167,84,1,'2026-06-11',NULL),(168,83,1,'2026-06-11',NULL),(169,82,1,'2026-06-11',NULL),(170,81,1,'2026-06-11',NULL),(171,80,1,'2026-06-11',NULL),(172,79,1,'2026-06-11',NULL),(173,78,1,'2026-06-11',NULL),(174,77,1,'2026-06-11',NULL),(175,76,1,'2026-06-11',NULL),(176,75,1,'2026-06-11',NULL),(177,74,2,'2026-06-11',NULL),(178,73,1,'2026-06-11',NULL),(179,72,1,'2026-06-11',NULL),(180,71,1,'2026-06-11',NULL),(181,70,1,'2026-06-11',NULL),(182,69,1,'2026-06-11',NULL),(183,68,1,'2026-06-11',NULL),(184,67,2,'2026-06-11',NULL),(185,66,1,'2026-06-11',NULL),(186,65,1,'2026-06-11',NULL),(187,64,1,'2026-06-11',NULL),(188,63,1,'2026-06-11',NULL),(189,62,2,'2026-06-11',NULL),(190,61,1,'2026-06-11',NULL),(191,60,1,'2026-06-11',NULL),(192,59,1,'2026-06-11',NULL),(193,58,1,'2026-06-11',NULL),(194,57,1,'2026-06-11',NULL),(195,56,1,'2026-06-11',NULL),(196,55,1,'2026-06-11',NULL),(197,54,1,'2026-06-11',NULL),(198,53,1,'2026-06-11',NULL),(199,52,1,'2026-06-11',NULL),(200,51,1,'2026-06-11',NULL),(201,100,1,'2026-06-12',NULL),(202,99,2,'2026-06-12',NULL),(203,98,1,'2026-06-12',NULL),(204,97,1,'2026-06-12',NULL),(205,96,1,'2026-06-12',NULL),(206,95,1,'2026-06-12',NULL),(207,94,2,'2026-06-12',NULL),(208,93,1,'2026-06-12',NULL),(209,92,2,'2026-06-12',NULL),(210,91,1,'2026-06-12',NULL),(211,90,1,'2026-06-12',NULL),(212,89,1,'2026-06-12',NULL),(213,88,1,'2026-06-12',NULL),(214,87,1,'2026-06-12',NULL),(215,86,1,'2026-06-12',NULL),(216,85,1,'2026-06-12',NULL),(217,84,1,'2026-06-12',NULL),(218,83,1,'2026-06-12',NULL),(219,82,1,'2026-06-12',NULL),(220,81,2,'2026-06-12',NULL),(221,80,1,'2026-06-12',NULL),(222,79,1,'2026-06-12',NULL),(223,78,1,'2026-06-12',NULL),(224,77,2,'2026-06-12',NULL),(225,76,1,'2026-06-12',NULL),(226,75,1,'2026-06-12',NULL),(227,74,1,'2026-06-12',NULL),(228,73,1,'2026-06-12',NULL),(229,72,1,'2026-06-12',NULL),(230,71,1,'2026-06-12',NULL),(231,70,1,'2026-06-12',NULL),(232,69,2,'2026-06-12',NULL),(233,68,1,'2026-06-12',NULL),(234,67,1,'2026-06-12',NULL),(235,66,3,'2026-06-12',NULL),(236,65,2,'2026-06-12',NULL),(237,64,1,'2026-06-12',NULL),(238,63,1,'2026-06-12',NULL),(239,62,1,'2026-06-12',NULL),(240,61,2,'2026-06-12',NULL),(241,60,1,'2026-06-12',NULL),(242,59,2,'2026-06-12',NULL),(243,58,1,'2026-06-12',NULL),(244,57,1,'2026-06-12',NULL),(245,56,1,'2026-06-12',NULL),(246,55,1,'2026-06-12',NULL),(247,54,1,'2026-06-12',NULL),(248,53,1,'2026-06-12',NULL),(249,52,1,'2026-06-12',NULL),(250,51,1,'2026-06-12',NULL),(251,100,1,'2026-06-13',NULL),(252,99,1,'2026-06-13',NULL),(253,98,1,'2026-06-13',NULL),(254,97,1,'2026-06-13',NULL),(255,96,1,'2026-06-13',NULL),(256,95,1,'2026-06-13',NULL),(257,94,1,'2026-06-13',NULL),(258,93,1,'2026-06-13',NULL),(259,92,1,'2026-06-13',NULL),(260,91,1,'2026-06-13',NULL),(261,90,2,'2026-06-13',NULL),(262,89,1,'2026-06-13',NULL),(263,88,1,'2026-06-13',NULL),(264,87,1,'2026-06-13',NULL),(265,86,1,'2026-06-13',NULL),(266,85,1,'2026-06-13',NULL),(267,84,2,'2026-06-13',NULL),(268,83,2,'2026-06-13',NULL),(269,82,1,'2026-06-13',NULL),(270,81,1,'2026-06-13',NULL),(271,80,1,'2026-06-13',NULL),(272,79,2,'2026-06-13',NULL),(273,78,1,'2026-06-13',NULL),(274,77,1,'2026-06-13',NULL),(275,76,1,'2026-06-13',NULL),(276,75,1,'2026-06-13',NULL),(277,74,2,'2026-06-13',NULL),(278,73,1,'2026-06-13',NULL),(279,72,1,'2026-06-13',NULL),(280,71,1,'2026-06-13',NULL),(281,70,1,'2026-06-13',NULL),(282,69,1,'2026-06-13',NULL),(283,68,1,'2026-06-13',NULL),(284,67,4,'2026-06-13',NULL),(285,66,1,'2026-06-13',NULL),(286,65,1,'2026-06-13',NULL),(287,64,1,'2026-06-13',NULL),(288,63,1,'2026-06-13',NULL),(289,62,1,'2026-06-13',NULL),(290,61,1,'2026-06-13',NULL),(291,60,1,'2026-06-13',NULL),(292,59,1,'2026-06-13',NULL),(293,58,1,'2026-06-13',NULL),(294,57,1,'2026-06-13',NULL),(295,56,1,'2026-06-13',NULL),(296,55,1,'2026-06-13',NULL),(297,54,1,'2026-06-13',NULL),(298,53,2,'2026-06-13',NULL),(299,52,1,'2026-06-13',NULL),(300,51,1,'2026-06-13',NULL),(301,100,1,'2026-06-14',NULL),(302,99,1,'2026-06-14',NULL),(303,98,1,'2026-06-14',NULL),(304,97,2,'2026-06-14',NULL),(305,96,1,'2026-06-14',NULL),(306,95,1,'2026-06-14',NULL),(307,94,1,'2026-06-14',NULL),(308,93,1,'2026-06-14',NULL),(309,92,1,'2026-06-14',NULL),(310,91,1,'2026-06-14',NULL),(311,90,1,'2026-06-14',NULL),(312,89,1,'2026-06-14',NULL),(313,88,1,'2026-06-14',NULL),(314,87,1,'2026-06-14',NULL),(315,86,1,'2026-06-14',NULL),(316,85,3,'2026-06-14',NULL),(317,84,1,'2026-06-14',NULL),(318,83,1,'2026-06-14',NULL),(319,82,1,'2026-06-14',NULL),(320,81,1,'2026-06-14',NULL),(321,80,1,'2026-06-14',NULL),(322,79,1,'2026-06-14',NULL),(323,78,1,'2026-06-14',NULL),(324,77,1,'2026-06-14',NULL),(325,76,1,'2026-06-14',NULL),(326,75,1,'2026-06-14',NULL),(327,74,1,'2026-06-14',NULL),(328,73,2,'2026-06-14',NULL),(329,72,1,'2026-06-14',NULL),(330,71,1,'2026-06-14',NULL),(331,70,2,'2026-06-14',NULL),(332,69,1,'2026-06-14',NULL),(333,68,1,'2026-06-14',NULL),(334,67,1,'2026-06-14',NULL),(335,66,2,'2026-06-14',NULL),(336,65,1,'2026-06-14',NULL),(337,64,2,'2026-06-14',NULL),(338,63,1,'2026-06-14',NULL),(339,62,1,'2026-06-14',NULL),(340,61,1,'2026-06-14',NULL),(341,60,1,'2026-06-14',NULL),(342,59,1,'2026-06-14',NULL),(343,58,1,'2026-06-14',NULL),(344,57,1,'2026-06-14',NULL),(345,56,1,'2026-06-14',NULL),(346,55,1,'2026-06-14',NULL),(347,54,1,'2026-06-14',NULL),(348,53,1,'2026-06-14',NULL),(349,52,1,'2026-06-14',NULL),(350,51,1,'2026-06-14',NULL),(351,100,1,'2026-06-15',NULL),(352,99,1,'2026-06-15',NULL),(353,98,1,'2026-06-15',NULL),(354,97,1,'2026-06-15',NULL),(355,96,1,'2026-06-15',NULL),(356,95,1,'2026-06-15',NULL),(357,94,1,'2026-06-15',NULL),(358,93,1,'2026-06-15',NULL),(359,92,1,'2026-06-15',NULL),(360,91,1,'2026-06-15',NULL),(361,90,2,'2026-06-15',NULL),(362,89,1,'2026-06-15',NULL),(363,88,1,'2026-06-15',NULL),(364,87,1,'2026-06-15',NULL),(365,86,2,'2026-06-15',NULL),(366,85,1,'2026-06-15',NULL),(367,84,1,'2026-06-15',NULL),(368,83,2,'2026-06-15',NULL),(369,82,2,'2026-06-15',NULL),(370,81,1,'2026-06-15',NULL),(371,80,1,'2026-06-15',NULL),(372,79,2,'2026-06-15',NULL),(373,78,1,'2026-06-15',NULL),(374,77,2,'2026-06-15',NULL),(375,76,1,'2026-06-15',NULL),(376,75,1,'2026-06-15',NULL),(377,74,1,'2026-06-15',NULL),(378,73,2,'2026-06-15',NULL),(379,72,1,'2026-06-15',NULL),(380,71,2,'2026-06-15',NULL),(381,70,1,'2026-06-15',NULL),(382,69,1,'2026-06-15',NULL),(383,68,1,'2026-06-15',NULL),(384,67,1,'2026-06-15',NULL),(385,66,1,'2026-06-15',NULL),(386,65,2,'2026-06-15',NULL),(387,64,1,'2026-06-15',NULL),(388,63,1,'2026-06-15',NULL),(389,62,2,'2026-06-15',NULL),(390,61,1,'2026-06-15',NULL),(391,60,1,'2026-06-15',NULL),(392,59,1,'2026-06-15',NULL),(393,58,1,'2026-06-15',NULL),(394,57,1,'2026-06-15',NULL),(395,56,1,'2026-06-15',NULL),(396,55,1,'2026-06-15',NULL),(397,54,1,'2026-06-15',NULL),(398,53,1,'2026-06-15',NULL),(399,52,1,'2026-06-15',NULL),(400,51,1,'2026-06-15',NULL),(401,100,1,'2026-06-16',NULL),(402,99,1,'2026-06-16',NULL),(403,98,1,'2026-06-16',NULL),(404,97,1,'2026-06-16',NULL),(405,96,1,'2026-06-16',NULL),(406,95,1,'2026-06-16',NULL),(407,94,1,'2026-06-16',NULL),(408,93,2,'2026-06-16',NULL),(409,92,2,'2026-06-16',NULL),(410,91,1,'2026-06-16',NULL),(411,90,1,'2026-06-16',NULL),(412,89,1,'2026-06-16',NULL),(413,88,3,'2026-06-16',NULL),(414,87,1,'2026-06-16',NULL),(415,86,1,'2026-06-16',NULL),(416,85,1,'2026-06-16',NULL),(417,84,2,'2026-06-16',NULL),(418,83,1,'2026-06-16',NULL),(419,82,1,'2026-06-16',NULL),(420,81,1,'2026-06-16',NULL),(421,80,1,'2026-06-16',NULL),(422,79,1,'2026-06-16',NULL),(423,78,1,'2026-06-16',NULL),(424,77,1,'2026-06-16',NULL),(425,76,1,'2026-06-16',NULL),(426,75,1,'2026-06-16',NULL),(427,74,1,'2026-06-16',NULL),(428,73,1,'2026-06-16',NULL),(429,72,1,'2026-06-16',NULL),(430,71,1,'2026-06-16',NULL),(431,70,3,'2026-06-16',NULL),(432,69,1,'2026-06-16',NULL),(433,68,2,'2026-06-16',NULL),(434,67,1,'2026-06-16',NULL),(435,66,1,'2026-06-16',NULL),(436,65,1,'2026-06-16',NULL),(437,64,1,'2026-06-16',NULL),(438,63,1,'2026-06-16',NULL),(439,62,1,'2026-06-16',NULL),(440,61,1,'2026-06-16',NULL),(441,60,1,'2026-06-16',NULL),(442,59,2,'2026-06-16',NULL),(443,58,1,'2026-06-16',NULL),(444,57,1,'2026-06-16',NULL),(445,56,1,'2026-06-16',NULL),(446,55,1,'2026-06-16',NULL),(447,54,1,'2026-06-16',NULL),(448,53,1,'2026-06-16',NULL),(449,52,1,'2026-06-16',NULL),(450,51,1,'2026-06-16',NULL),(451,100,1,'2026-06-17',NULL),(452,99,2,'2026-06-17',NULL),(453,98,1,'2026-06-17',NULL),(454,97,2,'2026-06-17',NULL),(455,96,1,'2026-06-17',NULL),(456,95,3,'2026-06-17',NULL),(457,94,1,'2026-06-17',NULL),(458,93,1,'2026-06-17',NULL),(459,92,2,'2026-06-17',NULL),(460,91,1,'2026-06-17',NULL),(461,90,2,'2026-06-17',NULL),(462,89,2,'2026-06-17',NULL),(463,88,1,'2026-06-17',NULL),(464,87,1,'2026-06-17',NULL),(465,86,1,'2026-06-17',NULL),(466,85,1,'2026-06-17',NULL),(467,84,1,'2026-06-17',NULL),(468,83,1,'2026-06-17',NULL),(469,82,1,'2026-06-17',NULL),(470,81,1,'2026-06-17',NULL),(471,80,1,'2026-06-17',NULL),(472,79,2,'2026-06-17',NULL),(473,78,1,'2026-06-17',NULL),(474,77,2,'2026-06-17',NULL),(475,76,1,'2026-06-17',NULL),(476,75,1,'2026-06-17',NULL),(477,74,2,'2026-06-17',NULL),(478,73,1,'2026-06-17',NULL),(479,72,1,'2026-06-17',NULL),(480,71,1,'2026-06-17',NULL),(481,70,1,'2026-06-17',NULL),(482,69,1,'2026-06-17',NULL),(483,68,2,'2026-06-17',NULL),(484,67,1,'2026-06-17',NULL),(485,66,1,'2026-06-17',NULL),(486,65,1,'2026-06-17',NULL),(487,64,2,'2026-06-17',NULL),(488,63,1,'2026-06-17',NULL),(489,62,1,'2026-06-17',NULL),(490,61,1,'2026-06-17',NULL),(491,60,1,'2026-06-17',NULL),(492,59,1,'2026-06-17',NULL),(493,58,1,'2026-06-17',NULL),(494,57,2,'2026-06-17',NULL),(495,56,1,'2026-06-17',NULL),(496,55,1,'2026-06-17',NULL),(497,54,1,'2026-06-17',NULL),(498,53,1,'2026-06-17',NULL),(499,52,1,'2026-06-17',NULL),(500,51,1,'2026-06-17',NULL),(501,100,1,'2026-06-18',NULL),(502,99,2,'2026-06-18',NULL),(503,98,1,'2026-06-18',NULL),(504,97,1,'2026-06-18',NULL),(505,96,1,'2026-06-18',NULL),(506,95,1,'2026-06-18',NULL),(507,94,1,'2026-06-18',NULL),(508,93,1,'2026-06-18',NULL),(509,92,1,'2026-06-18',NULL),(510,91,2,'2026-06-18',NULL),(511,90,1,'2026-06-18',NULL),(512,89,1,'2026-06-18',NULL),(513,88,1,'2026-06-18',NULL),(514,87,1,'2026-06-18',NULL),(515,86,1,'2026-06-18',NULL),(516,85,1,'2026-06-18',NULL),(517,84,1,'2026-06-18',NULL),(518,83,1,'2026-06-18',NULL),(519,82,1,'2026-06-18',NULL),(520,81,1,'2026-06-18',NULL),(521,80,2,'2026-06-18',NULL),(522,79,1,'2026-06-18',NULL),(523,78,1,'2026-06-18',NULL),(524,77,1,'2026-06-18',NULL),(525,76,1,'2026-06-18',NULL),(526,75,2,'2026-06-18',NULL),(527,74,1,'2026-06-18',NULL),(528,73,1,'2026-06-18',NULL),(529,72,1,'2026-06-18',NULL),(530,71,1,'2026-06-18',NULL),(531,70,1,'2026-06-18',NULL),(532,69,1,'2026-06-18',NULL),(533,68,1,'2026-06-18',NULL),(534,67,1,'2026-06-18',NULL),(535,66,1,'2026-06-18',NULL),(536,65,1,'2026-06-18',NULL),(537,64,2,'2026-06-18',NULL),(538,63,1,'2026-06-18',NULL),(539,62,1,'2026-06-18',NULL),(540,61,1,'2026-06-18',NULL),(541,60,1,'2026-06-18',NULL),(542,59,1,'2026-06-18',NULL),(543,58,1,'2026-06-18',NULL),(544,57,1,'2026-06-18',NULL),(545,56,1,'2026-06-18',NULL),(546,55,2,'2026-06-18',NULL),(547,54,1,'2026-06-18',NULL),(548,53,1,'2026-06-18',NULL),(549,52,1,'2026-06-18',NULL),(550,51,1,'2026-06-18',NULL),(551,100,1,'2026-06-19',NULL),(552,99,1,'2026-06-19',NULL),(553,98,1,'2026-06-19',NULL),(554,97,1,'2026-06-19',NULL),(555,96,1,'2026-06-19',NULL),(556,95,2,'2026-06-19',NULL),(557,94,1,'2026-06-19',NULL),(558,93,1,'2026-06-19',NULL),(559,92,1,'2026-06-19',NULL),(560,91,1,'2026-06-19',NULL),(561,90,2,'2026-06-19',NULL),(562,89,1,'2026-06-19',NULL),(563,88,1,'2026-06-19',NULL),(564,87,1,'2026-06-19',NULL),(565,86,1,'2026-06-19',NULL),(566,85,1,'2026-06-19',NULL),(567,84,1,'2026-06-19',NULL),(568,83,2,'2026-06-19',NULL),(569,82,2,'2026-06-19',NULL),(570,81,1,'2026-06-19',NULL),(571,80,1,'2026-06-19',NULL),(572,79,1,'2026-06-19',NULL),(573,78,1,'2026-06-19',NULL),(574,77,1,'2026-06-19',NULL),(575,76,1,'2026-06-19',NULL),(576,75,1,'2026-06-19',NULL),(577,74,1,'2026-06-19',NULL),(578,73,1,'2026-06-19',NULL),(579,72,1,'2026-06-19',NULL),(580,71,1,'2026-06-19',NULL),(581,70,1,'2026-06-19',NULL),(582,69,1,'2026-06-19',NULL),(583,68,1,'2026-06-19',NULL),(584,67,1,'2026-06-19',NULL),(585,66,2,'2026-06-19',NULL),(586,65,1,'2026-06-19',NULL),(587,64,1,'2026-06-19',NULL),(588,63,1,'2026-06-19',NULL),(589,62,1,'2026-06-19',NULL),(590,61,2,'2026-06-19',NULL),(591,60,2,'2026-06-19',NULL),(592,59,1,'2026-06-19',NULL),(593,58,1,'2026-06-19',NULL),(594,57,1,'2026-06-19',NULL),(595,56,2,'2026-06-19',NULL),(596,55,1,'2026-06-19',NULL),(597,54,2,'2026-06-19',NULL),(598,53,1,'2026-06-19',NULL),(599,52,1,'2026-06-19',NULL),(600,51,1,'2026-06-19',NULL),(601,100,1,'2026-06-20',NULL),(602,99,1,'2026-06-20',NULL),(603,98,1,'2026-06-20',NULL),(604,97,1,'2026-06-20',NULL),(605,96,1,'2026-06-20',NULL),(606,95,1,'2026-06-20',NULL),(607,94,1,'2026-06-20',NULL),(608,93,1,'2026-06-20',NULL),(609,92,2,'2026-06-20',NULL),(610,91,1,'2026-06-20',NULL),(611,90,1,'2026-06-20',NULL),(612,89,1,'2026-06-20',NULL),(613,88,2,'2026-06-20',NULL),(614,87,1,'2026-06-20',NULL),(615,86,1,'2026-06-20',NULL),(616,85,1,'2026-06-20',NULL),(617,84,1,'2026-06-20',NULL),(618,83,1,'2026-06-20',NULL),(619,82,1,'2026-06-20',NULL),(620,81,1,'2026-06-20',NULL),(621,80,1,'2026-06-20',NULL),(622,79,1,'2026-06-20',NULL),(623,78,1,'2026-06-20',NULL),(624,77,1,'2026-06-20',NULL),(625,76,1,'2026-06-20',NULL),(626,75,1,'2026-06-20',NULL),(627,74,1,'2026-06-20',NULL),(628,73,2,'2026-06-20',NULL),(629,72,1,'2026-06-20',NULL),(630,71,2,'2026-06-20',NULL),(631,70,1,'2026-06-20',NULL),(632,69,1,'2026-06-20',NULL),(633,68,1,'2026-06-20',NULL),(634,67,1,'2026-06-20',NULL),(635,66,1,'2026-06-20',NULL),(636,65,1,'2026-06-20',NULL),(637,64,1,'2026-06-20',NULL),(638,63,1,'2026-06-20',NULL),(639,62,1,'2026-06-20',NULL),(640,61,1,'2026-06-20',NULL),(641,60,1,'2026-06-20',NULL),(642,59,2,'2026-06-20',NULL),(643,58,1,'2026-06-20',NULL),(644,57,1,'2026-06-20',NULL),(645,56,1,'2026-06-20',NULL),(646,55,1,'2026-06-20',NULL),(647,54,1,'2026-06-20',NULL),(648,53,1,'2026-06-20',NULL),(649,52,1,'2026-06-20',NULL),(650,51,2,'2026-06-20',NULL),(651,100,1,'2026-06-21',NULL),(652,99,1,'2026-06-21',NULL),(653,98,1,'2026-06-21',NULL),(654,97,2,'2026-06-21',NULL),(655,96,1,'2026-06-21',NULL),(656,95,1,'2026-06-21',NULL),(657,94,1,'2026-06-21',NULL),(658,93,1,'2026-06-21',NULL),(659,92,1,'2026-06-21',NULL),(660,91,2,'2026-06-21',NULL),(661,90,2,'2026-06-21',NULL),(662,89,2,'2026-06-21',NULL),(663,88,1,'2026-06-21',NULL),(664,87,1,'2026-06-21',NULL),(665,86,2,'2026-06-21',NULL),(666,85,1,'2026-06-21',NULL),(667,84,1,'2026-06-21',NULL),(668,83,1,'2026-06-21',NULL),(669,82,1,'2026-06-21',NULL),(670,81,1,'2026-06-21',NULL),(671,80,1,'2026-06-21',NULL),(672,79,1,'2026-06-21',NULL),(673,78,1,'2026-06-21',NULL),(674,77,1,'2026-06-21',NULL),(675,76,1,'2026-06-21',NULL),(676,75,1,'2026-06-21',NULL),(677,74,1,'2026-06-21',NULL),(678,73,1,'2026-06-21',NULL),(679,72,1,'2026-06-21',NULL),(680,71,1,'2026-06-21',NULL),(681,70,1,'2026-06-21',NULL),(682,69,2,'2026-06-21',NULL),(683,68,1,'2026-06-21',NULL),(684,67,1,'2026-06-21',NULL),(685,66,1,'2026-06-21',NULL),(686,65,2,'2026-06-21',NULL),(687,64,2,'2026-06-21',NULL),(688,63,2,'2026-06-21',NULL),(689,62,1,'2026-06-21',NULL),(690,61,1,'2026-06-21',NULL),(691,60,1,'2026-06-21',NULL),(692,59,1,'2026-06-21',NULL),(693,58,1,'2026-06-21',NULL),(694,57,1,'2026-06-21',NULL),(695,56,1,'2026-06-21',NULL),(696,55,2,'2026-06-21',NULL),(697,54,2,'2026-06-21',NULL),(698,53,1,'2026-06-21',NULL),(699,52,2,'2026-06-21',NULL),(700,51,2,'2026-06-21',NULL),(701,100,1,'2026-06-22',NULL),(702,99,1,'2026-06-22',NULL),(703,98,1,'2026-06-22',NULL),(704,97,1,'2026-06-22',NULL),(705,96,1,'2026-06-22',NULL),(706,95,1,'2026-06-22',NULL),(707,94,2,'2026-06-22',NULL),(708,93,1,'2026-06-22',NULL),(709,92,1,'2026-06-22',NULL),(710,91,1,'2026-06-22',NULL),(711,90,1,'2026-06-22',NULL),(712,89,1,'2026-06-22',NULL),(713,88,1,'2026-06-22',NULL),(714,87,2,'2026-06-22',NULL),(715,86,1,'2026-06-22',NULL),(716,85,1,'2026-06-22',NULL),(717,84,1,'2026-06-22',NULL),(718,83,1,'2026-06-22',NULL),(719,82,1,'2026-06-22',NULL),(720,81,1,'2026-06-22',NULL),(721,80,1,'2026-06-22',NULL),(722,79,1,'2026-06-22',NULL),(723,78,1,'2026-06-22',NULL),(724,77,1,'2026-06-22',NULL),(725,76,1,'2026-06-22',NULL),(726,75,1,'2026-06-22',NULL),(727,74,1,'2026-06-22',NULL),(728,73,1,'2026-06-22',NULL),(729,72,1,'2026-06-22',NULL),(730,71,2,'2026-06-22',NULL),(731,70,1,'2026-06-22',NULL),(732,69,1,'2026-06-22',NULL),(733,68,1,'2026-06-22',NULL),(734,67,1,'2026-06-22',NULL),(735,66,1,'2026-06-22',NULL),(736,65,1,'2026-06-22',NULL),(737,64,1,'2026-06-22',NULL),(738,63,1,'2026-06-22',NULL),(739,62,2,'2026-06-22',NULL),(740,61,3,'2026-06-22',NULL),(741,60,1,'2026-06-22',NULL),(742,59,1,'2026-06-22',NULL),(743,58,1,'2026-06-22',NULL),(744,57,1,'2026-06-22',NULL),(745,56,1,'2026-06-22',NULL),(746,55,2,'2026-06-22',NULL),(747,54,1,'2026-06-22',NULL),(748,53,1,'2026-06-22',NULL),(749,52,1,'2026-06-22',NULL),(750,51,1,'2026-06-22',NULL),(751,100,1,'2026-06-23',NULL),(752,99,1,'2026-06-23',NULL),(753,98,1,'2026-06-23',NULL),(754,97,1,'2026-06-23',NULL),(755,96,2,'2026-06-23',NULL),(756,95,2,'2026-06-23',NULL),(757,94,1,'2026-06-23',NULL),(758,93,1,'2026-06-23',NULL),(759,92,2,'2026-06-23',NULL),(760,91,1,'2026-06-23',NULL),(761,90,1,'2026-06-23',NULL),(762,89,1,'2026-06-23',NULL),(763,88,1,'2026-06-23',NULL),(764,87,1,'2026-06-23',NULL),(765,86,1,'2026-06-23',NULL),(766,85,1,'2026-06-23',NULL),(767,84,1,'2026-06-23',NULL),(768,83,1,'2026-06-23',NULL),(769,82,1,'2026-06-23',NULL),(770,81,1,'2026-06-23',NULL),(771,80,1,'2026-06-23',NULL),(772,79,1,'2026-06-23',NULL),(773,78,1,'2026-06-23',NULL),(774,77,1,'2026-06-23',NULL),(775,76,1,'2026-06-23',NULL),(776,75,1,'2026-06-23',NULL),(777,74,1,'2026-06-23',NULL),(778,73,2,'2026-06-23',NULL),(779,72,1,'2026-06-23',NULL),(780,71,1,'2026-06-23',NULL),(781,70,2,'2026-06-23',NULL),(782,69,1,'2026-06-23',NULL),(783,68,1,'2026-06-23',NULL),(784,67,2,'2026-06-23',NULL),(785,66,1,'2026-06-23',NULL),(786,65,1,'2026-06-23',NULL),(787,64,1,'2026-06-23',NULL),(788,63,1,'2026-06-23',NULL),(789,62,1,'2026-06-23',NULL),(790,61,1,'2026-06-23',NULL),(791,60,2,'2026-06-23',NULL),(792,59,1,'2026-06-23',NULL),(793,58,2,'2026-06-23',NULL),(794,57,1,'2026-06-23',NULL),(795,56,1,'2026-06-23',NULL),(796,55,1,'2026-06-23',NULL),(797,54,1,'2026-06-23',NULL),(798,53,1,'2026-06-23',NULL),(799,52,1,'2026-06-23',NULL),(800,51,1,'2026-06-23',NULL),(801,100,2,'2026-06-24',NULL),(802,99,1,'2026-06-24',NULL),(803,98,1,'2026-06-24',NULL),(804,97,1,'2026-06-24',NULL),(805,96,1,'2026-06-24',NULL),(806,95,1,'2026-06-24',NULL),(807,94,2,'2026-06-24',NULL),(808,93,1,'2026-06-24',NULL),(809,92,2,'2026-06-24',NULL),(810,91,1,'2026-06-24',NULL),(811,90,1,'2026-06-24',NULL),(812,89,1,'2026-06-24',NULL),(813,88,1,'2026-06-24',NULL),(814,87,1,'2026-06-24',NULL),(815,86,1,'2026-06-24',NULL),(816,85,2,'2026-06-24',NULL),(817,84,2,'2026-06-24',NULL),(818,83,1,'2026-06-24',NULL),(819,82,1,'2026-06-24',NULL),(820,81,1,'2026-06-24',NULL),(821,80,2,'2026-06-24',NULL),(822,79,2,'2026-06-24',NULL),(823,78,1,'2026-06-24',NULL),(824,77,1,'2026-06-24',NULL),(825,76,2,'2026-06-24',NULL),(826,75,1,'2026-06-24',NULL),(827,74,1,'2026-06-24',NULL),(828,73,1,'2026-06-24',NULL),(829,72,1,'2026-06-24',NULL),(830,71,1,'2026-06-24',NULL),(831,70,2,'2026-06-24',NULL),(832,69,1,'2026-06-24',NULL),(833,68,1,'2026-06-24',NULL),(834,67,1,'2026-06-24',NULL),(835,66,1,'2026-06-24',NULL),(836,65,1,'2026-06-24',NULL),(837,64,1,'2026-06-24',NULL),(838,63,1,'2026-06-24',NULL),(839,62,1,'2026-06-24',NULL),(840,61,1,'2026-06-24',NULL),(841,60,1,'2026-06-24',NULL),(842,59,1,'2026-06-24',NULL),(843,58,2,'2026-06-24',NULL),(844,57,1,'2026-06-24',NULL),(845,56,1,'2026-06-24',NULL),(846,55,1,'2026-06-24',NULL),(847,54,1,'2026-06-24',NULL),(848,53,1,'2026-06-24',NULL),(849,52,1,'2026-06-24',NULL),(850,51,1,'2026-06-24',NULL),(851,100,1,'2026-06-25',NULL),(852,99,2,'2026-06-25',NULL),(853,98,1,'2026-06-25',NULL),(854,97,1,'2026-06-25',NULL),(855,96,1,'2026-06-25',NULL),(856,95,1,'2026-06-25',NULL),(857,94,1,'2026-06-25',NULL),(858,93,1,'2026-06-25',NULL),(859,92,2,'2026-06-25',NULL),(860,91,1,'2026-06-25',NULL),(861,90,1,'2026-06-25',NULL),(862,89,1,'2026-06-25',NULL),(863,88,2,'2026-06-25',NULL),(864,87,1,'2026-06-25',NULL),(865,86,1,'2026-06-25',NULL),(866,85,2,'2026-06-25',NULL),(867,84,1,'2026-06-25',NULL),(868,83,2,'2026-06-25',NULL),(869,82,1,'2026-06-25',NULL),(870,81,1,'2026-06-25',NULL),(871,80,1,'2026-06-25',NULL),(872,79,2,'2026-06-25',NULL),(873,78,1,'2026-06-25',NULL),(874,77,1,'2026-06-25',NULL),(875,76,1,'2026-06-25',NULL),(876,75,1,'2026-06-25',NULL),(877,74,1,'2026-06-25',NULL),(878,73,1,'2026-06-25',NULL),(879,72,1,'2026-06-25',NULL),(880,71,1,'2026-06-25',NULL),(881,70,1,'2026-06-25',NULL),(882,69,1,'2026-06-25',NULL),(883,68,2,'2026-06-25',NULL),(884,67,1,'2026-06-25',NULL),(885,66,1,'2026-06-25',NULL),(886,65,2,'2026-06-25',NULL),(887,64,1,'2026-06-25',NULL),(888,63,1,'2026-06-25',NULL),(889,62,1,'2026-06-25',NULL),(890,61,1,'2026-06-25',NULL),(891,60,1,'2026-06-25',NULL),(892,59,1,'2026-06-25',NULL),(893,58,1,'2026-06-25',NULL),(894,57,1,'2026-06-25',NULL),(895,56,1,'2026-06-25',NULL),(896,55,1,'2026-06-25',NULL),(897,54,1,'2026-06-25',NULL),(898,53,1,'2026-06-25',NULL),(899,52,1,'2026-06-25',NULL),(900,51,1,'2026-06-25',NULL),(901,100,1,'2026-06-26',NULL),(902,99,1,'2026-06-26',NULL),(903,98,1,'2026-06-26',NULL),(904,97,2,'2026-06-26',NULL),(905,96,1,'2026-06-26',NULL),(906,95,1,'2026-06-26',NULL),(907,94,1,'2026-06-26',NULL),(908,93,2,'2026-06-26',NULL),(909,92,1,'2026-06-26',NULL),(910,91,1,'2026-06-26',NULL),(911,90,1,'2026-06-26',NULL),(912,89,1,'2026-06-26',NULL),(913,88,1,'2026-06-26',NULL),(914,87,1,'2026-06-26',NULL),(915,86,1,'2026-06-26',NULL),(916,85,1,'2026-06-26',NULL),(917,84,1,'2026-06-26',NULL),(918,83,1,'2026-06-26',NULL),(919,82,1,'2026-06-26',NULL),(920,81,1,'2026-06-26',NULL),(921,80,2,'2026-06-26',NULL),(922,79,1,'2026-06-26',NULL),(923,78,1,'2026-06-26',NULL),(924,77,1,'2026-06-26',NULL),(925,76,2,'2026-06-26',NULL),(926,75,1,'2026-06-26',NULL),(927,74,1,'2026-06-26',NULL),(928,73,1,'2026-06-26',NULL),(929,72,1,'2026-06-26',NULL),(930,71,1,'2026-06-26',NULL),(931,70,1,'2026-06-26',NULL),(932,69,1,'2026-06-26',NULL),(933,68,1,'2026-06-26',NULL),(934,67,1,'2026-06-26',NULL),(935,66,1,'2026-06-26',NULL),(936,65,2,'2026-06-26',NULL),(937,64,1,'2026-06-26',NULL),(938,63,1,'2026-06-26',NULL),(939,62,1,'2026-06-26',NULL),(940,61,2,'2026-06-26',NULL),(941,60,1,'2026-06-26',NULL),(942,59,1,'2026-06-26',NULL),(943,58,2,'2026-06-26',NULL),(944,57,1,'2026-06-26',NULL),(945,56,1,'2026-06-26',NULL),(946,55,1,'2026-06-26',NULL),(947,54,1,'2026-06-26',NULL),(948,53,1,'2026-06-26',NULL),(949,52,1,'2026-06-26',NULL),(950,51,2,'2026-06-26',NULL),(951,100,1,'2026-06-27',NULL),(952,99,1,'2026-06-27',NULL),(953,98,1,'2026-06-27',NULL),(954,97,1,'2026-06-27',NULL),(955,96,1,'2026-06-27',NULL),(956,95,1,'2026-06-27',NULL),(957,94,1,'2026-06-27',NULL),(958,93,1,'2026-06-27',NULL),(959,92,2,'2026-06-27',NULL),(960,91,1,'2026-06-27',NULL),(961,90,2,'2026-06-27',NULL),(962,89,2,'2026-06-27',NULL),(963,88,2,'2026-06-27',NULL),(964,87,1,'2026-06-27',NULL),(965,86,1,'2026-06-27',NULL),(966,85,1,'2026-06-27',NULL),(967,84,1,'2026-06-27',NULL),(968,83,1,'2026-06-27',NULL),(969,82,1,'2026-06-27',NULL),(970,81,1,'2026-06-27',NULL),(971,80,1,'2026-06-27',NULL),(972,79,1,'2026-06-27',NULL),(973,78,1,'2026-06-27',NULL),(974,77,1,'2026-06-27',NULL),(975,76,1,'2026-06-27',NULL),(976,75,1,'2026-06-27',NULL),(977,74,1,'2026-06-27',NULL),(978,73,2,'2026-06-27',NULL),(979,72,1,'2026-06-27',NULL),(980,71,2,'2026-06-27',NULL),(981,70,2,'2026-06-27',NULL),(982,69,1,'2026-06-27',NULL),(983,68,1,'2026-06-27',NULL),(984,67,1,'2026-06-27',NULL),(985,66,1,'2026-06-27',NULL),(986,65,1,'2026-06-27',NULL),(987,64,1,'2026-06-27',NULL),(988,63,1,'2026-06-27',NULL),(989,62,2,'2026-06-27',NULL),(990,61,2,'2026-06-27',NULL),(991,60,1,'2026-06-27',NULL),(992,59,1,'2026-06-27',NULL),(993,58,1,'2026-06-27',NULL),(994,57,1,'2026-06-27',NULL),(995,56,1,'2026-06-27',NULL),(996,55,1,'2026-06-27',NULL),(997,54,1,'2026-06-27',NULL),(998,53,2,'2026-06-27',NULL),(999,52,1,'2026-06-27',NULL),(1000,51,1,'2026-06-27',NULL),(1001,100,1,'2026-06-28',NULL),(1002,99,1,'2026-06-28',NULL),(1003,98,1,'2026-06-28',NULL),(1004,97,1,'2026-06-28',NULL),(1005,96,2,'2026-06-28',NULL),(1006,95,1,'2026-06-28',NULL),(1007,94,1,'2026-06-28',NULL),(1008,93,1,'2026-06-28',NULL),(1009,92,1,'2026-06-28',NULL),(1010,91,2,'2026-06-28',NULL),(1011,90,1,'2026-06-28',NULL),(1012,89,3,'2026-06-28',NULL),(1013,88,1,'2026-06-28',NULL),(1014,87,1,'2026-06-28',NULL),(1015,86,1,'2026-06-28',NULL),(1016,85,1,'2026-06-28',NULL),(1017,84,1,'2026-06-28',NULL),(1018,83,1,'2026-06-28',NULL),(1019,82,2,'2026-06-28',NULL),(1020,81,1,'2026-06-28',NULL),(1021,80,1,'2026-06-28',NULL),(1022,79,1,'2026-06-28',NULL),(1023,78,1,'2026-06-28',NULL),(1024,77,1,'2026-06-28',NULL),(1025,76,1,'2026-06-28',NULL),(1026,75,1,'2026-06-28',NULL),(1027,74,1,'2026-06-28',NULL),(1028,73,1,'2026-06-28',NULL),(1029,72,1,'2026-06-28',NULL),(1030,71,1,'2026-06-28',NULL),(1031,70,1,'2026-06-28',NULL),(1032,69,1,'2026-06-28',NULL),(1033,68,1,'2026-06-28',NULL),(1034,67,1,'2026-06-28',NULL),(1035,66,1,'2026-06-28',NULL),(1036,65,1,'2026-06-28',NULL),(1037,64,1,'2026-06-28',NULL),(1038,63,1,'2026-06-28',NULL),(1039,62,2,'2026-06-28',NULL),(1040,61,1,'2026-06-28',NULL),(1041,60,1,'2026-06-28',NULL),(1042,59,1,'2026-06-28',NULL),(1043,58,1,'2026-06-28',NULL),(1044,57,1,'2026-06-28',NULL),(1045,56,1,'2026-06-28',NULL),(1046,55,1,'2026-06-28',NULL),(1047,54,1,'2026-06-28',NULL),(1048,53,1,'2026-06-28',NULL),(1049,52,1,'2026-06-28',NULL),(1050,51,2,'2026-06-28',NULL),(1051,100,1,'2026-06-29',NULL),(1052,99,1,'2026-06-29',NULL),(1053,98,1,'2026-06-29',NULL),(1054,97,1,'2026-06-29',NULL),(1055,96,1,'2026-06-29',NULL),(1056,95,1,'2026-06-29',NULL),(1057,94,1,'2026-06-29',NULL),(1058,93,1,'2026-06-29',NULL),(1059,92,1,'2026-06-29',NULL),(1060,91,1,'2026-06-29',NULL),(1061,90,2,'2026-06-29',NULL),(1062,89,1,'2026-06-29',NULL),(1063,88,1,'2026-06-29',NULL),(1064,87,1,'2026-06-29',NULL),(1065,86,1,'2026-06-29',NULL),(1066,85,1,'2026-06-29',NULL),(1067,84,1,'2026-06-29',NULL),(1068,83,1,'2026-06-29',NULL),(1069,82,1,'2026-06-29',NULL),(1070,81,2,'2026-06-29',NULL),(1071,80,1,'2026-06-29',NULL),(1072,79,1,'2026-06-29',NULL),(1073,78,2,'2026-06-29',NULL),(1074,77,1,'2026-06-29',NULL),(1075,76,2,'2026-06-29',NULL),(1076,75,1,'2026-06-29',NULL),(1077,74,1,'2026-06-29',NULL),(1078,73,1,'2026-06-29',NULL),(1079,72,1,'2026-06-29',NULL),(1080,71,1,'2026-06-29',NULL),(1081,70,1,'2026-06-29',NULL),(1082,69,1,'2026-06-29',NULL),(1083,68,1,'2026-06-29',NULL),(1084,67,1,'2026-06-29',NULL),(1085,66,2,'2026-06-29',NULL),(1086,65,1,'2026-06-29',NULL),(1087,64,1,'2026-06-29',NULL),(1088,63,1,'2026-06-29',NULL),(1089,62,1,'2026-06-29',NULL),(1090,61,1,'2026-06-29',NULL),(1091,60,1,'2026-06-29',NULL),(1092,59,2,'2026-06-29',NULL),(1093,58,2,'2026-06-29',NULL),(1094,57,1,'2026-06-29',NULL),(1095,56,1,'2026-06-29',NULL),(1096,55,1,'2026-06-29',NULL),(1097,54,1,'2026-06-29',NULL),(1098,53,1,'2026-06-29',NULL),(1099,52,1,'2026-06-29',NULL),(1100,51,1,'2026-06-29',NULL),(1101,100,1,'2026-06-30',NULL),(1102,99,1,'2026-06-30',NULL),(1103,98,2,'2026-06-30',NULL),(1104,97,1,'2026-06-30',NULL),(1105,96,1,'2026-06-30',NULL),(1106,95,2,'2026-06-30',NULL),(1107,94,1,'2026-06-30',NULL),(1108,93,1,'2026-06-30',NULL),(1109,92,1,'2026-06-30',NULL),(1110,91,1,'2026-06-30',NULL),(1111,90,1,'2026-06-30',NULL),(1112,89,2,'2026-06-30',NULL),(1113,88,1,'2026-06-30',NULL),(1114,87,2,'2026-06-30',NULL),(1115,86,1,'2026-06-30',NULL),(1116,85,1,'2026-06-30',NULL),(1117,84,1,'2026-06-30',NULL),(1118,83,1,'2026-06-30',NULL),(1119,82,1,'2026-06-30',NULL),(1120,81,1,'2026-06-30',NULL),(1121,80,1,'2026-06-30',NULL),(1122,79,2,'2026-06-30',NULL),(1123,78,1,'2026-06-30',NULL),(1124,77,1,'2026-06-30',NULL),(1125,76,1,'2026-06-30',NULL),(1126,75,1,'2026-06-30',NULL),(1127,74,2,'2026-06-30',NULL),(1128,73,1,'2026-06-30',NULL),(1129,72,1,'2026-06-30',NULL),(1130,71,1,'2026-06-30',NULL),(1131,70,1,'2026-06-30',NULL),(1132,69,1,'2026-06-30',NULL),(1133,68,1,'2026-06-30',NULL),(1134,67,1,'2026-06-30',NULL),(1135,66,1,'2026-06-30',NULL),(1136,65,1,'2026-06-30',NULL),(1137,64,1,'2026-06-30',NULL),(1138,63,1,'2026-06-30',NULL),(1139,62,1,'2026-06-30',NULL),(1140,61,1,'2026-06-30',NULL),(1141,60,1,'2026-06-30',NULL),(1142,59,1,'2026-06-30',NULL),(1143,58,1,'2026-06-30',NULL),(1144,57,1,'2026-06-30',NULL),(1145,56,1,'2026-06-30',NULL),(1146,55,1,'2026-06-30',NULL),(1147,54,1,'2026-06-30',NULL),(1148,53,1,'2026-06-30',NULL),(1149,52,1,'2026-06-30',NULL),(1150,51,1,'2026-06-30',NULL),(1151,100,1,'2026-07-01',NULL),(1152,99,1,'2026-07-01',NULL),(1153,98,1,'2026-07-01',NULL),(1154,97,1,'2026-07-01',NULL),(1155,96,1,'2026-07-01',NULL),(1156,95,2,'2026-07-01',NULL),(1157,94,1,'2026-07-01',NULL),(1158,93,1,'2026-07-01',NULL),(1159,92,2,'2026-07-01',NULL),(1160,91,1,'2026-07-01',NULL),(1161,90,1,'2026-07-01',NULL),(1162,89,1,'2026-07-01',NULL),(1163,88,1,'2026-07-01',NULL),(1164,87,2,'2026-07-01',NULL),(1165,86,1,'2026-07-01',NULL),(1166,85,2,'2026-07-01',NULL),(1167,84,2,'2026-07-01',NULL),(1168,83,1,'2026-07-01',NULL),(1169,82,1,'2026-07-01',NULL),(1170,81,1,'2026-07-01',NULL),(1171,80,1,'2026-07-01',NULL),(1172,79,1,'2026-07-01',NULL),(1173,78,1,'2026-07-01',NULL),(1174,77,1,'2026-07-01',NULL),(1175,76,2,'2026-07-01',NULL),(1176,75,1,'2026-07-01',NULL),(1177,74,1,'2026-07-01',NULL),(1178,73,1,'2026-07-01',NULL),(1179,72,1,'2026-07-01',NULL),(1180,71,2,'2026-07-01',NULL),(1181,70,2,'2026-07-01',NULL),(1182,69,1,'2026-07-01',NULL),(1183,68,1,'2026-07-01',NULL),(1184,67,1,'2026-07-01',NULL),(1185,66,1,'2026-07-01',NULL),(1186,65,1,'2026-07-01',NULL),(1187,64,1,'2026-07-01',NULL),(1188,63,1,'2026-07-01',NULL),(1189,62,1,'2026-07-01',NULL),(1190,61,1,'2026-07-01',NULL),(1191,60,1,'2026-07-01',NULL),(1192,59,1,'2026-07-01',NULL),(1193,58,1,'2026-07-01',NULL),(1194,57,1,'2026-07-01',NULL),(1195,56,1,'2026-07-01',NULL),(1196,55,2,'2026-07-01',NULL),(1197,54,1,'2026-07-01',NULL),(1198,53,1,'2026-07-01',NULL),(1199,52,1,'2026-07-01',NULL),(1200,51,1,'2026-07-01',NULL),(1201,100,1,'2026-07-02',NULL),(1202,99,1,'2026-07-02',NULL),(1203,98,1,'2026-07-02',NULL),(1204,97,1,'2026-07-02',NULL),(1205,96,1,'2026-07-02',NULL),(1206,95,1,'2026-07-02',NULL),(1207,94,1,'2026-07-02',NULL),(1208,93,1,'2026-07-02',NULL),(1209,92,1,'2026-07-02',NULL),(1210,91,1,'2026-07-02',NULL),(1211,90,1,'2026-07-02',NULL),(1212,89,1,'2026-07-02',NULL),(1213,88,1,'2026-07-02',NULL),(1214,87,1,'2026-07-02',NULL),(1215,86,1,'2026-07-02',NULL),(1216,85,1,'2026-07-02',NULL),(1217,84,1,'2026-07-02',NULL),(1218,83,2,'2026-07-02',NULL),(1219,82,1,'2026-07-02',NULL),(1220,81,1,'2026-07-02',NULL),(1221,80,1,'2026-07-02',NULL),(1222,79,1,'2026-07-02',NULL),(1223,78,1,'2026-07-02',NULL),(1224,77,1,'2026-07-02',NULL),(1225,76,1,'2026-07-02',NULL),(1226,75,1,'2026-07-02',NULL),(1227,74,1,'2026-07-02',NULL),(1228,73,1,'2026-07-02',NULL),(1229,72,1,'2026-07-02',NULL),(1230,71,2,'2026-07-02',NULL),(1231,70,1,'2026-07-02',NULL),(1232,69,1,'2026-07-02',NULL),(1233,68,1,'2026-07-02',NULL),(1234,67,1,'2026-07-02',NULL),(1235,66,1,'2026-07-02',NULL),(1236,65,1,'2026-07-02',NULL),(1237,64,1,'2026-07-02',NULL),(1238,63,1,'2026-07-02',NULL),(1239,62,1,'2026-07-02',NULL),(1240,61,1,'2026-07-02',NULL),(1241,60,1,'2026-07-02',NULL),(1242,59,1,'2026-07-02',NULL),(1243,58,1,'2026-07-02',NULL),(1244,57,1,'2026-07-02',NULL),(1245,56,1,'2026-07-02',NULL),(1246,55,1,'2026-07-02',NULL),(1247,54,1,'2026-07-02',NULL),(1248,53,1,'2026-07-02',NULL),(1249,52,2,'2026-07-02',NULL),(1250,51,1,'2026-07-02',NULL),(1251,100,1,'2026-07-03',NULL),(1252,99,1,'2026-07-03',NULL),(1253,98,1,'2026-07-03',NULL),(1254,97,1,'2026-07-03',NULL),(1255,96,2,'2026-07-03',NULL),(1256,95,1,'2026-07-03',NULL),(1257,94,1,'2026-07-03',NULL),(1258,93,2,'2026-07-03',NULL),(1259,92,1,'2026-07-03',NULL),(1260,91,1,'2026-07-03',NULL),(1261,90,1,'2026-07-03',NULL),(1262,89,1,'2026-07-03',NULL),(1263,88,1,'2026-07-03',NULL),(1264,87,2,'2026-07-03',NULL),(1265,86,1,'2026-07-03',NULL),(1266,85,1,'2026-07-03',NULL),(1267,84,1,'2026-07-03',NULL),(1268,83,1,'2026-07-03',NULL),(1269,82,1,'2026-07-03',NULL),(1270,81,1,'2026-07-03',NULL),(1271,80,1,'2026-07-03',NULL),(1272,79,1,'2026-07-03',NULL),(1273,78,2,'2026-07-03',NULL),(1274,77,1,'2026-07-03',NULL),(1275,76,1,'2026-07-03',NULL),(1276,75,1,'2026-07-03',NULL),(1277,74,1,'2026-07-03',NULL),(1278,73,1,'2026-07-03',NULL),(1279,72,1,'2026-07-03',NULL),(1280,71,1,'2026-07-03',NULL),(1281,70,1,'2026-07-03',NULL),(1282,69,1,'2026-07-03',NULL),(1283,68,1,'2026-07-03',NULL),(1284,67,1,'2026-07-03',NULL),(1285,66,1,'2026-07-03',NULL),(1286,65,1,'2026-07-03',NULL),(1287,64,1,'2026-07-03',NULL),(1288,63,2,'2026-07-03',NULL),(1289,62,1,'2026-07-03',NULL),(1290,61,1,'2026-07-03',NULL),(1291,60,1,'2026-07-03',NULL),(1292,59,1,'2026-07-03',NULL),(1293,58,1,'2026-07-03',NULL),(1294,57,2,'2026-07-03',NULL),(1295,56,1,'2026-07-03',NULL),(1296,55,1,'2026-07-03',NULL),(1297,54,1,'2026-07-03',NULL),(1298,53,1,'2026-07-03',NULL),(1299,52,2,'2026-07-03',NULL),(1300,51,1,'2026-07-03',NULL),(1301,100,1,'2026-07-04',NULL),(1302,99,1,'2026-07-04',NULL),(1303,98,1,'2026-07-04',NULL),(1304,97,1,'2026-07-04',NULL),(1305,96,1,'2026-07-04',NULL),(1306,95,1,'2026-07-04',NULL),(1307,94,1,'2026-07-04',NULL),(1308,93,2,'2026-07-04',NULL),(1309,92,1,'2026-07-04',NULL),(1310,91,1,'2026-07-04',NULL),(1311,90,1,'2026-07-04',NULL),(1312,89,1,'2026-07-04',NULL),(1313,88,1,'2026-07-04',NULL),(1314,87,1,'2026-07-04',NULL),(1315,86,1,'2026-07-04',NULL),(1316,85,1,'2026-07-04',NULL),(1317,84,2,'2026-07-04',NULL),(1318,83,1,'2026-07-04',NULL),(1319,82,2,'2026-07-04',NULL),(1320,81,1,'2026-07-04',NULL),(1321,80,1,'2026-07-04',NULL),(1322,79,1,'2026-07-04',NULL),(1323,78,1,'2026-07-04',NULL),(1324,77,1,'2026-07-04',NULL),(1325,76,1,'2026-07-04',NULL),(1326,75,1,'2026-07-04',NULL),(1327,74,1,'2026-07-04',NULL),(1328,73,1,'2026-07-04',NULL),(1329,72,1,'2026-07-04',NULL),(1330,71,1,'2026-07-04',NULL),(1331,70,1,'2026-07-04',NULL),(1332,69,1,'2026-07-04',NULL),(1333,68,1,'2026-07-04',NULL),(1334,67,2,'2026-07-04',NULL),(1335,66,1,'2026-07-04',NULL),(1336,65,1,'2026-07-04',NULL),(1337,64,2,'2026-07-04',NULL),(1338,63,2,'2026-07-04',NULL),(1339,62,1,'2026-07-04',NULL),(1340,61,1,'2026-07-04',NULL),(1341,60,2,'2026-07-04',NULL),(1342,59,1,'2026-07-04',NULL),(1343,58,1,'2026-07-04',NULL),(1344,57,1,'2026-07-04',NULL),(1345,56,1,'2026-07-04',NULL),(1346,55,1,'2026-07-04',NULL),(1347,54,1,'2026-07-04',NULL),(1348,53,1,'2026-07-04',NULL),(1349,52,1,'2026-07-04',NULL),(1350,51,1,'2026-07-04',NULL),(1351,100,1,'2026-07-05',NULL),(1352,99,1,'2026-07-05',NULL),(1353,98,1,'2026-07-05',NULL),(1354,97,2,'2026-07-05',NULL),(1355,96,1,'2026-07-05',NULL),(1356,95,1,'2026-07-05',NULL),(1357,94,2,'2026-07-05',NULL),(1358,93,2,'2026-07-05',NULL),(1359,92,1,'2026-07-05',NULL),(1360,91,2,'2026-07-05',NULL),(1361,90,1,'2026-07-05',NULL),(1362,89,1,'2026-07-05',NULL),(1363,88,1,'2026-07-05',NULL),(1364,87,1,'2026-07-05',NULL),(1365,86,1,'2026-07-05',NULL),(1366,85,1,'2026-07-05',NULL),(1367,84,1,'2026-07-05',NULL),(1368,83,1,'2026-07-05',NULL),(1369,82,1,'2026-07-05',NULL),(1370,81,1,'2026-07-05',NULL),(1371,80,1,'2026-07-05',NULL),(1372,79,1,'2026-07-05',NULL),(1373,78,1,'2026-07-05',NULL),(1374,77,2,'2026-07-05',NULL),(1375,76,1,'2026-07-05',NULL),(1376,75,1,'2026-07-05',NULL),(1377,74,1,'2026-07-05',NULL),(1378,73,1,'2026-07-05',NULL),(1379,72,1,'2026-07-05',NULL),(1380,71,1,'2026-07-05',NULL),(1381,70,1,'2026-07-05',NULL),(1382,69,1,'2026-07-05',NULL),(1383,68,1,'2026-07-05',NULL),(1384,67,1,'2026-07-05',NULL),(1385,66,2,'2026-07-05',NULL),(1386,65,1,'2026-07-05',NULL),(1387,64,1,'2026-07-05',NULL),(1388,63,1,'2026-07-05',NULL),(1389,62,1,'2026-07-05',NULL),(1390,61,1,'2026-07-05',NULL),(1391,60,1,'2026-07-05',NULL),(1392,59,1,'2026-07-05',NULL),(1393,58,2,'2026-07-05',NULL),(1394,57,1,'2026-07-05',NULL),(1395,56,1,'2026-07-05',NULL),(1396,55,1,'2026-07-05',NULL),(1397,54,1,'2026-07-05',NULL),(1398,53,2,'2026-07-05',NULL),(1399,52,2,'2026-07-05',NULL),(1400,51,2,'2026-07-05',NULL),(1401,100,1,'2026-07-06',NULL),(1402,99,1,'2026-07-06',NULL),(1403,98,1,'2026-07-06',NULL),(1404,97,1,'2026-07-06',NULL),(1405,96,1,'2026-07-06',NULL),(1406,95,1,'2026-07-06',NULL),(1407,94,1,'2026-07-06',NULL),(1408,93,1,'2026-07-06',NULL),(1409,92,1,'2026-07-06',NULL),(1410,91,1,'2026-07-06',NULL),(1411,90,1,'2026-07-06',NULL),(1412,89,1,'2026-07-06',NULL),(1413,88,1,'2026-07-06',NULL),(1414,87,1,'2026-07-06',NULL),(1415,86,1,'2026-07-06',NULL),(1416,85,1,'2026-07-06',NULL),(1417,84,1,'2026-07-06',NULL),(1418,83,1,'2026-07-06',NULL),(1419,82,1,'2026-07-06',NULL),(1420,81,1,'2026-07-06',NULL),(1421,80,1,'2026-07-06',NULL),(1422,79,1,'2026-07-06',NULL),(1423,78,1,'2026-07-06',NULL),(1424,77,1,'2026-07-06',NULL),(1425,76,2,'2026-07-06',NULL),(1426,75,1,'2026-07-06',NULL),(1427,74,2,'2026-07-06',NULL),(1428,73,1,'2026-07-06',NULL),(1429,72,1,'2026-07-06',NULL),(1430,71,2,'2026-07-06',NULL),(1431,70,2,'2026-07-06',NULL),(1432,69,2,'2026-07-06',NULL),(1433,68,1,'2026-07-06',NULL),(1434,67,1,'2026-07-06',NULL),(1435,66,1,'2026-07-06',NULL),(1436,65,1,'2026-07-06',NULL),(1437,64,1,'2026-07-06',NULL),(1438,63,1,'2026-07-06',NULL),(1439,62,2,'2026-07-06',NULL),(1440,61,1,'2026-07-06',NULL),(1441,60,2,'2026-07-06',NULL),(1442,59,1,'2026-07-06',NULL),(1443,58,1,'2026-07-06',NULL),(1444,57,1,'2026-07-06',NULL),(1445,56,1,'2026-07-06',NULL),(1446,55,1,'2026-07-06',NULL),(1447,54,1,'2026-07-06',NULL),(1448,53,2,'2026-07-06',NULL),(1449,52,1,'2026-07-06',NULL),(1450,51,1,'2026-07-06',NULL),(1451,100,1,'2026-07-07',NULL),(1452,99,1,'2026-07-07',NULL),(1453,98,1,'2026-07-07',NULL),(1454,97,1,'2026-07-07',NULL),(1455,96,1,'2026-07-07',NULL),(1456,95,1,'2026-07-07',NULL),(1457,94,1,'2026-07-07',NULL),(1458,93,1,'2026-07-07',NULL),(1459,92,1,'2026-07-07',NULL),(1460,91,1,'2026-07-07',NULL),(1461,90,1,'2026-07-07',NULL),(1462,89,1,'2026-07-07',NULL),(1463,88,1,'2026-07-07',NULL),(1464,87,1,'2026-07-07',NULL),(1465,86,1,'2026-07-07',NULL),(1466,85,1,'2026-07-07',NULL),(1467,84,1,'2026-07-07',NULL),(1468,83,1,'2026-07-07',NULL),(1469,82,1,'2026-07-07',NULL),(1470,81,1,'2026-07-07',NULL),(1471,80,1,'2026-07-07',NULL),(1472,79,1,'2026-07-07',NULL),(1473,78,1,'2026-07-07',NULL),(1474,77,1,'2026-07-07',NULL),(1475,76,2,'2026-07-07',NULL),(1476,75,2,'2026-07-07',NULL),(1477,74,1,'2026-07-07',NULL),(1478,73,1,'2026-07-07',NULL),(1479,72,1,'2026-07-07',NULL),(1480,71,1,'2026-07-07',NULL),(1481,70,2,'2026-07-07',NULL),(1482,69,1,'2026-07-07',NULL),(1483,68,1,'2026-07-07',NULL),(1484,67,1,'2026-07-07',NULL),(1485,66,1,'2026-07-07',NULL),(1486,65,1,'2026-07-07',NULL),(1487,64,1,'2026-07-07',NULL),(1488,63,1,'2026-07-07',NULL),(1489,62,1,'2026-07-07',NULL),(1490,61,1,'2026-07-07',NULL),(1491,60,1,'2026-07-07',NULL),(1492,59,1,'2026-07-07',NULL),(1493,58,1,'2026-07-07',NULL),(1494,57,1,'2026-07-07',NULL),(1495,56,2,'2026-07-07',NULL),(1496,55,1,'2026-07-07',NULL),(1497,54,2,'2026-07-07',NULL),(1498,53,1,'2026-07-07',NULL),(1499,52,1,'2026-07-07',NULL),(1500,51,1,'2026-07-07',NULL),(1501,100,1,'2026-07-08',NULL),(1502,99,1,'2026-07-08',NULL),(1503,98,1,'2026-07-08',NULL),(1504,97,1,'2026-07-08',NULL),(1505,96,1,'2026-07-08',NULL),(1506,95,1,'2026-07-08',NULL),(1507,94,1,'2026-07-08',NULL),(1508,93,1,'2026-07-08',NULL),(1509,92,1,'2026-07-08',NULL),(1510,91,1,'2026-07-08',NULL),(1511,90,1,'2026-07-08',NULL),(1512,89,1,'2026-07-08',NULL),(1513,88,1,'2026-07-08',NULL),(1514,87,2,'2026-07-08',NULL),(1515,86,1,'2026-07-08',NULL),(1516,85,1,'2026-07-08',NULL),(1517,84,2,'2026-07-08',NULL),(1518,83,1,'2026-07-08',NULL),(1519,82,1,'2026-07-08',NULL),(1520,81,1,'2026-07-08',NULL),(1521,80,1,'2026-07-08',NULL),(1522,79,1,'2026-07-08',NULL),(1523,78,1,'2026-07-08',NULL),(1524,77,1,'2026-07-08',NULL),(1525,76,1,'2026-07-08',NULL),(1526,75,1,'2026-07-08',NULL),(1527,74,1,'2026-07-08',NULL),(1528,73,3,'2026-07-08',NULL),(1529,72,1,'2026-07-08',NULL),(1530,71,1,'2026-07-08',NULL),(1531,70,2,'2026-07-08',NULL),(1532,69,1,'2026-07-08',NULL),(1533,68,1,'2026-07-08',NULL),(1534,67,1,'2026-07-08',NULL),(1535,66,1,'2026-07-08',NULL),(1536,65,1,'2026-07-08',NULL),(1537,64,1,'2026-07-08',NULL),(1538,63,1,'2026-07-08',NULL),(1539,62,1,'2026-07-08',NULL),(1540,61,1,'2026-07-08',NULL),(1541,60,1,'2026-07-08',NULL),(1542,59,1,'2026-07-08',NULL),(1543,58,1,'2026-07-08',NULL),(1544,57,1,'2026-07-08',NULL),(1545,56,1,'2026-07-08',NULL),(1546,55,1,'2026-07-08',NULL),(1547,54,1,'2026-07-08',NULL),(1548,53,1,'2026-07-08',NULL),(1549,52,1,'2026-07-08',NULL),(1550,51,1,'2026-07-08',NULL),(1551,100,1,'2026-07-09',NULL),(1552,99,2,'2026-07-09',NULL),(1553,98,1,'2026-07-09',NULL),(1554,97,1,'2026-07-09',NULL),(1555,96,1,'2026-07-09',NULL),(1556,95,1,'2026-07-09',NULL),(1557,94,1,'2026-07-09',NULL),(1558,93,1,'2026-07-09',NULL),(1559,92,1,'2026-07-09',NULL),(1560,91,1,'2026-07-09',NULL),(1561,90,1,'2026-07-09',NULL),(1562,89,1,'2026-07-09',NULL),(1563,88,1,'2026-07-09',NULL),(1564,87,1,'2026-07-09',NULL),(1565,86,1,'2026-07-09',NULL),(1566,85,1,'2026-07-09',NULL),(1567,84,1,'2026-07-09',NULL),(1568,83,1,'2026-07-09',NULL),(1569,82,2,'2026-07-09',NULL),(1570,81,1,'2026-07-09',NULL),(1571,80,1,'2026-07-09',NULL),(1572,79,1,'2026-07-09',NULL),(1573,78,1,'2026-07-09',NULL),(1574,77,1,'2026-07-09',NULL),(1575,76,1,'2026-07-09',NULL),(1576,75,2,'2026-07-09',NULL),(1577,74,1,'2026-07-09',NULL),(1578,73,1,'2026-07-09',NULL),(1579,72,1,'2026-07-09',NULL),(1580,71,1,'2026-07-09',NULL),(1581,70,1,'2026-07-09',NULL),(1582,69,1,'2026-07-09',NULL),(1583,68,1,'2026-07-09',NULL),(1584,67,1,'2026-07-09',NULL),(1585,66,1,'2026-07-09',NULL),(1586,65,1,'2026-07-09',NULL),(1587,64,1,'2026-07-09',NULL),(1588,63,1,'2026-07-09',NULL),(1589,62,1,'2026-07-09',NULL),(1590,61,1,'2026-07-09',NULL),(1591,60,2,'2026-07-09',NULL),(1592,59,1,'2026-07-09',NULL),(1593,58,1,'2026-07-09',NULL),(1594,57,1,'2026-07-09',NULL),(1595,56,1,'2026-07-09',NULL),(1596,55,1,'2026-07-09',NULL),(1597,54,2,'2026-07-09',NULL),(1598,53,1,'2026-07-09',NULL),(1599,52,1,'2026-07-09',NULL),(1600,51,1,'2026-07-09',NULL),(1601,100,1,'2026-07-10',NULL),(1602,99,1,'2026-07-10',NULL),(1603,98,1,'2026-07-10',NULL),(1604,97,1,'2026-07-10',NULL),(1605,96,1,'2026-07-10',NULL),(1606,95,1,'2026-07-10',NULL),(1607,94,1,'2026-07-10',NULL),(1608,93,1,'2026-07-10',NULL),(1609,92,1,'2026-07-10',NULL),(1610,91,2,'2026-07-10',NULL),(1611,90,1,'2026-07-10',NULL),(1612,89,1,'2026-07-10',NULL),(1613,88,1,'2026-07-10',NULL),(1614,87,1,'2026-07-10',NULL),(1615,86,1,'2026-07-10',NULL),(1616,85,1,'2026-07-10',NULL),(1617,84,1,'2026-07-10',NULL),(1618,83,1,'2026-07-10',NULL),(1619,82,1,'2026-07-10',NULL),(1620,81,1,'2026-07-10',NULL),(1621,80,1,'2026-07-10',NULL),(1622,79,1,'2026-07-10',NULL),(1623,78,1,'2026-07-10',NULL),(1624,77,1,'2026-07-10',NULL),(1625,76,1,'2026-07-10',NULL),(1626,75,1,'2026-07-10',NULL),(1627,74,2,'2026-07-10',NULL),(1628,73,1,'2026-07-10',NULL),(1629,72,1,'2026-07-10',NULL),(1630,71,1,'2026-07-10',NULL),(1631,70,1,'2026-07-10',NULL),(1632,69,1,'2026-07-10',NULL),(1633,68,1,'2026-07-10',NULL),(1634,67,1,'2026-07-10',NULL),(1635,66,1,'2026-07-10',NULL),(1636,65,1,'2026-07-10',NULL),(1637,64,1,'2026-07-10',NULL),(1638,63,1,'2026-07-10',NULL),(1639,62,1,'2026-07-10',NULL),(1640,61,1,'2026-07-10',NULL),(1641,60,2,'2026-07-10',NULL),(1642,59,1,'2026-07-10',NULL),(1643,58,1,'2026-07-10',NULL),(1644,57,1,'2026-07-10',NULL),(1645,56,1,'2026-07-10',NULL),(1646,55,1,'2026-07-10',NULL),(1647,54,1,'2026-07-10',NULL),(1648,53,1,'2026-07-10',NULL),(1649,52,1,'2026-07-10',NULL),(1650,51,1,'2026-07-10',NULL),(1651,100,1,'2026-07-11',NULL),(1652,99,2,'2026-07-11',NULL),(1653,98,1,'2026-07-11',NULL),(1654,97,1,'2026-07-11',NULL),(1655,96,1,'2026-07-11',NULL),(1656,95,1,'2026-07-11',NULL),(1657,94,1,'2026-07-11',NULL),(1658,93,1,'2026-07-11',NULL),(1659,92,1,'2026-07-11',NULL),(1660,91,1,'2026-07-11',NULL),(1661,90,2,'2026-07-11',NULL),(1662,89,1,'2026-07-11',NULL),(1663,88,1,'2026-07-11',NULL),(1664,87,2,'2026-07-11',NULL),(1665,86,1,'2026-07-11',NULL),(1666,85,1,'2026-07-11',NULL),(1667,84,1,'2026-07-11',NULL),(1668,83,2,'2026-07-11',NULL),(1669,82,1,'2026-07-11',NULL),(1670,81,1,'2026-07-11',NULL),(1671,80,1,'2026-07-11',NULL),(1672,79,2,'2026-07-11',NULL),(1673,78,1,'2026-07-11',NULL),(1674,77,1,'2026-07-11',NULL),(1675,76,1,'2026-07-11',NULL),(1676,75,1,'2026-07-11',NULL),(1677,74,1,'2026-07-11',NULL),(1678,73,1,'2026-07-11',NULL),(1679,72,1,'2026-07-11',NULL),(1680,71,1,'2026-07-11',NULL),(1681,70,1,'2026-07-11',NULL),(1682,69,2,'2026-07-11',NULL),(1683,68,1,'2026-07-11',NULL),(1684,67,1,'2026-07-11',NULL),(1685,66,1,'2026-07-11',NULL),(1686,65,1,'2026-07-11',NULL),(1687,64,2,'2026-07-11',NULL),(1688,63,1,'2026-07-11',NULL),(1689,62,1,'2026-07-11',NULL),(1690,61,2,'2026-07-11',NULL),(1691,60,2,'2026-07-11',NULL),(1692,59,1,'2026-07-11',NULL),(1693,58,1,'2026-07-11',NULL),(1694,57,1,'2026-07-11',NULL),(1695,56,1,'2026-07-11',NULL),(1696,55,1,'2026-07-11',NULL),(1697,54,1,'2026-07-11',NULL),(1698,53,1,'2026-07-11',NULL),(1699,52,1,'2026-07-11',NULL),(1700,51,1,'2026-07-11',NULL),(1701,100,2,'2026-07-12',NULL),(1702,99,1,'2026-07-12',NULL),(1703,98,1,'2026-07-12',NULL),(1704,97,1,'2026-07-12',NULL),(1705,96,1,'2026-07-12',NULL),(1706,95,2,'2026-07-12',NULL),(1707,94,1,'2026-07-12',NULL),(1708,93,1,'2026-07-12',NULL),(1709,92,1,'2026-07-12',NULL),(1710,91,1,'2026-07-12',NULL),(1711,90,1,'2026-07-12',NULL),(1712,89,2,'2026-07-12',NULL),(1713,88,1,'2026-07-12',NULL),(1714,87,1,'2026-07-12',NULL),(1715,86,1,'2026-07-12',NULL),(1716,85,2,'2026-07-12',NULL),(1717,84,1,'2026-07-12',NULL),(1718,83,2,'2026-07-12',NULL),(1719,82,1,'2026-07-12',NULL),(1720,81,1,'2026-07-12',NULL),(1721,80,1,'2026-07-12',NULL),(1722,79,1,'2026-07-12',NULL),(1723,78,1,'2026-07-12',NULL),(1724,77,1,'2026-07-12',NULL),(1725,76,1,'2026-07-12',NULL),(1726,75,1,'2026-07-12',NULL),(1727,74,1,'2026-07-12',NULL),(1728,73,1,'2026-07-12',NULL),(1729,72,1,'2026-07-12',NULL),(1730,71,1,'2026-07-12',NULL),(1731,70,2,'2026-07-12',NULL),(1732,69,1,'2026-07-12',NULL),(1733,68,1,'2026-07-12',NULL),(1734,67,2,'2026-07-12',NULL),(1735,66,1,'2026-07-12',NULL),(1736,65,1,'2026-07-12',NULL),(1737,64,1,'2026-07-12',NULL),(1738,63,1,'2026-07-12',NULL),(1739,62,1,'2026-07-12',NULL),(1740,61,1,'2026-07-12',NULL),(1741,60,1,'2026-07-12',NULL),(1742,59,1,'2026-07-12',NULL),(1743,58,2,'2026-07-12',NULL),(1744,57,2,'2026-07-12',NULL),(1745,56,1,'2026-07-12',NULL),(1746,55,1,'2026-07-12',NULL),(1747,54,1,'2026-07-12',NULL),(1748,53,1,'2026-07-12',NULL),(1749,52,1,'2026-07-12',NULL),(1750,51,1,'2026-07-12',NULL),(1751,100,1,'2026-07-13',NULL),(1752,99,1,'2026-07-13',NULL),(1753,98,2,'2026-07-13',NULL),(1754,97,2,'2026-07-13',NULL),(1755,96,1,'2026-07-13',NULL),(1756,95,1,'2026-07-13',NULL),(1757,94,1,'2026-07-13',NULL),(1758,93,2,'2026-07-13',NULL),(1759,92,1,'2026-07-13',NULL),(1760,91,1,'2026-07-13',NULL),(1761,90,2,'2026-07-13',NULL),(1762,89,1,'2026-07-13',NULL),(1763,88,1,'2026-07-13',NULL),(1764,87,2,'2026-07-13',NULL),(1765,86,2,'2026-07-13',NULL),(1766,85,1,'2026-07-13',NULL),(1767,84,1,'2026-07-13',NULL),(1768,83,1,'2026-07-13',NULL),(1769,82,1,'2026-07-13',NULL),(1770,81,1,'2026-07-13',NULL),(1771,80,1,'2026-07-13',NULL),(1772,79,2,'2026-07-13',NULL),(1773,78,1,'2026-07-13',NULL),(1774,77,1,'2026-07-13',NULL),(1775,76,1,'2026-07-13',NULL),(1776,75,1,'2026-07-13',NULL),(1777,74,1,'2026-07-13',NULL),(1778,73,1,'2026-07-13',NULL),(1779,72,2,'2026-07-13',NULL),(1780,71,1,'2026-07-13',NULL),(1781,70,1,'2026-07-13',NULL),(1782,69,1,'2026-07-13',NULL),(1783,68,1,'2026-07-13',NULL),(1784,67,1,'2026-07-13',NULL),(1785,66,1,'2026-07-13',NULL),(1786,65,2,'2026-07-13',NULL),(1787,64,1,'2026-07-13',NULL),(1788,63,1,'2026-07-13',NULL),(1789,62,1,'2026-07-13',NULL),(1790,61,1,'2026-07-13',NULL),(1791,60,1,'2026-07-13',NULL),(1792,59,1,'2026-07-13',NULL),(1793,58,1,'2026-07-13',NULL),(1794,57,1,'2026-07-13',NULL),(1795,56,1,'2026-07-13',NULL),(1796,55,1,'2026-07-13',NULL),(1797,54,1,'2026-07-13',NULL),(1798,53,2,'2026-07-13',NULL),(1799,52,1,'2026-07-13',NULL),(1800,51,1,'2026-07-13',NULL),(1801,100,1,'2026-07-14',NULL),(1802,99,1,'2026-07-14',NULL),(1803,98,1,'2026-07-14',NULL),(1804,97,1,'2026-07-14',NULL),(1805,96,1,'2026-07-14',NULL),(1806,95,1,'2026-07-14',NULL),(1807,94,1,'2026-07-14',NULL),(1808,93,1,'2026-07-14',NULL),(1809,92,1,'2026-07-14',NULL),(1810,91,1,'2026-07-14',NULL),(1811,90,1,'2026-07-14',NULL),(1812,89,2,'2026-07-14',NULL),(1813,88,1,'2026-07-14',NULL),(1814,87,1,'2026-07-14',NULL),(1815,86,1,'2026-07-14',NULL),(1816,85,1,'2026-07-14',NULL),(1817,84,1,'2026-07-14',NULL),(1818,83,1,'2026-07-14',NULL),(1819,82,2,'2026-07-14',NULL),(1820,81,1,'2026-07-14',NULL),(1821,80,1,'2026-07-14',NULL),(1822,79,1,'2026-07-14',NULL),(1823,78,2,'2026-07-14',NULL),(1824,77,1,'2026-07-14',NULL),(1825,76,1,'2026-07-14',NULL),(1826,75,2,'2026-07-14',NULL),(1827,74,2,'2026-07-14',NULL),(1828,73,1,'2026-07-14',NULL),(1829,72,1,'2026-07-14',NULL),(1830,71,1,'2026-07-14',NULL),(1831,70,1,'2026-07-14',NULL),(1832,69,1,'2026-07-14',NULL),(1833,68,1,'2026-07-14',NULL),(1834,67,1,'2026-07-14',NULL),(1835,66,2,'2026-07-14',NULL),(1836,65,1,'2026-07-14',NULL),(1837,64,1,'2026-07-14',NULL),(1838,63,1,'2026-07-14',NULL),(1839,62,1,'2026-07-14',NULL),(1840,61,1,'2026-07-14',NULL),(1841,60,1,'2026-07-14',NULL),(1842,59,1,'2026-07-14',NULL),(1843,58,1,'2026-07-14',NULL),(1844,57,1,'2026-07-14',NULL),(1845,56,1,'2026-07-14',NULL),(1846,55,2,'2026-07-14',NULL),(1847,54,1,'2026-07-14',NULL),(1848,53,1,'2026-07-14',NULL),(1849,52,1,'2026-07-14',NULL),(1850,51,1,'2026-07-14',NULL),(1851,100,1,'2026-07-15',NULL),(1852,99,1,'2026-07-15',NULL),(1853,98,1,'2026-07-15',NULL),(1854,97,1,'2026-07-15',NULL),(1855,96,1,'2026-07-15',NULL),(1856,95,1,'2026-07-15',NULL),(1857,94,1,'2026-07-15',NULL),(1858,93,2,'2026-07-15',NULL),(1859,92,1,'2026-07-15',NULL),(1860,91,2,'2026-07-15',NULL),(1861,90,1,'2026-07-15',NULL),(1862,89,1,'2026-07-15',NULL),(1863,88,1,'2026-07-15',NULL),(1864,87,1,'2026-07-15',NULL),(1865,86,1,'2026-07-15',NULL),(1866,85,1,'2026-07-15',NULL),(1867,84,1,'2026-07-15',NULL),(1868,83,1,'2026-07-15',NULL),(1869,82,1,'2026-07-15',NULL),(1870,81,1,'2026-07-15',NULL),(1871,80,1,'2026-07-15',NULL),(1872,79,1,'2026-07-15',NULL),(1873,78,1,'2026-07-15',NULL),(1874,77,1,'2026-07-15',NULL),(1875,76,1,'2026-07-15',NULL),(1876,75,1,'2026-07-15',NULL),(1877,74,1,'2026-07-15',NULL),(1878,73,1,'2026-07-15',NULL),(1879,72,1,'2026-07-15',NULL),(1880,71,1,'2026-07-15',NULL),(1881,70,1,'2026-07-15',NULL),(1882,69,1,'2026-07-15',NULL),(1883,68,1,'2026-07-15',NULL),(1884,67,1,'2026-07-15',NULL),(1885,66,1,'2026-07-15',NULL),(1886,65,1,'2026-07-15',NULL),(1887,64,1,'2026-07-15',NULL),(1888,63,2,'2026-07-15',NULL),(1889,62,2,'2026-07-15',NULL),(1890,61,1,'2026-07-15',NULL),(1891,60,1,'2026-07-15',NULL),(1892,59,1,'2026-07-15',NULL),(1893,58,1,'2026-07-15',NULL),(1894,57,1,'2026-07-15',NULL),(1895,56,1,'2026-07-15',NULL),(1896,55,2,'2026-07-15',NULL),(1897,54,2,'2026-07-15',NULL),(1898,53,1,'2026-07-15',NULL),(1899,52,2,'2026-07-15',NULL),(1900,51,1,'2026-07-15',NULL),(1901,100,1,'2026-07-16',NULL),(1902,99,2,'2026-07-16',NULL),(1903,98,1,'2026-07-16',NULL),(1904,97,1,'2026-07-16',NULL),(1905,96,1,'2026-07-16',NULL),(1906,95,1,'2026-07-16',NULL),(1907,94,1,'2026-07-16',NULL),(1908,93,1,'2026-07-16',NULL),(1909,92,2,'2026-07-16',NULL),(1910,91,1,'2026-07-16',NULL),(1911,90,1,'2026-07-16',NULL),(1912,89,2,'2026-07-16',NULL),(1913,88,1,'2026-07-16',NULL),(1914,87,1,'2026-07-16',NULL),(1915,86,2,'2026-07-16',NULL),(1916,85,1,'2026-07-16',NULL),(1917,84,1,'2026-07-16',NULL),(1918,83,1,'2026-07-16',NULL),(1919,82,1,'2026-07-16',NULL),(1920,81,1,'2026-07-16',NULL),(1921,80,2,'2026-07-16',NULL),(1922,79,1,'2026-07-16',NULL),(1923,78,2,'2026-07-16',NULL),(1924,77,1,'2026-07-16',NULL),(1925,76,1,'2026-07-16',NULL),(1926,75,1,'2026-07-16',NULL),(1927,74,1,'2026-07-16',NULL),(1928,73,1,'2026-07-16',NULL),(1929,72,1,'2026-07-16',NULL),(1930,71,1,'2026-07-16',NULL),(1931,70,1,'2026-07-16',NULL),(1932,69,1,'2026-07-16',NULL),(1933,68,2,'2026-07-16',NULL),(1934,67,1,'2026-07-16',NULL),(1935,66,1,'2026-07-16',NULL),(1936,65,1,'2026-07-16',NULL),(1937,64,1,'2026-07-16',NULL),(1938,63,2,'2026-07-16',NULL),(1939,62,1,'2026-07-16',NULL),(1940,61,1,'2026-07-16',NULL),(1941,60,1,'2026-07-16',NULL),(1942,59,1,'2026-07-16',NULL),(1943,58,1,'2026-07-16',NULL),(1944,57,1,'2026-07-16',NULL),(1945,56,1,'2026-07-16',NULL),(1946,55,1,'2026-07-16',NULL),(1947,54,1,'2026-07-16',NULL),(1948,53,1,'2026-07-16',NULL),(1949,52,1,'2026-07-16',NULL),(1950,51,1,'2026-07-16',NULL),(1951,100,1,'2026-07-17',NULL),(1952,99,1,'2026-07-17',NULL),(1953,98,1,'2026-07-17',NULL),(1954,97,1,'2026-07-17',NULL),(1955,96,2,'2026-07-17',NULL),(1956,95,1,'2026-07-17',NULL),(1957,94,1,'2026-07-17',NULL),(1958,93,2,'2026-07-17',NULL),(1959,92,1,'2026-07-17',NULL),(1960,91,1,'2026-07-17',NULL),(1961,90,1,'2026-07-17',NULL),(1962,89,2,'2026-07-17',NULL),(1963,88,1,'2026-07-17',NULL),(1964,87,1,'2026-07-17',NULL),(1965,86,1,'2026-07-17',NULL),(1966,85,1,'2026-07-17',NULL),(1967,84,2,'2026-07-17',NULL),(1968,83,2,'2026-07-17',NULL),(1969,82,1,'2026-07-17',NULL),(1970,81,1,'2026-07-17',NULL),(1971,80,1,'2026-07-17',NULL),(1972,79,1,'2026-07-17',NULL),(1973,78,2,'2026-07-17',NULL),(1974,77,1,'2026-07-17',NULL),(1975,76,1,'2026-07-17',NULL),(1976,75,1,'2026-07-17',NULL),(1977,74,1,'2026-07-17',NULL),(1978,73,1,'2026-07-17',NULL),(1979,72,1,'2026-07-17',NULL),(1980,71,1,'2026-07-17',NULL),(1981,70,1,'2026-07-17',NULL),(1982,69,2,'2026-07-17',NULL),(1983,68,1,'2026-07-17',NULL),(1984,67,1,'2026-07-17',NULL),(1985,66,1,'2026-07-17',NULL),(1986,65,1,'2026-07-17',NULL),(1987,64,1,'2026-07-17',NULL),(1988,63,1,'2026-07-17',NULL),(1989,62,1,'2026-07-17',NULL),(1990,61,1,'2026-07-17',NULL),(1991,60,1,'2026-07-17',NULL),(1992,59,1,'2026-07-17',NULL),(1993,58,1,'2026-07-17',NULL),(1994,57,1,'2026-07-17',NULL),(1995,56,1,'2026-07-17',NULL),(1996,55,1,'2026-07-17',NULL),(1997,54,2,'2026-07-17',NULL),(1998,53,1,'2026-07-17',NULL),(1999,52,1,'2026-07-17',NULL),(2000,51,1,'2026-07-17',NULL),(2001,100,1,'2026-07-18',NULL),(2002,99,2,'2026-07-18',NULL),(2003,98,1,'2026-07-18',NULL),(2004,97,1,'2026-07-18',NULL),(2005,96,1,'2026-07-18',NULL),(2006,95,1,'2026-07-18',NULL),(2007,94,2,'2026-07-18',NULL),(2008,93,1,'2026-07-18',NULL),(2009,92,1,'2026-07-18',NULL),(2010,91,1,'2026-07-18',NULL),(2011,90,2,'2026-07-18',NULL),(2012,89,1,'2026-07-18',NULL),(2013,88,2,'2026-07-18',NULL),(2014,87,1,'2026-07-18',NULL),(2015,86,1,'2026-07-18',NULL),(2016,85,1,'2026-07-18',NULL),(2017,84,1,'2026-07-18',NULL),(2018,83,1,'2026-07-18',NULL),(2019,82,1,'2026-07-18',NULL),(2020,81,2,'2026-07-18',NULL),(2021,80,2,'2026-07-18',NULL),(2022,79,1,'2026-07-18',NULL),(2023,78,1,'2026-07-18',NULL),(2024,77,1,'2026-07-18',NULL),(2025,76,1,'2026-07-18',NULL),(2026,75,1,'2026-07-18',NULL),(2027,74,1,'2026-07-18',NULL),(2028,73,1,'2026-07-18',NULL),(2029,72,1,'2026-07-18',NULL),(2030,71,1,'2026-07-18',NULL),(2031,70,1,'2026-07-18',NULL),(2032,69,1,'2026-07-18',NULL),(2033,68,1,'2026-07-18',NULL),(2034,67,1,'2026-07-18',NULL),(2035,66,1,'2026-07-18',NULL),(2036,65,2,'2026-07-18',NULL),(2037,64,1,'2026-07-18',NULL),(2038,63,1,'2026-07-18',NULL),(2039,62,1,'2026-07-18',NULL),(2040,61,1,'2026-07-18',NULL),(2041,60,2,'2026-07-18',NULL),(2042,59,1,'2026-07-18',NULL),(2043,58,1,'2026-07-18',NULL),(2044,57,2,'2026-07-18',NULL),(2045,56,1,'2026-07-18',NULL),(2046,55,1,'2026-07-18',NULL),(2047,54,1,'2026-07-18',NULL),(2048,53,1,'2026-07-18',NULL),(2049,52,1,'2026-07-18',NULL),(2050,51,1,'2026-07-18',NULL),(2051,100,1,'2026-07-19',NULL),(2052,99,1,'2026-07-19',NULL),(2053,98,2,'2026-07-19',NULL),(2054,97,1,'2026-07-19',NULL),(2055,96,1,'2026-07-19',NULL),(2056,95,1,'2026-07-19',NULL),(2057,94,1,'2026-07-19',NULL),(2058,93,1,'2026-07-19',NULL),(2059,92,1,'2026-07-19',NULL),(2060,91,1,'2026-07-19',NULL),(2061,90,1,'2026-07-19',NULL),(2062,89,1,'2026-07-19',NULL),(2063,88,1,'2026-07-19',NULL),(2064,87,1,'2026-07-19',NULL),(2065,86,1,'2026-07-19',NULL),(2066,85,2,'2026-07-19',NULL),(2067,84,3,'2026-07-19',NULL),(2068,83,1,'2026-07-19',NULL),(2069,82,1,'2026-07-19',NULL),(2070,81,2,'2026-07-19',NULL),(2071,80,1,'2026-07-19',NULL),(2072,79,1,'2026-07-19',NULL),(2073,78,1,'2026-07-19',NULL),(2074,77,1,'2026-07-19',NULL),(2075,76,1,'2026-07-19',NULL),(2076,75,1,'2026-07-19',NULL),(2077,74,2,'2026-07-19',NULL),(2078,73,1,'2026-07-19',NULL),(2079,72,1,'2026-07-19',NULL),(2080,71,1,'2026-07-19',NULL),(2081,70,1,'2026-07-19',NULL),(2082,69,2,'2026-07-19',NULL),(2083,68,1,'2026-07-19',NULL),(2084,67,2,'2026-07-19',NULL),(2085,66,2,'2026-07-19',NULL),(2086,65,2,'2026-07-19',NULL),(2087,64,1,'2026-07-19',NULL),(2088,63,2,'2026-07-19',NULL),(2089,62,1,'2026-07-19',NULL),(2090,61,1,'2026-07-19',NULL),(2091,60,1,'2026-07-19',NULL),(2092,59,1,'2026-07-19',NULL),(2093,58,2,'2026-07-19',NULL),(2094,57,1,'2026-07-19',NULL),(2095,56,1,'2026-07-19',NULL),(2096,55,1,'2026-07-19',NULL),(2097,54,2,'2026-07-19',NULL),(2098,53,1,'2026-07-19',NULL),(2099,52,1,'2026-07-19',NULL),(2100,51,1,'2026-07-19',NULL),(2101,100,1,'2026-07-20',NULL),(2102,99,1,'2026-07-20',NULL),(2103,98,1,'2026-07-20',NULL),(2104,97,2,'2026-07-20',NULL),(2105,96,1,'2026-07-20',NULL),(2106,95,1,'2026-07-20',NULL),(2107,94,1,'2026-07-20',NULL),(2108,93,1,'2026-07-20',NULL),(2109,92,1,'2026-07-20',NULL),(2110,91,1,'2026-07-20',NULL),(2111,90,1,'2026-07-20',NULL),(2112,89,1,'2026-07-20',NULL),(2113,88,1,'2026-07-20',NULL),(2114,87,1,'2026-07-20',NULL),(2115,86,1,'2026-07-20',NULL),(2116,85,1,'2026-07-20',NULL),(2117,84,2,'2026-07-20',NULL),(2118,83,1,'2026-07-20',NULL),(2119,82,1,'2026-07-20',NULL),(2120,81,1,'2026-07-20',NULL),(2121,80,1,'2026-07-20',NULL),(2122,79,1,'2026-07-20',NULL),(2123,78,2,'2026-07-20',NULL),(2124,77,1,'2026-07-20',NULL),(2125,76,2,'2026-07-20',NULL),(2126,75,1,'2026-07-20',NULL),(2127,74,1,'2026-07-20',NULL),(2128,73,1,'2026-07-20',NULL),(2129,72,1,'2026-07-20',NULL),(2130,71,1,'2026-07-20',NULL),(2131,70,2,'2026-07-20',NULL),(2132,69,1,'2026-07-20',NULL),(2133,68,1,'2026-07-20',NULL),(2134,67,1,'2026-07-20',NULL),(2135,66,1,'2026-07-20',NULL),(2136,65,1,'2026-07-20',NULL),(2137,64,1,'2026-07-20',NULL),(2138,63,1,'2026-07-20',NULL),(2139,62,1,'2026-07-20',NULL),(2140,61,2,'2026-07-20',NULL),(2141,60,1,'2026-07-20',NULL),(2142,59,1,'2026-07-20',NULL),(2143,58,1,'2026-07-20',NULL),(2144,57,1,'2026-07-20',NULL),(2145,56,1,'2026-07-20',NULL),(2146,55,1,'2026-07-20',NULL),(2147,54,1,'2026-07-20',NULL),(2148,53,1,'2026-07-20',NULL),(2149,52,1,'2026-07-20',NULL),(2150,51,1,'2026-07-20',NULL),(2151,100,1,'2026-07-21',NULL),(2152,99,1,'2026-07-21',NULL),(2153,98,1,'2026-07-21',NULL),(2154,97,1,'2026-07-21',NULL),(2155,96,1,'2026-07-21',NULL),(2156,95,1,'2026-07-21',NULL),(2157,94,1,'2026-07-21',NULL),(2158,93,1,'2026-07-21',NULL),(2159,92,1,'2026-07-21',NULL),(2160,91,1,'2026-07-21',NULL),(2161,90,2,'2026-07-21',NULL),(2162,89,1,'2026-07-21',NULL),(2163,88,2,'2026-07-21',NULL),(2164,87,1,'2026-07-21',NULL),(2165,86,1,'2026-07-21',NULL),(2166,85,2,'2026-07-21',NULL),(2167,84,2,'2026-07-21',NULL),(2168,83,1,'2026-07-21',NULL),(2169,82,1,'2026-07-21',NULL),(2170,81,2,'2026-07-21',NULL),(2171,80,1,'2026-07-21',NULL),(2172,79,1,'2026-07-21',NULL),(2173,78,1,'2026-07-21',NULL),(2174,77,1,'2026-07-21',NULL),(2175,76,1,'2026-07-21',NULL),(2176,75,1,'2026-07-21',NULL),(2177,74,1,'2026-07-21',NULL),(2178,73,2,'2026-07-21',NULL),(2179,72,1,'2026-07-21',NULL),(2180,71,1,'2026-07-21',NULL),(2181,70,2,'2026-07-21',NULL),(2182,69,1,'2026-07-21',NULL),(2183,68,1,'2026-07-21',NULL),(2184,67,1,'2026-07-21',NULL),(2185,66,1,'2026-07-21',NULL),(2186,65,2,'2026-07-21',NULL),(2187,64,1,'2026-07-21',NULL),(2188,63,1,'2026-07-21',NULL),(2189,62,1,'2026-07-21',NULL),(2190,61,2,'2026-07-21',NULL),(2191,60,1,'2026-07-21',NULL),(2192,59,1,'2026-07-21',NULL),(2193,58,1,'2026-07-21',NULL),(2194,57,1,'2026-07-21',NULL),(2195,56,1,'2026-07-21',NULL),(2196,55,1,'2026-07-21',NULL),(2197,54,1,'2026-07-21',NULL),(2198,53,1,'2026-07-21',NULL),(2199,52,1,'2026-07-21',NULL),(2200,51,1,'2026-07-21',NULL),(2201,100,1,'2026-07-22',NULL),(2202,99,1,'2026-07-22',NULL),(2203,98,1,'2026-07-22',NULL),(2204,97,1,'2026-07-22',NULL),(2205,96,1,'2026-07-22',NULL),(2206,95,1,'2026-07-22',NULL),(2207,94,1,'2026-07-22',NULL),(2208,93,1,'2026-07-22',NULL),(2209,92,1,'2026-07-22',NULL),(2210,91,2,'2026-07-22',NULL),(2211,90,1,'2026-07-22',NULL),(2212,89,2,'2026-07-22',NULL),(2213,88,1,'2026-07-22',NULL),(2214,87,1,'2026-07-22',NULL),(2215,86,1,'2026-07-22',NULL),(2216,85,1,'2026-07-22',NULL),(2217,84,1,'2026-07-22',NULL),(2218,83,1,'2026-07-22',NULL),(2219,82,1,'2026-07-22',NULL),(2220,81,1,'2026-07-22',NULL),(2221,80,1,'2026-07-22',NULL),(2222,79,1,'2026-07-22',NULL),(2223,78,1,'2026-07-22',NULL),(2224,77,1,'2026-07-22',NULL),(2225,76,1,'2026-07-22',NULL),(2226,75,2,'2026-07-22',NULL),(2227,74,1,'2026-07-22',NULL),(2228,73,1,'2026-07-22',NULL),(2229,72,1,'2026-07-22',NULL),(2230,71,1,'2026-07-22',NULL),(2231,70,1,'2026-07-22',NULL),(2232,69,1,'2026-07-22',NULL),(2233,68,1,'2026-07-22',NULL),(2234,67,1,'2026-07-22',NULL),(2235,66,1,'2026-07-22',NULL),(2236,65,1,'2026-07-22',NULL),(2237,64,1,'2026-07-22',NULL),(2238,63,1,'2026-07-22',NULL),(2239,62,1,'2026-07-22',NULL),(2240,61,2,'2026-07-22',NULL),(2241,60,1,'2026-07-22',NULL),(2242,59,2,'2026-07-22',NULL),(2243,58,1,'2026-07-22',NULL),(2244,57,1,'2026-07-22',NULL),(2245,56,1,'2026-07-22',NULL),(2246,55,1,'2026-07-22',NULL),(2247,54,1,'2026-07-22',NULL),(2248,53,1,'2026-07-22',NULL),(2249,52,2,'2026-07-22',NULL),(2250,51,2,'2026-07-22',NULL),(2251,100,1,'2026-07-23',NULL),(2252,99,1,'2026-07-23',NULL),(2253,98,1,'2026-07-23',NULL),(2254,97,1,'2026-07-23',NULL),(2255,96,2,'2026-07-23',NULL),(2256,95,1,'2026-07-23',NULL),(2257,94,2,'2026-07-23',NULL),(2258,93,2,'2026-07-23',NULL),(2259,92,1,'2026-07-23',NULL),(2260,91,2,'2026-07-23',NULL),(2261,90,1,'2026-07-23',NULL),(2262,89,1,'2026-07-23',NULL),(2263,88,1,'2026-07-23',NULL),(2264,87,1,'2026-07-23',NULL),(2265,86,2,'2026-07-23',NULL),(2266,85,1,'2026-07-23',NULL),(2267,84,1,'2026-07-23',NULL),(2268,83,1,'2026-07-23',NULL),(2269,82,1,'2026-07-23',NULL),(2270,81,1,'2026-07-23',NULL),(2271,80,2,'2026-07-23',NULL),(2272,79,1,'2026-07-23',NULL),(2273,78,1,'2026-07-23',NULL),(2274,77,1,'2026-07-23',NULL),(2275,76,2,'2026-07-23',NULL),(2276,75,2,'2026-07-23',NULL),(2277,74,1,'2026-07-23',NULL),(2278,73,1,'2026-07-23',NULL),(2279,72,1,'2026-07-23',NULL),(2280,71,1,'2026-07-23',NULL),(2281,70,1,'2026-07-23',NULL),(2282,69,1,'2026-07-23',NULL),(2283,68,1,'2026-07-23',NULL),(2284,67,1,'2026-07-23',NULL),(2285,66,1,'2026-07-23',NULL),(2286,65,1,'2026-07-23',NULL),(2287,64,1,'2026-07-23',NULL),(2288,63,2,'2026-07-23',NULL),(2289,62,1,'2026-07-23',NULL),(2290,61,1,'2026-07-23',NULL),(2291,60,1,'2026-07-23',NULL),(2292,59,1,'2026-07-23',NULL),(2293,58,1,'2026-07-23',NULL),(2294,57,1,'2026-07-23',NULL),(2295,56,2,'2026-07-23',NULL),(2296,55,1,'2026-07-23',NULL),(2297,54,1,'2026-07-23',NULL),(2298,53,1,'2026-07-23',NULL),(2299,52,1,'2026-07-23',NULL),(2300,51,1,'2026-07-23',NULL),(2301,100,1,'2026-07-24',NULL),(2302,99,1,'2026-07-24',NULL),(2303,98,1,'2026-07-24',NULL),(2304,97,1,'2026-07-24',NULL),(2305,96,1,'2026-07-24',NULL),(2306,95,1,'2026-07-24',NULL),(2307,94,1,'2026-07-24',NULL),(2308,93,1,'2026-07-24',NULL),(2309,92,1,'2026-07-24',NULL),(2310,91,1,'2026-07-24',NULL),(2311,90,1,'2026-07-24',NULL),(2312,89,2,'2026-07-24',NULL),(2313,88,1,'2026-07-24',NULL),(2314,87,1,'2026-07-24',NULL),(2315,86,2,'2026-07-24',NULL),(2316,85,3,'2026-07-24',NULL),(2317,84,1,'2026-07-24',NULL),(2318,83,1,'2026-07-24',NULL),(2319,82,1,'2026-07-24',NULL),(2320,81,1,'2026-07-24',NULL),(2321,80,1,'2026-07-24',NULL),(2322,79,1,'2026-07-24',NULL),(2323,78,1,'2026-07-24',NULL),(2324,77,1,'2026-07-24',NULL),(2325,76,1,'2026-07-24',NULL),(2326,75,1,'2026-07-24',NULL),(2327,74,2,'2026-07-24',NULL),(2328,73,1,'2026-07-24',NULL),(2329,72,1,'2026-07-24',NULL),(2330,71,1,'2026-07-24',NULL),(2331,70,1,'2026-07-24',NULL),(2332,69,1,'2026-07-24',NULL),(2333,68,1,'2026-07-24',NULL),(2334,67,1,'2026-07-24',NULL),(2335,66,2,'2026-07-24',NULL),(2336,65,1,'2026-07-24',NULL),(2337,64,2,'2026-07-24',NULL),(2338,63,1,'2026-07-24',NULL),(2339,62,1,'2026-07-24',NULL),(2340,61,1,'2026-07-24',NULL),(2341,60,1,'2026-07-24',NULL),(2342,59,1,'2026-07-24',NULL),(2343,58,1,'2026-07-24',NULL),(2344,57,1,'2026-07-24',NULL),(2345,56,2,'2026-07-24',NULL),(2346,55,1,'2026-07-24',NULL),(2347,54,1,'2026-07-24',NULL),(2348,53,1,'2026-07-24',NULL),(2349,52,1,'2026-07-24',NULL),(2350,51,1,'2026-07-24',NULL),(2351,100,1,'2026-07-25',NULL),(2352,99,1,'2026-07-25',NULL),(2353,98,1,'2026-07-25',NULL),(2354,97,1,'2026-07-25',NULL),(2355,96,3,'2026-07-25',NULL),(2356,95,2,'2026-07-25',NULL),(2357,94,1,'2026-07-25',NULL),(2358,93,1,'2026-07-25',NULL),(2359,92,1,'2026-07-25',NULL),(2360,91,1,'2026-07-25',NULL),(2361,90,1,'2026-07-25',NULL),(2362,89,1,'2026-07-25',NULL),(2363,88,1,'2026-07-25',NULL),(2364,87,1,'2026-07-25',NULL),(2365,86,1,'2026-07-25',NULL),(2366,85,2,'2026-07-25',NULL),(2367,84,1,'2026-07-25',NULL),(2368,83,1,'2026-07-25',NULL),(2369,82,2,'2026-07-25',NULL),(2370,81,1,'2026-07-25',NULL),(2371,80,1,'2026-07-25',NULL),(2372,79,1,'2026-07-25',NULL),(2373,78,1,'2026-07-25',NULL),(2374,77,1,'2026-07-25',NULL),(2375,76,1,'2026-07-25',NULL),(2376,75,1,'2026-07-25',NULL),(2377,74,1,'2026-07-25',NULL),(2378,73,1,'2026-07-25',NULL),(2379,72,1,'2026-07-25',NULL),(2380,71,1,'2026-07-25',NULL),(2381,70,2,'2026-07-25',NULL),(2382,69,1,'2026-07-25',NULL),(2383,68,1,'2026-07-25',NULL),(2384,67,1,'2026-07-25',NULL),(2385,66,1,'2026-07-25',NULL),(2386,65,2,'2026-07-25',NULL),(2387,64,1,'2026-07-25',NULL),(2388,63,1,'2026-07-25',NULL),(2389,62,1,'2026-07-25',NULL),(2390,61,1,'2026-07-25',NULL),(2391,60,1,'2026-07-25',NULL),(2392,59,2,'2026-07-25',NULL),(2393,58,1,'2026-07-25',NULL),(2394,57,1,'2026-07-25',NULL),(2395,56,2,'2026-07-25',NULL),(2396,55,1,'2026-07-25',NULL),(2397,54,2,'2026-07-25',NULL),(2398,53,1,'2026-07-25',NULL),(2399,52,1,'2026-07-25',NULL),(2400,51,3,'2026-07-25',NULL),(2401,100,1,'2026-07-26',NULL),(2402,99,1,'2026-07-26',NULL),(2403,98,1,'2026-07-26',NULL),(2404,97,1,'2026-07-26',NULL),(2405,96,1,'2026-07-26',NULL),(2406,95,2,'2026-07-26',NULL),(2407,94,1,'2026-07-26',NULL),(2408,93,3,'2026-07-26',NULL),(2409,92,2,'2026-07-26',NULL),(2410,91,1,'2026-07-26',NULL),(2411,90,1,'2026-07-26',NULL),(2412,89,1,'2026-07-26',NULL),(2413,88,1,'2026-07-26',NULL),(2414,87,1,'2026-07-26',NULL),(2415,86,1,'2026-07-26',NULL),(2416,85,1,'2026-07-26',NULL),(2417,84,1,'2026-07-26',NULL),(2418,83,1,'2026-07-26',NULL),(2419,82,1,'2026-07-26',NULL),(2420,81,1,'2026-07-26',NULL),(2421,80,1,'2026-07-26',NULL),(2422,79,1,'2026-07-26',NULL),(2423,78,1,'2026-07-26',NULL),(2424,77,2,'2026-07-26',NULL),(2425,76,1,'2026-07-26',NULL),(2426,75,1,'2026-07-26',NULL),(2427,74,1,'2026-07-26',NULL),(2428,73,1,'2026-07-26',NULL),(2429,72,2,'2026-07-26',NULL),(2430,71,2,'2026-07-26',NULL),(2431,70,1,'2026-07-26',NULL),(2432,69,1,'2026-07-26',NULL),(2433,68,2,'2026-07-26',NULL),(2434,67,2,'2026-07-26',NULL),(2435,66,1,'2026-07-26',NULL),(2436,65,2,'2026-07-26',NULL),(2437,64,2,'2026-07-26',NULL),(2438,63,1,'2026-07-26',NULL),(2439,62,1,'2026-07-26',NULL),(2440,61,1,'2026-07-26',NULL),(2441,60,1,'2026-07-26',NULL),(2442,59,1,'2026-07-26',NULL),(2443,58,1,'2026-07-26',NULL),(2444,57,1,'2026-07-26',NULL),(2445,56,1,'2026-07-26',NULL),(2446,55,1,'2026-07-26',NULL),(2447,54,1,'2026-07-26',NULL),(2448,53,1,'2026-07-26',NULL),(2449,52,1,'2026-07-26',NULL),(2450,51,1,'2026-07-26',NULL),(2451,100,2,'2026-07-27',NULL),(2452,99,1,'2026-07-27',NULL),(2453,98,1,'2026-07-27',NULL),(2454,97,1,'2026-07-27',NULL),(2455,96,1,'2026-07-27',NULL),(2456,95,1,'2026-07-27',NULL),(2457,94,1,'2026-07-27',NULL),(2458,93,1,'2026-07-27',NULL),(2459,92,1,'2026-07-27',NULL),(2460,91,1,'2026-07-27',NULL),(2461,90,1,'2026-07-27',NULL),(2462,89,1,'2026-07-27',NULL),(2463,88,1,'2026-07-27',NULL),(2464,87,1,'2026-07-27',NULL),(2465,86,1,'2026-07-27',NULL),(2466,85,1,'2026-07-27',NULL),(2467,84,1,'2026-07-27',NULL),(2468,83,2,'2026-07-27',NULL),(2469,82,1,'2026-07-27',NULL),(2470,81,1,'2026-07-27',NULL),(2471,80,1,'2026-07-27',NULL),(2472,79,1,'2026-07-27',NULL),(2473,78,2,'2026-07-27',NULL),(2474,77,1,'2026-07-27',NULL),(2475,76,1,'2026-07-27',NULL),(2476,75,1,'2026-07-27',NULL),(2477,74,1,'2026-07-27',NULL),(2478,73,1,'2026-07-27',NULL),(2479,72,2,'2026-07-27',NULL),(2480,71,1,'2026-07-27',NULL),(2481,70,1,'2026-07-27',NULL),(2482,69,1,'2026-07-27',NULL),(2483,68,1,'2026-07-27',NULL),(2484,67,1,'2026-07-27',NULL),(2485,66,1,'2026-07-27',NULL),(2486,65,1,'2026-07-27',NULL),(2487,64,1,'2026-07-27',NULL),(2488,63,2,'2026-07-27',NULL),(2489,62,1,'2026-07-27',NULL),(2490,61,1,'2026-07-27',NULL),(2491,60,1,'2026-07-27',NULL),(2492,59,1,'2026-07-27',NULL),(2493,58,1,'2026-07-27',NULL),(2494,57,1,'2026-07-27',NULL),(2495,56,1,'2026-07-27',NULL),(2496,55,1,'2026-07-27',NULL),(2497,54,1,'2026-07-27',NULL),(2498,53,1,'2026-07-27',NULL),(2499,52,1,'2026-07-27',NULL),(2500,51,1,'2026-07-27',NULL),(2501,100,1,'2026-07-28',NULL),(2502,99,1,'2026-07-28',NULL),(2503,98,1,'2026-07-28',NULL),(2504,97,1,'2026-07-28',NULL),(2505,96,1,'2026-07-28',NULL),(2506,95,1,'2026-07-28',NULL),(2507,94,1,'2026-07-28',NULL),(2508,93,1,'2026-07-28',NULL),(2509,92,1,'2026-07-28',NULL),(2510,91,1,'2026-07-28',NULL),(2511,90,1,'2026-07-28',NULL),(2512,89,1,'2026-07-28',NULL),(2513,88,2,'2026-07-28',NULL),(2514,87,2,'2026-07-28',NULL),(2515,86,1,'2026-07-28',NULL),(2516,85,1,'2026-07-28',NULL),(2517,84,1,'2026-07-28',NULL),(2518,83,1,'2026-07-28',NULL),(2519,82,1,'2026-07-28',NULL),(2520,81,1,'2026-07-28',NULL),(2521,80,1,'2026-07-28',NULL),(2522,79,2,'2026-07-28',NULL),(2523,78,1,'2026-07-28',NULL),(2524,77,1,'2026-07-28',NULL),(2525,76,1,'2026-07-28',NULL),(2526,75,1,'2026-07-28',NULL),(2527,74,1,'2026-07-28',NULL),(2528,73,2,'2026-07-28',NULL),(2529,72,1,'2026-07-28',NULL),(2530,71,1,'2026-07-28',NULL),(2531,70,1,'2026-07-28',NULL),(2532,69,1,'2026-07-28',NULL),(2533,68,1,'2026-07-28',NULL),(2534,67,1,'2026-07-28',NULL),(2535,66,1,'2026-07-28',NULL),(2536,65,2,'2026-07-28',NULL),(2537,64,1,'2026-07-28',NULL),(2538,63,1,'2026-07-28',NULL),(2539,62,1,'2026-07-28',NULL),(2540,61,1,'2026-07-28',NULL),(2541,60,1,'2026-07-28',NULL),(2542,59,1,'2026-07-28',NULL),(2543,58,1,'2026-07-28',NULL),(2544,57,1,'2026-07-28',NULL),(2545,56,1,'2026-07-28',NULL),(2546,55,1,'2026-07-28',NULL),(2547,54,1,'2026-07-28',NULL),(2548,53,1,'2026-07-28',NULL),(2549,52,1,'2026-07-28',NULL),(2550,51,1,'2026-07-28',NULL),(2551,100,2,'2026-07-29',NULL),(2552,99,1,'2026-07-29',NULL),(2553,98,1,'2026-07-29',NULL),(2554,97,1,'2026-07-29',NULL),(2555,96,2,'2026-07-29',NULL),(2556,95,1,'2026-07-29',NULL),(2557,94,1,'2026-07-29',NULL),(2558,93,2,'2026-07-29',NULL),(2559,92,1,'2026-07-29',NULL),(2560,91,1,'2026-07-29',NULL),(2561,90,1,'2026-07-29',NULL),(2562,89,1,'2026-07-29',NULL),(2563,88,1,'2026-07-29',NULL),(2564,87,1,'2026-07-29',NULL),(2565,86,1,'2026-07-29',NULL),(2566,85,1,'2026-07-29',NULL),(2567,84,1,'2026-07-29',NULL),(2568,83,1,'2026-07-29',NULL),(2569,82,1,'2026-07-29',NULL),(2570,81,1,'2026-07-29',NULL),(2571,80,1,'2026-07-29',NULL),(2572,79,1,'2026-07-29',NULL),(2573,78,2,'2026-07-29',NULL),(2574,77,1,'2026-07-29',NULL),(2575,76,1,'2026-07-29',NULL),(2576,75,1,'2026-07-29',NULL),(2577,74,2,'2026-07-29',NULL),(2578,73,1,'2026-07-29',NULL),(2579,72,1,'2026-07-29',NULL),(2580,71,1,'2026-07-29',NULL),(2581,70,1,'2026-07-29',NULL),(2582,69,1,'2026-07-29',NULL),(2583,68,1,'2026-07-29',NULL),(2584,67,2,'2026-07-29',NULL),(2585,66,1,'2026-07-29',NULL),(2586,65,1,'2026-07-29',NULL),(2587,64,1,'2026-07-29',NULL),(2588,63,2,'2026-07-29',NULL),(2589,62,1,'2026-07-29',NULL),(2590,61,1,'2026-07-29',NULL),(2591,60,1,'2026-07-29',NULL),(2592,59,1,'2026-07-29',NULL),(2593,58,2,'2026-07-29',NULL),(2594,57,1,'2026-07-29',NULL),(2595,56,2,'2026-07-29',NULL),(2596,55,1,'2026-07-29',NULL),(2597,54,1,'2026-07-29',NULL),(2598,53,1,'2026-07-29',NULL),(2599,52,1,'2026-07-29',NULL),(2600,51,2,'2026-07-29',NULL),(2601,100,2,'2026-07-30',NULL),(2602,99,2,'2026-07-30',NULL),(2603,98,2,'2026-07-30',NULL),(2604,97,1,'2026-07-30',NULL),(2605,96,1,'2026-07-30',NULL),(2606,95,1,'2026-07-30',NULL),(2607,94,1,'2026-07-30',NULL),(2608,93,2,'2026-07-30',NULL),(2609,92,1,'2026-07-30',NULL),(2610,91,1,'2026-07-30',NULL),(2611,90,2,'2026-07-30',NULL),(2612,89,1,'2026-07-30',NULL),(2613,88,1,'2026-07-30',NULL),(2614,87,1,'2026-07-30',NULL),(2615,86,1,'2026-07-30',NULL),(2616,85,1,'2026-07-30',NULL),(2617,84,1,'2026-07-30',NULL),(2618,83,1,'2026-07-30',NULL),(2619,82,2,'2026-07-30',NULL),(2620,81,1,'2026-07-30',NULL),(2621,80,2,'2026-07-30',NULL),(2622,79,1,'2026-07-30',NULL),(2623,78,1,'2026-07-30',NULL),(2624,77,2,'2026-07-30',NULL),(2625,76,1,'2026-07-30',NULL),(2626,75,1,'2026-07-30',NULL),(2627,74,1,'2026-07-30',NULL),(2628,73,1,'2026-07-30',NULL),(2629,72,1,'2026-07-30',NULL),(2630,71,1,'2026-07-30',NULL),(2631,70,1,'2026-07-30',NULL),(2632,69,1,'2026-07-30',NULL),(2633,68,2,'2026-07-30',NULL),(2634,67,1,'2026-07-30',NULL),(2635,66,2,'2026-07-30',NULL),(2636,65,1,'2026-07-30',NULL),(2637,64,1,'2026-07-30',NULL),(2638,63,2,'2026-07-30',NULL),(2639,62,1,'2026-07-30',NULL),(2640,61,1,'2026-07-30',NULL),(2641,60,2,'2026-07-30',NULL),(2642,59,1,'2026-07-30',NULL),(2643,58,1,'2026-07-30',NULL),(2644,57,1,'2026-07-30',NULL),(2645,56,2,'2026-07-30',NULL),(2646,55,1,'2026-07-30',NULL),(2647,54,1,'2026-07-30',NULL),(2648,53,1,'2026-07-30',NULL),(2649,52,1,'2026-07-30',NULL),(2650,51,1,'2026-07-30',NULL),(2651,100,1,'2026-07-31',NULL),(2652,99,1,'2026-07-31',NULL),(2653,98,3,'2026-07-31',NULL),(2654,97,1,'2026-07-31',NULL),(2655,96,1,'2026-07-31',NULL),(2656,95,1,'2026-07-31',NULL),(2657,94,2,'2026-07-31',NULL),(2658,93,2,'2026-07-31',NULL),(2659,92,1,'2026-07-31',NULL),(2660,91,1,'2026-07-31',NULL),(2661,90,1,'2026-07-31',NULL),(2662,89,1,'2026-07-31',NULL),(2663,88,1,'2026-07-31',NULL),(2664,87,1,'2026-07-31',NULL),(2665,86,1,'2026-07-31',NULL),(2666,85,1,'2026-07-31',NULL),(2667,84,1,'2026-07-31',NULL),(2668,83,1,'2026-07-31',NULL),(2669,82,2,'2026-07-31',NULL),(2670,81,1,'2026-07-31',NULL),(2671,80,1,'2026-07-31',NULL),(2672,79,1,'2026-07-31',NULL),(2673,78,1,'2026-07-31',NULL),(2674,77,2,'2026-07-31',NULL),(2675,76,1,'2026-07-31',NULL),(2676,75,1,'2026-07-31',NULL),(2677,74,1,'2026-07-31',NULL),(2678,73,1,'2026-07-31',NULL),(2679,72,1,'2026-07-31',NULL),(2680,71,1,'2026-07-31',NULL),(2681,70,1,'2026-07-31',NULL),(2682,69,1,'2026-07-31',NULL),(2683,68,1,'2026-07-31',NULL),(2684,67,1,'2026-07-31',NULL),(2685,66,2,'2026-07-31',NULL),(2686,65,1,'2026-07-31',NULL),(2687,64,2,'2026-07-31',NULL),(2688,63,1,'2026-07-31',NULL),(2689,62,1,'2026-07-31',NULL),(2690,61,1,'2026-07-31',NULL),(2691,60,1,'2026-07-31',NULL),(2692,59,1,'2026-07-31',NULL),(2693,58,1,'2026-07-31',NULL),(2694,57,1,'2026-07-31',NULL),(2695,56,1,'2026-07-31',NULL),(2696,55,1,'2026-07-31',NULL),(2697,54,1,'2026-07-31',NULL),(2698,53,2,'2026-07-31',NULL),(2699,52,1,'2026-07-31',NULL),(2700,51,1,'2026-07-31',NULL),(2701,100,2,'2026-08-01',NULL),(2702,99,1,'2026-08-01',NULL),(2703,98,1,'2026-08-01',NULL),(2704,97,1,'2026-08-01',NULL),(2705,96,2,'2026-08-01',NULL),(2706,95,2,'2026-08-01',NULL),(2707,94,2,'2026-08-01',NULL),(2708,93,1,'2026-08-01',NULL),(2709,92,2,'2026-08-01',NULL),(2710,91,2,'2026-08-01',NULL),(2711,90,1,'2026-08-01',NULL),(2712,89,1,'2026-08-01',NULL),(2713,88,1,'2026-08-01',NULL),(2714,87,1,'2026-08-01',NULL),(2715,86,1,'2026-08-01',NULL),(2716,85,1,'2026-08-01',NULL),(2717,84,1,'2026-08-01',NULL),(2718,83,2,'2026-08-01',NULL),(2719,82,1,'2026-08-01',NULL),(2720,81,2,'2026-08-01',NULL),(2721,80,1,'2026-08-01',NULL),(2722,79,1,'2026-08-01',NULL),(2723,78,2,'2026-08-01',NULL),(2724,77,1,'2026-08-01',NULL),(2725,76,2,'2026-08-01',NULL),(2726,75,1,'2026-08-01',NULL),(2727,74,1,'2026-08-01',NULL),(2728,73,1,'2026-08-01',NULL),(2729,72,2,'2026-08-01',NULL),(2730,71,1,'2026-08-01',NULL),(2731,70,1,'2026-08-01',NULL),(2732,69,2,'2026-08-01',NULL),(2733,68,1,'2026-08-01',NULL),(2734,67,1,'2026-08-01',NULL),(2735,66,1,'2026-08-01',NULL),(2736,65,1,'2026-08-01',NULL),(2737,64,1,'2026-08-01',NULL),(2738,63,1,'2026-08-01',NULL),(2739,62,1,'2026-08-01',NULL),(2740,61,2,'2026-08-01',NULL),(2741,60,2,'2026-08-01',NULL),(2742,59,1,'2026-08-01',NULL),(2743,58,1,'2026-08-01',NULL),(2744,57,1,'2026-08-01',NULL),(2745,56,1,'2026-08-01',NULL),(2746,55,1,'2026-08-01',NULL),(2747,54,1,'2026-08-01',NULL),(2748,53,1,'2026-08-01',NULL),(2749,52,1,'2026-08-01',NULL),(2750,51,2,'2026-08-01',NULL),(2751,100,2,'2026-08-02',NULL),(2752,99,1,'2026-08-02',NULL),(2753,98,1,'2026-08-02',NULL),(2754,97,1,'2026-08-02',NULL),(2755,96,1,'2026-08-02',NULL),(2756,95,1,'2026-08-02',NULL),(2757,94,1,'2026-08-02',NULL),(2758,93,1,'2026-08-02',NULL),(2759,92,2,'2026-08-02',NULL),(2760,91,1,'2026-08-02',NULL),(2761,90,1,'2026-08-02',NULL),(2762,89,1,'2026-08-02',NULL),(2763,88,1,'2026-08-02',NULL),(2764,87,1,'2026-08-02',NULL),(2765,86,1,'2026-08-02',NULL),(2766,85,1,'2026-08-02',NULL),(2767,84,1,'2026-08-02',NULL),(2768,83,1,'2026-08-02',NULL),(2769,82,1,'2026-08-02',NULL),(2770,81,1,'2026-08-02',NULL),(2771,80,1,'2026-08-02',NULL),(2772,79,2,'2026-08-02',NULL),(2773,78,1,'2026-08-02',NULL),(2774,77,1,'2026-08-02',NULL),(2775,76,1,'2026-08-02',NULL),(2776,75,1,'2026-08-02',NULL),(2777,74,1,'2026-08-02',NULL),(2778,73,2,'2026-08-02',NULL),(2779,72,2,'2026-08-02',NULL),(2780,71,1,'2026-08-02',NULL),(2781,70,1,'2026-08-02',NULL),(2782,69,2,'2026-08-02',NULL),(2783,68,1,'2026-08-02',NULL),(2784,67,2,'2026-08-02',NULL),(2785,66,2,'2026-08-02',NULL),(2786,65,1,'2026-08-02',NULL),(2787,64,1,'2026-08-02',NULL),(2788,63,1,'2026-08-02',NULL),(2789,62,1,'2026-08-02',NULL),(2790,61,1,'2026-08-02',NULL),(2791,60,1,'2026-08-02',NULL),(2792,59,1,'2026-08-02',NULL),(2793,58,1,'2026-08-02',NULL),(2794,57,1,'2026-08-02',NULL),(2795,56,1,'2026-08-02',NULL),(2796,55,1,'2026-08-02',NULL),(2797,54,1,'2026-08-02',NULL),(2798,53,1,'2026-08-02',NULL),(2799,52,1,'2026-08-02',NULL),(2800,51,1,'2026-08-02',NULL),(2801,100,2,'2026-08-03',NULL),(2802,99,1,'2026-08-03',NULL),(2803,98,1,'2026-08-03',NULL),(2804,97,2,'2026-08-03',NULL),(2805,96,1,'2026-08-03',NULL),(2806,95,1,'2026-08-03',NULL),(2807,94,1,'2026-08-03',NULL),(2808,93,1,'2026-08-03',NULL),(2809,92,1,'2026-08-03',NULL),(2810,91,1,'2026-08-03',NULL),(2811,90,1,'2026-08-03',NULL),(2812,89,1,'2026-08-03',NULL),(2813,88,1,'2026-08-03',NULL),(2814,87,1,'2026-08-03',NULL),(2815,86,1,'2026-08-03',NULL),(2816,85,1,'2026-08-03',NULL),(2817,84,1,'2026-08-03',NULL),(2818,83,2,'2026-08-03',NULL),(2819,82,1,'2026-08-03',NULL),(2820,81,1,'2026-08-03',NULL),(2821,80,1,'2026-08-03',NULL),(2822,79,2,'2026-08-03',NULL),(2823,78,2,'2026-08-03',NULL),(2824,77,1,'2026-08-03',NULL),(2825,76,1,'2026-08-03',NULL),(2826,75,1,'2026-08-03',NULL),(2827,74,1,'2026-08-03',NULL),(2828,73,1,'2026-08-03',NULL),(2829,72,1,'2026-08-03',NULL),(2830,71,1,'2026-08-03',NULL),(2831,70,2,'2026-08-03',NULL),(2832,69,2,'2026-08-03',NULL),(2833,68,1,'2026-08-03',NULL),(2834,67,2,'2026-08-03',NULL),(2835,66,1,'2026-08-03',NULL),(2836,65,1,'2026-08-03',NULL),(2837,64,1,'2026-08-03',NULL),(2838,63,1,'2026-08-03',NULL),(2839,62,2,'2026-08-03',NULL),(2840,61,1,'2026-08-03',NULL),(2841,60,1,'2026-08-03',NULL),(2842,59,1,'2026-08-03',NULL),(2843,58,1,'2026-08-03',NULL),(2844,57,1,'2026-08-03',NULL),(2845,56,1,'2026-08-03',NULL),(2846,55,1,'2026-08-03',NULL),(2847,54,1,'2026-08-03',NULL),(2848,53,1,'2026-08-03',NULL),(2849,52,1,'2026-08-03',NULL),(2850,51,1,'2026-08-03',NULL),(2851,100,1,'2026-08-04',NULL),(2852,99,1,'2026-08-04',NULL),(2853,98,1,'2026-08-04',NULL),(2854,97,1,'2026-08-04',NULL),(2855,96,1,'2026-08-04',NULL),(2856,95,1,'2026-08-04',NULL),(2857,94,2,'2026-08-04',NULL),(2858,93,1,'2026-08-04',NULL),(2859,92,1,'2026-08-04',NULL),(2860,91,1,'2026-08-04',NULL),(2861,90,1,'2026-08-04',NULL),(2862,89,1,'2026-08-04',NULL),(2863,88,1,'2026-08-04',NULL),(2864,87,1,'2026-08-04',NULL),(2865,86,1,'2026-08-04',NULL),(2866,85,1,'2026-08-04',NULL),(2867,84,2,'2026-08-04',NULL),(2868,83,1,'2026-08-04',NULL),(2869,82,1,'2026-08-04',NULL),(2870,81,1,'2026-08-04',NULL),(2871,80,1,'2026-08-04',NULL),(2872,79,1,'2026-08-04',NULL),(2873,78,1,'2026-08-04',NULL),(2874,77,1,'2026-08-04',NULL),(2875,76,1,'2026-08-04',NULL),(2876,75,1,'2026-08-04',NULL),(2877,74,1,'2026-08-04',NULL),(2878,73,1,'2026-08-04',NULL),(2879,72,1,'2026-08-04',NULL),(2880,71,1,'2026-08-04',NULL),(2881,70,1,'2026-08-04',NULL),(2882,69,1,'2026-08-04',NULL),(2883,68,1,'2026-08-04',NULL),(2884,67,1,'2026-08-04',NULL),(2885,66,2,'2026-08-04',NULL),(2886,65,1,'2026-08-04',NULL),(2887,64,1,'2026-08-04',NULL),(2888,63,1,'2026-08-04',NULL),(2889,62,1,'2026-08-04',NULL),(2890,61,1,'2026-08-04',NULL),(2891,60,1,'2026-08-04',NULL),(2892,59,1,'2026-08-04',NULL),(2893,58,1,'2026-08-04',NULL),(2894,57,2,'2026-08-04',NULL),(2895,56,1,'2026-08-04',NULL),(2896,55,1,'2026-08-04',NULL),(2897,54,1,'2026-08-04',NULL),(2898,53,2,'2026-08-04',NULL),(2899,52,1,'2026-08-04',NULL),(2900,51,1,'2026-08-04',NULL),(2901,100,1,'2026-08-05',NULL),(2902,99,1,'2026-08-05',NULL),(2903,98,1,'2026-08-05',NULL),(2904,97,1,'2026-08-05',NULL),(2905,96,1,'2026-08-05',NULL),(2906,95,1,'2026-08-05',NULL),(2907,94,1,'2026-08-05',NULL),(2908,93,1,'2026-08-05',NULL),(2909,92,1,'2026-08-05',NULL),(2910,91,1,'2026-08-05',NULL),(2911,90,1,'2026-08-05',NULL),(2912,89,2,'2026-08-05',NULL),(2913,88,1,'2026-08-05',NULL),(2914,87,1,'2026-08-05',NULL),(2915,86,1,'2026-08-05',NULL),(2916,85,1,'2026-08-05',NULL),(2917,84,1,'2026-08-05',NULL),(2918,83,1,'2026-08-05',NULL),(2919,82,1,'2026-08-05',NULL),(2920,81,2,'2026-08-05',NULL),(2921,80,1,'2026-08-05',NULL),(2922,79,1,'2026-08-05',NULL),(2923,78,1,'2026-08-05',NULL),(2924,77,1,'2026-08-05',NULL),(2925,76,1,'2026-08-05',NULL),(2926,75,1,'2026-08-05',NULL),(2927,74,1,'2026-08-05',NULL),(2928,73,1,'2026-08-05',NULL),(2929,72,2,'2026-08-05',NULL),(2930,71,1,'2026-08-05',NULL),(2931,70,2,'2026-08-05',NULL),(2932,69,2,'2026-08-05',NULL),(2933,68,2,'2026-08-05',NULL),(2934,67,2,'2026-08-05',NULL),(2935,66,1,'2026-08-05',NULL),(2936,65,1,'2026-08-05',NULL),(2937,64,1,'2026-08-05',NULL),(2938,63,2,'2026-08-05',NULL),(2939,62,1,'2026-08-05',NULL),(2940,61,1,'2026-08-05',NULL),(2941,60,1,'2026-08-05',NULL),(2942,59,1,'2026-08-05',NULL),(2943,58,1,'2026-08-05',NULL),(2944,57,1,'2026-08-05',NULL),(2945,56,1,'2026-08-05',NULL),(2946,55,1,'2026-08-05',NULL),(2947,54,1,'2026-08-05',NULL),(2948,53,1,'2026-08-05',NULL),(2949,52,1,'2026-08-05',NULL),(2950,51,1,'2026-08-05',NULL),(2951,100,1,'2026-08-06',NULL),(2952,99,1,'2026-08-06',NULL),(2953,98,1,'2026-08-06',NULL),(2954,97,1,'2026-08-06',NULL),(2955,96,1,'2026-08-06',NULL),(2956,95,1,'2026-08-06',NULL),(2957,94,1,'2026-08-06',NULL),(2958,93,1,'2026-08-06',NULL),(2959,92,1,'2026-08-06',NULL),(2960,91,1,'2026-08-06',NULL),(2961,90,1,'2026-08-06',NULL),(2962,89,1,'2026-08-06',NULL),(2963,88,1,'2026-08-06',NULL),(2964,87,2,'2026-08-06',NULL),(2965,86,1,'2026-08-06',NULL),(2966,85,1,'2026-08-06',NULL),(2967,84,2,'2026-08-06',NULL),(2968,83,1,'2026-08-06',NULL),(2969,82,1,'2026-08-06',NULL),(2970,81,2,'2026-08-06',NULL),(2971,80,2,'2026-08-06',NULL),(2972,79,1,'2026-08-06',NULL),(2973,78,1,'2026-08-06',NULL),(2974,77,1,'2026-08-06',NULL),(2975,76,1,'2026-08-06',NULL),(2976,75,1,'2026-08-06',NULL),(2977,74,1,'2026-08-06',NULL),(2978,73,2,'2026-08-06',NULL),(2979,72,1,'2026-08-06',NULL),(2980,71,1,'2026-08-06',NULL),(2981,70,1,'2026-08-06',NULL),(2982,69,1,'2026-08-06',NULL),(2983,68,2,'2026-08-06',NULL),(2984,67,1,'2026-08-06',NULL),(2985,66,1,'2026-08-06',NULL),(2986,65,1,'2026-08-06',NULL),(2987,64,1,'2026-08-06',NULL),(2988,63,2,'2026-08-06',NULL),(2989,62,1,'2026-08-06',NULL),(2990,61,1,'2026-08-06',NULL),(2991,60,1,'2026-08-06',NULL),(2992,59,1,'2026-08-06',NULL),(2993,58,1,'2026-08-06',NULL),(2994,57,2,'2026-08-06',NULL),(2995,56,1,'2026-08-06',NULL),(2996,55,1,'2026-08-06',NULL),(2997,54,1,'2026-08-06',NULL),(2998,53,1,'2026-08-06',NULL),(2999,52,1,'2026-08-06',NULL),(3000,51,1,'2026-08-06',NULL);
/*!40000 ALTER TABLE `room_availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_statuses`
--

DROP TABLE IF EXISTS `room_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_statuses` (
  `room_status_id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(50) NOT NULL,
  PRIMARY KEY (`room_status_id`),
  UNIQUE KEY `status_name` (`status_name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_statuses`
--

LOCK TABLES `room_statuses` WRITE;
/*!40000 ALTER TABLE `room_statuses` DISABLE KEYS */;
INSERT INTO `room_statuses` VALUES (1,'AVAILABLE'),(3,'DIRTY'),(4,'MAINTENANCE'),(2,'OCCUPIED');
/*!40000 ALTER TABLE `room_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_type_amenities`
--

DROP TABLE IF EXISTS `room_type_amenities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_type_amenities` (
  `room_type_id` int NOT NULL,
  `amenity_id` int NOT NULL,
  PRIMARY KEY (`room_type_id`,`amenity_id`),
  KEY `amenity_id` (`amenity_id`),
  CONSTRAINT `room_type_amenities_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`),
  CONSTRAINT `room_type_amenities_ibfk_2` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`amenity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_type_amenities`
--

LOCK TABLES `room_type_amenities` WRITE;
/*!40000 ALTER TABLE `room_type_amenities` DISABLE KEYS */;
INSERT INTO `room_type_amenities` VALUES (1,1),(2,1),(3,1),(4,1),(5,1),(6,1),(7,1),(8,1),(9,1),(10,1),(11,1),(12,1),(13,1),(14,1),(15,1),(16,1),(17,1),(18,1),(19,1),(20,1),(21,1),(22,1),(23,1),(24,1),(25,1),(26,1),(27,1),(28,1),(29,1),(30,1),(32,1),(33,1),(34,1),(35,1),(44,1),(1,2),(2,2),(3,2),(4,2),(5,2),(6,2),(7,2),(8,2),(9,2),(10,2),(11,2),(12,2),(13,2),(14,2),(15,2),(16,2),(17,2),(18,2),(19,2),(20,2),(21,2),(22,2),(23,2),(25,2),(26,2),(27,2),(28,2),(29,2),(30,2),(33,2),(34,2),(35,2),(1,3),(2,3),(3,3),(4,3),(5,3),(6,3),(7,3),(8,3),(9,3),(10,3),(11,3),(12,3),(13,3),(14,3),(15,3),(16,3),(17,3),(18,3),(19,3),(20,3),(21,3),(22,3),(23,3),(24,3),(25,3),(26,3),(27,3),(28,3),(29,3),(30,3),(34,3),(35,3),(44,3);
/*!40000 ALTER TABLE `room_type_amenities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_types`
--

DROP TABLE IF EXISTS `room_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_types` (
  `room_type_id` int NOT NULL AUTO_INCREMENT,
  `hotel_id` int NOT NULL,
  `type_name` varchar(100) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `description` text,
  `base_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `max_adults` int NOT NULL DEFAULT '2',
  `max_children` int NOT NULL DEFAULT '2',
  PRIMARY KEY (`room_type_id`),
  UNIQUE KEY `hotel_id` (`hotel_id`,`type_name`),
  KEY `idx_room_type_hotel` (`hotel_id`),
  CONSTRAINT `room_types_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_types`
--

LOCK TABLES `room_types` WRITE;
/*!40000 ALTER TABLE `room_types` DISABLE KEYS */;
INSERT INTO `room_types` VALUES (1,1,'Standard','standard.jpg','Comfortable standard room',2500.00,'2026-06-08 08:16:44',2,1),(2,1,'Deluxe','deluxe.jpg','Spacious deluxe room',4500.00,'2026-06-08 08:16:44',4,2),(3,1,'Suite','suite.jpg','Luxury suite room',7500.00,'2026-06-08 08:16:44',6,3),(4,2,'Standard','standard.jpg','Comfortable standard room',2800.00,'2026-06-08 08:16:44',2,1),(5,2,'Deluxe','deluxe.jpg','Spacious deluxe room',4800.00,'2026-06-08 08:16:44',4,2),(6,2,'Suite','suite.jpg','Luxury suite room',8000.00,'2026-06-08 08:16:44',6,3),(7,3,'Standard','standard.jpg','Comfortable standard room',2200.00,'2026-06-08 08:16:44',2,1),(8,3,'Deluxe','deluxe.jpg','Spacious deluxe room',4200.00,'2026-06-08 08:16:44',4,2),(9,3,'Suite','suite.jpg','Luxury suite room',7000.00,'2026-06-08 08:16:44',6,3),(10,4,'Standard','h4_standard.jpg','Comfortable standard room with essential amenities.',2200.00,'2026-06-08 08:16:45',2,1),(11,4,'Deluxe','h4_deluxe.jpg','Spacious deluxe room with improved styling.',4200.00,'2026-06-08 08:16:45',4,2),(12,4,'Suite','h4_suite.jpg','Luxury suite room with premium views.',7000.00,'2026-06-08 08:16:45',6,3),(13,5,'Standard','h5_standard.jpg','Cozy standard accommodation ideal for couples.',2500.00,'2026-06-08 08:16:45',2,1),(14,5,'Deluxe','h5_deluxe.jpg','Premium deluxe layout with extra sitting space.',4800.00,'2026-06-08 08:16:45',4,2),(15,5,'Suite','h5_suite.jpg','Grand royal suite featuring heritage decor.',8500.00,'2026-06-08 08:16:45',6,3),(16,6,'Standard','h6_standard.jpg','Bright standard room with modern furnishings.',3000.00,'2026-06-08 08:16:45',2,1),(17,6,'Deluxe','h6_deluxe.jpg','Elegant deluxe room with pool side view.',5500.00,'2026-06-08 08:16:45',4,2),(18,6,'Suite','h6_suite.jpg','Exclusive beachfront suite with open lounge.',9500.00,'2026-06-08 08:16:45',6,3),(19,7,'Standard','h7_standard.jpg','Smart standard option perfect for transit travelers.',2000.00,'2026-06-08 08:16:45',2,1),(20,7,'Deluxe','h7_deluxe.jpg','Comfortable deluxe option with premium bed.',3800.00,'2026-06-08 08:16:45',4,2),(21,7,'Suite','h7_suite.jpg','Executive business suite with mini-bar access.',6500.00,'2026-06-08 08:16:45',6,3),(22,8,'Standard',NULL,'Warm standard room with scenic window views.',2800.00,'2026-06-08 08:16:45',2,1),(23,8,'Deluxe',NULL,'Spacious deluxe mountain view setup.',5500.00,'2026-06-08 08:16:45',4,2),(24,8,'Suite',NULL,'Premium luxury villa suite with fireplace.',9100.00,'2026-06-08 08:16:45',6,3),(25,9,'Standard','h9_standard.jpg','Eco-friendly standard cottage room.',2400.00,'2026-06-08 08:16:45',2,1),(26,9,'Deluxe','h9_deluxe.jpg','Large deluxe cottage with garden deck.',4500.00,'2026-06-08 08:16:45',4,2),(27,9,'Suite','h9_suite.jpg','Signature heritage houseboat suite.',8000.00,'2026-06-08 08:16:45',6,3),(28,10,'Standard','h10_standard.jpg','Sleek standard room with city layout.',3200.00,'2026-06-08 08:16:45',2,1),(29,10,'Deluxe','h10_deluxe.jpg','High-floor deluxe room with extended lounge.',6000.00,'2026-06-08 08:16:45',4,2),(30,10,'Suite','h10_suite.jpg','Presidential suite with ultimate luxury detailing.',12000.00,'2026-06-08 08:16:45',6,3),(31,22,'Beverly Baxter','https://ik.imagekit.io/7efdqayix/hotels/roomtypes/room_type-1781244853787_Wga5MSR-P','Et numquam voluptati',1900.00,'2026-06-12 06:14:15',85,30),(32,25,'Standard','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZE8tL0tW6rJov_nH4F9M8GQqSEo1qqtFJvtqtkHxGzw&s','Comfortable room',2500.00,'2026-06-15 12:31:03',2,2),(33,25,'Deluxes',NULL,'Deluxe facilities',85000.00,'2026-06-15 12:31:03',2,3),(34,25,'Suite','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZE8tL0tW6rJov_nH4F9M8GQqSEo1qqtFJvtqtkHxGzw&s','decription',8000.00,'2026-06-15 12:31:03',4,2),(35,25,'Professionals Executive','https://ik.imagekit.io/7efdqayix/hotels/roomtypes/room_type-1781529500875_Gmoiu_6hN','Professional Facilitated rooms',4550.00,'2026-06-15 13:18:24',2,1),(37,22,'Deluxe','https://ik.imagekit.io/7efdqayix/hotels/roomtypes/room_type-1781594321865_FGQ5UsLP3',NULL,1000.00,'2026-06-16 07:18:44',2,2),(39,25,'Professional','https://ik.imagekit.io/7efdqayix/hotels/roomtypes/room_type-1781616612207_rCx817GK7','sdfsdfdsf',4500.00,'2026-06-16 13:30:13',2,2),(41,28,'Standard','/home/milan-patel/Desktop/hbms/luxestay/src/public/uploads/profile-photos/1782740518376-db163fd20fd4.jpg','standard room',1200.00,'2026-06-29 12:49:54',2,1),(42,28,'Deluxe','https://ik.imagekit.io/7efdqayix/hotels/roomtypes/room_type-1782740655688_vOgBl94J1','delux',1200.00,'2026-06-29 13:44:17',3,2),(43,28,'Zulip',NULL,'sdffdfdsagfsdagfsdagf',2100.00,'2026-06-30 05:48:49',2,2),(44,8,'Newly Added',NULL,'cxzxzcvdsaf',25000.00,'2026-06-30 05:51:22',4,4),(45,28,'Royal','/home/milan-patel/Desktop/hbms/luxestay/src/public/uploads/profile-photos/1782803866753-b0181cd91be4.jpg','royal room for royal people like prince',2000.00,'2026-06-30 07:14:35',2,2),(46,28,'Dev','https://ik.imagekit.io/7efdqayix/hotels/roomtypes/room_type-1782804004852_qhPD8-cRq',NULL,4000.00,'2026-06-30 07:20:06',2,2);
/*!40000 ALTER TABLE `room_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `room_id` bigint NOT NULL AUTO_INCREMENT,
  `hotel_id` int NOT NULL,
  `room_type_id` int NOT NULL,
  `room_status_id` int NOT NULL,
  `room_number` varchar(20) NOT NULL,
  `floor` int DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `uq_hotel_room` (`hotel_id`,`room_number`),
  KEY `room_type_id` (`room_type_id`),
  KEY `room_status_id` (`room_status_id`),
  CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`),
  CONSTRAINT `rooms_ibfk_2` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`room_type_id`),
  CONSTRAINT `rooms_ibfk_3` FOREIGN KEY (`room_status_id`) REFERENCES `room_statuses` (`room_status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (51,1,1,1,'105',1,'Spacious eyr dirty','2026-06-08 08:25:32'),(52,1,1,1,'107',1,'Ganda Room Tha, \r\n','2026-06-08 08:25:32'),(53,1,2,1,'201',2,NULL,'2026-06-08 08:25:32'),(54,1,2,1,'202',2,NULL,'2026-06-08 08:25:32'),(55,1,3,1,'301',3,NULL,'2026-06-08 08:25:32'),(56,2,4,1,'101',1,NULL,'2026-06-08 08:25:32'),(57,2,4,1,'102',1,NULL,'2026-06-08 08:25:32'),(58,2,5,1,'201',2,NULL,'2026-06-08 08:25:32'),(59,2,5,1,'202',2,NULL,'2026-06-08 08:25:32'),(60,2,6,1,'301',3,NULL,'2026-06-08 08:25:32'),(61,3,7,1,'101',1,NULL,'2026-06-08 08:25:32'),(62,3,7,1,'102',1,NULL,'2026-06-08 08:25:32'),(63,3,8,1,'201',2,NULL,'2026-06-08 08:25:32'),(64,3,8,1,'202',2,NULL,'2026-06-08 08:25:32'),(65,3,9,1,'301',3,NULL,'2026-06-08 08:25:32'),(66,4,10,1,'101',1,NULL,'2026-06-08 08:25:32'),(67,4,10,1,'102',1,NULL,'2026-06-08 08:25:32'),(68,4,11,1,'201',2,NULL,'2026-06-08 08:25:32'),(69,4,11,1,'202',2,NULL,'2026-06-08 08:25:32'),(70,4,12,1,'301',3,NULL,'2026-06-08 08:25:32'),(71,5,13,1,'101',1,NULL,'2026-06-08 08:25:32'),(72,5,13,1,'102',1,NULL,'2026-06-08 08:25:32'),(73,5,14,1,'201',2,NULL,'2026-06-08 08:25:32'),(74,5,14,1,'202',2,NULL,'2026-06-08 08:25:32'),(75,5,15,1,'301',3,NULL,'2026-06-08 08:25:32'),(76,6,16,1,'101',1,NULL,'2026-06-08 08:25:32'),(77,6,16,1,'102',1,NULL,'2026-06-08 08:25:32'),(78,6,17,1,'201',2,NULL,'2026-06-08 08:25:32'),(79,6,17,1,'202',2,NULL,'2026-06-08 08:25:32'),(80,6,18,1,'301',3,NULL,'2026-06-08 08:25:32'),(81,7,19,1,'101',1,NULL,'2026-06-08 08:25:32'),(82,7,19,1,'102',1,NULL,'2026-06-08 08:25:32'),(83,7,20,1,'201',2,NULL,'2026-06-08 08:25:32'),(84,7,20,1,'202',2,NULL,'2026-06-08 08:25:32'),(85,7,21,1,'301',3,NULL,'2026-06-08 08:25:32'),(86,8,23,1,'101',1,'asdasdas','2026-06-08 08:25:32'),(87,8,22,1,'102',1,'Availablity check','2026-06-08 08:25:32'),(88,8,23,2,'201',2,'sdsaf','2026-06-08 08:25:32'),(89,8,23,1,'202',2,NULL,'2026-06-08 08:25:32'),(90,8,24,1,'303',3,'dassad','2026-06-08 08:25:32'),(91,9,25,1,'101',1,NULL,'2026-06-08 08:25:32'),(92,9,25,1,'102',1,NULL,'2026-06-08 08:25:32'),(93,9,26,1,'201',2,NULL,'2026-06-08 08:25:32'),(94,9,26,1,'202',2,NULL,'2026-06-08 08:25:32'),(95,9,27,1,'301',3,NULL,'2026-06-08 08:25:32'),(96,10,28,1,'101',1,NULL,'2026-06-08 08:25:32'),(97,10,28,1,'102',1,NULL,'2026-06-08 08:25:32'),(98,10,29,1,'201',2,NULL,'2026-06-08 08:25:32'),(99,10,29,1,'202',2,NULL,'2026-06-08 08:25:32'),(100,10,30,1,'301',3,NULL,'2026-06-08 08:25:32'),(103,25,1,1,'102',1,NULL,'2026-06-15 12:34:47'),(104,25,34,1,'201',2,NULL,'2026-06-15 12:34:47'),(105,25,32,1,'202',2,NULL,'2026-06-15 12:34:47'),(106,25,32,1,'301',3,NULL,'2026-06-15 12:34:47'),(112,25,34,2,'104',1,'none','2026-06-16 09:15:17'),(113,25,34,1,'105',1,'none','2026-06-16 09:16:59'),(115,25,34,1,'109',1,'Operationals','2026-06-16 13:42:47'),(116,25,34,1,'101',1,'hjjhkjh','2026-06-18 05:42:03'),(117,25,33,2,'205',2,'jhkhkjh','2026-06-18 05:43:47'),(118,28,41,1,'101',1,'temp','2026-06-29 12:50:57'),(119,22,37,1,'101',1,'temp','2026-06-29 13:26:28'),(120,28,42,1,'103',1,'delixxx','2026-06-29 13:46:55'),(121,28,42,1,'104',1,'cool room','2026-06-30 05:31:04'),(122,28,45,1,'202',2,'royal people lassi drinker','2026-06-30 07:15:50'),(123,28,46,1,'303',3,'dev','2026-06-30 07:20:52'),(126,8,44,1,'306',3,'Spacious','2026-07-01 05:23:03'),(127,8,24,1,'302',4,NULL,'2026-07-01 05:29:56'),(129,8,22,1,'104',1,NULL,'2026-07-01 08:25:35'),(130,8,22,1,'107',1,'fdsfdsf','2026-07-01 08:28:49'),(131,8,23,1,'108',1,'dsadasf','2026-07-01 08:30:43'),(132,8,23,1,'106',1,'fsdafdfds','2026-07-01 08:38:42'),(133,28,45,1,'507',5,'temp','2026-07-01 10:59:24');
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_statuses`
--

DROP TABLE IF EXISTS `tenant_statuses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenant_statuses` (
  `tenant_status_id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(50) NOT NULL,
  PRIMARY KEY (`tenant_status_id`),
  UNIQUE KEY `uq_status_name` (`status_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_statuses`
--

LOCK TABLES `tenant_statuses` WRITE;
/*!40000 ALTER TABLE `tenant_statuses` DISABLE KEYS */;
INSERT INTO `tenant_statuses` VALUES (1,'ACTIVE'),(3,'PENDING'),(2,'SUSPENDED');
/*!40000 ALTER TABLE `tenant_statuses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  PRIMARY KEY (`user_role_id`),
  UNIQUE KEY `uq_role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (2,'ADMIN'),(3,'FRONT_DESK'),(4,'GUEST'),(1,'SUPER_ADMIN');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `hotel_id` int DEFAULT NULL,
  `user_role_id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('Male','Female','Other','Prefer Not To Say') DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `state` varchar(30) NOT NULL,
  `city` varchar(40) NOT NULL,
  `address` varchar(500) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_email` (`email`),
  KEY `idx_hotel_id` (`hotel_id`),
  KEY `idx_user_role_id` (`user_role_id`),
  CONSTRAINT `fk_users_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`user_role_id`) REFERENCES `user_roles` (`user_role_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`),
  CONSTRAINT `users_ibfk_2` FOREIGN KEY (`user_role_id`) REFERENCES `user_roles` (`user_role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,4,'Harsh','Parmar','Harshparmar12@gmail.com','7418529630','1998-03-15','Male','$2b$10$/2Yncge8WKxJyCP0sj3opu8wAmhy2rFLrmtLsTBb50vUmUKgVL5FS','Jharkhand','Dhānbād','12 Green Park Society, Ahmedabad','1780528522911-da536f91f270.png','2026-06-03 23:15:23','2026-06-08 13:05:08'),(5,NULL,4,'Manthan','Joshi','manthanjoshi12@gmail.com','7412589630','1997-09-12','Male','$2b$10$8zN4hwX6KY9GhPs7B5.hWenfE0Z/w45S04lY8b3dGuF.vZ4SbL/h2','Karnataka','Bādāmi','34 Palm Heights, Gandhinagar','1780578106350-112cd190b08b.png','2026-06-04 13:01:46','2026-06-11 12:39:27'),(6,NULL,4,'Jay','Patel','jaypatel@gmail.com','7418529630','1994-05-18','Male','$2b$10$isZqPv92ZYM3cZK/y1g0tOaX.JXLS1TEC/F5yTiHLwM/FNB0Zhxoe','Jammu and Kashmir','Bishnāh','67 Sunrise Enclave, Bhavnagar','1780580967883-2075ec3b5782.png','2026-06-04 13:49:28','2026-06-08 13:05:08'),(7,NULL,4,'Harsh','Joshi','hp1@gmail.com','7894561230','1999-12-05','Male','$2b$10$l2vBoP2DP8EwAnDFkedBAemm9qHMK8PicIT3fNKrE0RmbHROH5HMa','Maharashtra','Ambājogāi','89 Lake View Colony, Jamnagar','1780581194851-4497c73abac3.png','2026-06-04 13:53:14','2026-06-08 13:05:08'),(8,NULL,4,'Atri','Thakar','atrithakar1@gmail.com','7834567890','1993-08-27','Male','$2b$10$/GKsvooONt13FuAcbSAgkO7YwBbLYldtHl5//avidGOEKMEXda8HW','Himachal Pradesh','Gagret','56 Crystal Homes, Anand','1780581301463-6cdaacaf12df.png','2026-06-04 13:55:01','2026-06-08 13:05:08'),(9,8,3,'UmanGbHAh','Suhagiya','umangs12@gmail.com','74125896','1996-03-29','Male','$2b$10$qMmBzEvYsiAElGvhpWnMGu0vMQJvmyRIXLpuQWGfiJZFfq8oQHYuq','Gujarat','Surat','102 Silver Oak Residency, Mehsana',NULL,'2026-06-08 09:04:01','2026-07-01 08:44:02'),(10,NULL,4,'Hival','Patel','hivalpatel@gmail.com','7418523690','2004-06-08','Female','$2b$10$bu.xwz5rbupIOX06b2EaiOu1mPYOOEWqgYeEnOqHjY/hysfaL7kai','Uttarakhand','Haldwani','Street no 4 janakpuri, Haldwani east','1780925519811-8b06b7759a34.png','2026-06-08 13:32:00','2026-06-09 12:49:22'),(11,1,3,'john','doe','johndoe@gmail.com','9428994756',NULL,NULL,'$2b$10$vYpb2RvYelO.7t6M9ngJM.aCJpalg/DJE.3F/t4GgXR3DWJj9AcsG','gujrat','amd',NULL,'/home/prince-meghani/Desktop/node/HBMS_PROJECT/luxestay/src/public/uploads/profile-photos/1781075263182-3db20cf7fbbf.jpg','2026-06-10 07:07:43','2026-06-10 07:12:40'),(13,NULL,4,'Milan','Patel','milanpatel@gmail.com','8945289583','2003-10-22','Male','$2b$10$0bjKAzCB5dsW.2afT6Isxe/h85tmmiSI/62p2uSc85p/vmyq7kxJu','Gujarat','Ahmedabad','A/17, everegreen society','1781092759497-5a003281845f.jpeg','2026-06-10 11:59:19','2026-06-10 11:59:19'),(14,NULL,4,'Jay','Patel','jaypatel01@gmail.com','7458963210','2005-02-09','Male','$2b$10$DKE7u.73vP82rlbqWpuGC.UfcrO.YZcDkUQaWht32PQvUTS5YNZGm','Gujarat','Vadodara','\"Lakshya\" , street number 6 , block number 17 , Vadodara','1781092892758-3c76d58cff27.png','2026-06-10 12:01:33','2026-06-10 12:02:43'),(18,NULL,4,'Manthan','Joshi','manthanjoshi@gmail.com','7410852369','2004-05-07','Male','$2b$10$y/eQDB33FBWi5.RN41/g0uz2b.Dl3INxHLlWdtQi7UeUSggCHy9hW','Gujarat','Modasa','Jivraj park near public garden, Modasa ','1781093803133-0db8f1a985da.jpg','2026-06-10 12:16:43','2026-06-10 12:16:43'),(19,NULL,2,'Staff 1','Member 1','Staff1@gmail.com','1251451251',NULL,NULL,'$2b$10$uOJUlFAIgIgz7aktHKk/W.z8FcFOsr51XozIlS/s8ecyb3sJw6Nz.','Ahmedabad','Ahmedabad',NULL,'/home/siddharth-parmar/Desktop/Hotel Produ/luxestay/src/public/uploads/profile-photos/1781166220078-d27df65caf73.jpg','2026-06-11 08:23:40','2026-06-11 08:23:40'),(21,8,2,'Staff 1','Member 1','Staff2@gmail.com','1235214564',NULL,NULL,'$2b$10$E0NOiJgo3x.7Ah2s/0vuPujxmSo1f9HF9/gNa.YpG6A61MfYJdIR6','Ahmedabad','Ahmedabad',NULL,'/home/siddharth-parmar/Desktop/Hotel Produ/luxestay/src/public/uploads/profile-photos/1781166278802-7b7efdac1787.jpg','2026-06-11 08:24:38','2026-06-19 04:53:28'),(22,NULL,4,'Milan','Patell','milan2@gmail.com','6578453256','2003-05-11','Male','$2b$10$gSyTQ/rBd4QL8EME1jnwCe6OkA/jn28/JAgHh/aiE6hpLlR31ttnq','Gujarat','Banas Kantha','Address nahi bata sakta achi bat nahi he address puchna','1782725929880-feb5f8c3ceff.png','2026-06-11 09:49:27','2026-06-29 09:38:49'),(23,22,2,'roronoa','zoro','roronoa@gmail.com','9456848576',NULL,NULL,'$2b$10$fvCp2Rz9bkGlFNhQ/fAoO.CIAb2zxIIHTUF35vX1bDamNQs7ZlQ3q','gujrat','ahmedabad',NULL,NULL,'2026-06-12 05:22:20','2026-06-12 05:29:05'),(25,24,2,'Raj','Patel','raj@hotel1.com','9000000001',NULL,NULL,'$2a$12$molmCHKiUk4riNkSGtlGsO6Yk53HTSf3J7KLwVvP3NnWsoXovOtXy','Gujarat','Ahmedabad','address 1','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWwkq93t5FnksulxA2YfZpSKAUiaqGZ7sNWSgR0wOtoQ&s=10','2026-06-15 12:20:14','2026-06-15 12:20:14'),(26,25,2,'Siddharth','Parmar','Siddharth@hotel1.com','9000000002',NULL,NULL,'$2a$12$molmCHKiUk4riNkSGtlGsO6Yk53HTSf3J7KLwVvP3NnWsoXovOtXy','Gujarat','Ahmedabad','address 1','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWwkq93t5FnksulxA2YfZpSKAUiaqGZ7sNWSgR0wOtoQ&s=10','2026-06-15 12:40:28','2026-06-15 12:40:28'),(28,NULL,1,'milan','patel','milansuper@gmail.com','9876543210','1990-04-15','Male','Dev@1234','Maharashtra','Mumbai','12, Nariman Point, Business District, Mumbai',NULL,'2026-06-16 05:46:53','2026-06-16 05:46:53'),(29,2,1,'Munna','Tripathi','munna123@example.com','9876543210','1995-08-15','Male','$2b$10$BQodvAdDVGYrNhHXusR9BOngpetJY3JSHvv1jaIc86p5ip6nVGkRG','Gujarat','Ahmedabad','123 Main Street, Near Circle','https://example.com','2026-06-16 05:47:46','2026-06-16 05:47:46'),(30,26,2,'Joy','Knowles','duvikicyl@mailinator.com','+1 (914) 327-1398',NULL,NULL,'$2b$10$cqU4MEWIDJNAlMqLPX1HNuPgTl1Q4q3YT.YMvNPXwk/dp8OtegQIa','Dosso Region','Département de Dogondoutchi',NULL,NULL,'2026-06-16 13:25:51','2026-06-16 13:25:51'),(40,25,3,'Staff 2','SURNAME 2','staff2.surname2@gmail.com','9901235685','2026-06-01','Male','$2b$10$Y9bm52JDY6Sz0Yoo6rC/q.psjyhcYMNBEauz46GsiPH.Q1bKBlmhG','Ahmedabad','Ahmedabad','dsadsafadffdafdfgfgv cvvdgfgfdgfd',NULL,'2026-06-19 09:59:30','2026-06-19 09:59:30'),(41,NULL,1,'Admin','User','admin@example.com','9876543210','1995-01-15','Male','$2b$10$OPe5DsJFbyw9LdRubYZW/u2fi/ET/Xdp3F7h2fXbS3cTe4Tj3hSxK','Gujarat','Ahmedabad','123 SG Highway, Ahmedabad',NULL,'2026-06-26 12:30:06','2026-06-26 12:30:06'),(42,NULL,2,'','','','',NULL,NULL,'$2b$10$aTSYR8mmhYhALoJqay6inuQPbDvPVnjFF7q3RK86ZKXeLhUX5qhr2','','',NULL,NULL,'2026-06-29 04:50:08','2026-06-29 04:50:08'),(43,NULL,4,'testGuest','TestSurname','TestGuest1@gmail.com','9801010101','1997-01-01','Male','$2b$10$db.tf6Opvkd2qdPdRgTsW.EBcaplA84Z8S0jxoPOrhxln2bOOzIZK','Himachal Pradesh','Santokhgarh','Ahmedabad Dark Streets Where No one knows who live th Dark Shadow ','1782710897742-51a53f4defe7.jpg','2026-06-29 05:28:18','2026-06-29 05:28:18'),(44,28,2,'Kevin','sheikh','kevinpajji@gmai.com','8976546657',NULL,NULL,'$2b$10$ZXf4AUDLUlBaEnE0fTH7weqYFKOJnqq3Qii2uMkKdYY0wONNleGBm','Punjab','Ludhiana',NULL,NULL,'2026-06-29 08:08:26','2026-06-29 12:47:26'),(45,NULL,4,'Harshil','Kariya','hk1@gmail.com','7412589630','2003-07-23','Male','$2b$10$HDizZR0KR9sU3nylw3gIq.Qu.jGHRSd19Y31g3VsGXrxvk7Ja.evS','Bihar','Chākia','It is not decalrable','1782809521165-b3178dded9ca.jpg','2026-06-30 08:52:01','2026-06-30 08:55:19'),(46,28,3,'SIDHHARTH','SMITH','sid@gmail.com','9939470389','2004-07-01','Male','$2b$10$MIYNn7gmSzlHAZ/Poah.D.JCqIPBMslVm9Oo2Sbbh7M7uqgMirnZu','Gujarat','Ahmedabad','G-BLOCH, KHAMAN HOUSE, GATHIYA CIRCLE, JALEBI GALI','/home/milan-patel/Desktop/hbms/luxestay/src/public/uploads/profile-photos/1782812144021-c32fb7912367.jpg','2026-06-30 09:35:44','2026-06-30 09:35:44');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-02 15:24:49
