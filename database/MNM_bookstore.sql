-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.45 - MySQL Community Server - GPL
-- Server OS:                    Linux
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for mybookstore
CREATE DATABASE IF NOT EXISTS `mybookstore` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `mybookstore`;

-- Dumping structure for table mybookstore.books
CREATE TABLE IF NOT EXISTS `books` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `author` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `rating` decimal(4,2) NOT NULL DEFAULT '0.00',
  `stock` int NOT NULL DEFAULT '0',
  `image` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.books: ~20 rows (approximately)
INSERT INTO `books` (`id`, `title`, `author`, `category`, `price`, `rating`, `stock`, `image`, `created_at`, `updated_at`) VALUES
	('019df0df-1210-7197-aaf8-deda0bc1d161', 'Đắc Nhân Tâm', 'DALE CARNEGIE', 'Sách tự lực', 76000.00, 4.90, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777968972/books/zojaigglfimqppigs0tf.jpg', '2026-05-04 02:44:04', '2026-05-05 08:16:39'),
	('019df0e4-09f1-7026-9e05-d46e851bcb6a', 'Cha Giàu Cha Nghèo', 'Robert Kiyosaki, Sharon L. Lechter', 'Tài chính cá nhân, Phi hư cấu', 30000.00, 5.00, 16, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777968887/books/gg9tsceyllgmxfvzcxhn.jpg', '2026-05-04 02:49:29', '2026-05-05 08:14:51'),
	('019df0e5-28e0-73f0-95b7-e323701b6c1e', 'Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 'Văn học thiếu nhi, Hư cấu', 128000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777968956/books/vrzolxwtgjcjzcpbveqa.jpg', '2026-05-04 02:50:43', '2026-05-05 08:16:00'),
	('019df0e7-129e-721d-b6e7-932311dd9c1f', 'Sống Chậm', 'Melanie Barnes', 'Cuộc sống', 50000.00, 4.50, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969320/books/mlnkvt0tax1ey0ytyaxn.jpg', '2026-05-04 02:52:48', '2026-05-05 08:22:04'),
	('019df0e8-084e-716c-821b-1c75a7ad1570', 'Tư Duy Nhanh Và Chậm', 'Daniel Kahneman', 'Phi hư cấu', 215000.00, 4.90, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969453/books/rdomsygvkk3mkhe89fud.jpg', '2026-05-04 02:53:51', '2026-05-05 08:24:17'),
	('019df0e9-0754-72a5-b658-b278349afc48', 'Nhà Giả Kim', 'Paulo Coelho', 'Tiểu thuyết, Kịch, Nhiệm vụ, Hư cấu kỳ ảo, Tiểu thuyết giáo dục, Tiểu thuyết phiêu lưu', 228000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969156/books/g4zdd5ynieoy6d3ohnan.jpg', '2026-05-04 02:54:56', '2026-05-05 08:19:21'),
	('019df0ee-8bba-72ea-bdea-11d49ce98054', 'Chí Phèo', 'Nam Cao', 'Truyện ngắn, Hư cấu', 36000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777968908/books/evpjgd5mrnlvvqosvyue.png', '2026-05-04 03:00:58', '2026-05-05 08:15:11'),
	('019df0f3-3a91-7091-8387-90aabc35b3b3', 'Số Đỏ', 'Vũ Trọng Phụng', 'Tiểu thuyết, Châm biếm, Hư cấu', 52000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969286/books/zyi0kvysyu3jyxjwgwy7.jpg', '2026-05-04 03:06:05', '2026-05-05 08:21:44'),
	('019df0f4-4301-72aa-9a0a-0a4421aeccaf', 'Làm Đĩ', 'Vũ Trọng Phụng', 'Tiểu thuyết', 57000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969058/books/jimar2j8e7hn00mucupg.jpg', '2026-05-04 03:07:13', '2026-05-05 08:17:43'),
	('019df0f5-2fa8-7355-80e0-6743a8a5a1e9', 'Tắt Đèn', 'Ngô Tất Tố', 'Hư cấu', 35000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969348/books/i21kl1zlf9csecp54jmu.jpg', '2026-05-04 03:08:13', '2026-05-05 08:22:32'),
	('019df0f6-62ec-738b-8ad9-a370fa14ef64', 'Cánh Đồng Bất Tận', 'Nguyễn Ngọc Tư', 'Hư cấu', 66000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777968873/books/qcd1zjsihsjmyuq8biyo.jpg', '2026-05-04 03:09:32', '2026-05-05 08:14:39'),
	('019df0fc-c5dd-7262-a599-2ee74361c76d', 'Những Ngày Thơ Ấu', 'Nguyên Hồng', 'Hư cấu tiểu sử, Tiểu thuyết trong nhà', 60000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969252/books/bg37vdekzp1r98yhki9a.jpg', '2026-05-04 03:16:30', '2026-05-05 08:20:57'),
	('019df0fd-b5c4-72fd-bf2c-e578a43fff57', 'Truyện Kiều', 'Nguyễn Du', 'Truyện thơ', 51000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969372/books/lol5v5rki2bbgvhkpzzq.jpg', '2026-05-04 03:17:32', '2026-05-05 08:22:55'),
	('019df0ff-d6e9-72c5-b204-c8ff7b7b2805', 'Nhật Ký Trong Tù', 'Hồ Chí Minh', 'Nhật ký', 60000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969194/books/hlefhbexbwyngafl8pls.png', '2026-05-04 03:19:51', '2026-05-05 08:19:58'),
	('019df101-0698-7213-bd8c-0e8097f366e9', 'Tuổi Thơ Dữ Dội', 'Phùng Quán', 'Tiểu thuyết, Tiểu thuyết chiến tranh', 68000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969480/books/six70mzuxbb9nwteod5k.jpg', '2026-05-04 03:21:09', '2026-05-05 08:24:45'),
	('019df101-c931-70f7-8f44-f742b378c2aa', 'Vợ Nhặt', 'Kim Lân', 'Truyện ngắn, Tiểu thuyết lãng mạn, Tiểu thuyết trong nhà', 45000.00, 5.00, 20, 'http://127.0.0.1:8000/storage/books/df8355f0-d291-4456-9441-161eb680fdf7.png', '2026-05-04 03:21:59', '2026-05-05 08:25:34'),
	('019df103-d45e-73b1-ac1c-4aa1b8dd70c8', 'Mắt Biếc', 'Nguyễn Nhật Ánh', 'Truyện dài', 104000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969123/books/ag2innzk7ffmdqns8kxj.jpg', '2026-05-04 03:24:13', '2026-05-05 08:18:48'),
	('019df104-cb23-7049-9d34-e37d90aaa08c', 'Gió Lạnh Đầu Mùa', 'Thạch Lam', 'Hư cấu', 54000.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969013/books/zehaxmfxeuj5tt3elm6c.jpg', '2026-05-04 03:25:16', '2026-05-05 08:17:06'),
	('019df106-5ced-71cc-b9a0-a7a675e980ec', 'Vang Bóng Một Thời', 'Nguyễn Tuân', 'Tập tùy bút, truyện ngắn', 148750.00, 5.00, 20, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969510/books/oeolni8znl8urirsn0is.jpg', '2026-05-04 03:26:59', '2026-05-05 08:25:13'),
	('019df5c1-1a3e-73be-bb6a-70f02d024ba4', 'Lập trình python', 'nam', 'nam', 2000.00, 5.00, 38, 'https://res.cloudinary.com/dwuzfsijt/image/upload/v1777969082/books/jthpsct9afreezryikuv.jpg', '2026-05-05 01:29:26', '2026-05-05 08:18:08');

-- Dumping structure for table mybookstore.cache
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.cache: ~0 rows (approximately)

-- Dumping structure for table mybookstore.cache_locks
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.cache_locks: ~0 rows (approximately)

-- Dumping structure for table mybookstore.cart_items
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `book_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci,
  `quantity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_items_user_id_book_id_unique` (`user_id`,`book_id`),
  KEY `cart_items_book_id_foreign` (`book_id`),
  CONSTRAINT `cart_items_book_id_foreign` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.cart_items: ~1 rows (approximately)
INSERT INTO `cart_items` (`id`, `user_id`, `book_id`, `price`, `title`, `image`, `quantity`, `created_at`, `updated_at`) VALUES
	('019df1c8-e5ed-710b-96a1-934853cb0dcc', '019df077-c5d0-7242-95cd-730d47a7f845', '019df0e4-09f1-7026-9e05-d46e851bcb6a', 30000.00, 'Cha Giàu Cha Nghèo', 'http://127.0.0.1:8000/storage/books/aa7e7b9e-b89b-4a63-b907-f5a580bd5dab.jpg', 2, '2026-05-04 06:59:28', '2026-05-04 07:00:00');

-- Dumping structure for table mybookstore.failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.failed_jobs: ~0 rows (approximately)

-- Dumping structure for table mybookstore.invalidated_tokens
CREATE TABLE IF NOT EXISTS `invalidated_tokens` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiry_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.invalidated_tokens: ~0 rows (approximately)

-- Dumping structure for table mybookstore.jobs
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.jobs: ~0 rows (approximately)

-- Dumping structure for table mybookstore.job_batches
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.job_batches: ~0 rows (approximately)

-- Dumping structure for table mybookstore.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.migrations: ~4 rows (approximately)
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000000_create_users_table', 1),
	(2, '0001_01_01_000001_create_cache_table', 1),
	(3, '0001_01_01_000002_create_jobs_table', 1),
	(4, '2026_05_03_000100_create_bookstore_tables', 1);

-- Dumping structure for table mybookstore.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_status` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_reference` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_user_id_foreign` (`user_id`),
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.orders: ~4 rows (approximately)
INSERT INTO `orders` (`id`, `user_id`, `total_price`, `phone`, `address`, `latitude`, `longitude`, `status`, `payment_method`, `payment_status`, `payment_reference`, `paid_at`, `created_at`, `updated_at`) VALUES
	('019df31b-ca04-70e7-9133-c7fba76653ff', '019df077-c5d0-7242-95cd-730d47a7f845', 60000.00, '0900000000', 'Test payOS address', NULL, NULL, 'PENDING_PAYMENT', 'BANK_TRANSFER', 'PENDING', 'DH-019DF31B', NULL, '2026-05-04 13:09:38', '2026-05-04 13:09:38'),
	('019df31d-65a8-71d0-9140-ad264c13e4a5', '019df077-c5d0-7242-95cd-730d47a7f845', 60000.00, '0900000000', 'Test payOS address', NULL, NULL, 'PENDING_PAYMENT', 'BANK_TRANSFER', 'PENDING', 'DH-019DF31D', NULL, '2026-05-04 13:11:23', '2026-05-04 13:11:23'),
	('019df5c3-c28f-7022-9c94-9565ee1221a7', '019df098-1086-7030-b76c-e872751ec510', 1000.00, '0123456789', 'a', NULL, NULL, 'PENDING_PAYMENT', 'BANK_TRANSFER', 'PENDING', 'DH-019DF5C3', NULL, '2026-05-05 01:32:20', '2026-05-05 01:32:20'),
	('019df5cc-77d0-708f-b37c-90714b2e614c', '019df098-1086-7030-b76c-e872751ec510', 1000.00, '0123456789', 'a', NULL, NULL, 'PENDING_PAYMENT', 'BANK_TRANSFER', 'PENDING', 'DH-019DF5CC', NULL, '2026-05-05 01:41:51', '2026-05-05 01:41:51');

-- Dumping structure for table mybookstore.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `book_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` text COLLATE utf8mb4_unicode_ci,
  `quantity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_book_id_foreign` (`book_id`),
  CONSTRAINT `order_items_book_id_foreign` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.order_items: ~4 rows (approximately)
INSERT INTO `order_items` (`id`, `order_id`, `book_id`, `price`, `title`, `image`, `quantity`, `created_at`, `updated_at`) VALUES
	('019df31b-caac-73b0-856d-597a9c0e7441', '019df31b-ca04-70e7-9133-c7fba76653ff', '019df0e4-09f1-7026-9e05-d46e851bcb6a', 30000.00, 'Cha Giàu Cha Nghèo', 'http://127.0.0.1:8000/storage/books/aa7e7b9e-b89b-4a63-b907-f5a580bd5dab.jpg', 2, '2026-05-04 13:09:38', '2026-05-04 13:09:38'),
	('019df31d-65c0-7175-8b0b-078c095cc7ed', '019df31d-65a8-71d0-9140-ad264c13e4a5', '019df0e4-09f1-7026-9e05-d46e851bcb6a', 30000.00, 'Cha Giàu Cha Nghèo', 'http://127.0.0.1:8000/storage/books/aa7e7b9e-b89b-4a63-b907-f5a580bd5dab.jpg', 2, '2026-05-04 13:11:23', '2026-05-04 13:11:23'),
	('019df5c3-c2e0-7153-8ed9-389561293250', '019df5c3-c28f-7022-9c94-9565ee1221a7', '019df5c1-1a3e-73be-bb6a-70f02d024ba4', 1000.00, 'Lập trình python', 'http://127.0.0.1:8000/storage/books/6261bf56-94da-491c-a007-e80a97df591e.jpg', 1, '2026-05-05 01:32:20', '2026-05-05 01:32:20'),
	('019df5cc-77e7-729b-908f-babd5853fdfe', '019df5cc-77d0-708f-b37c-90714b2e614c', '019df5c1-1a3e-73be-bb6a-70f02d024ba4', 1000.00, 'Lập trình python', 'http://127.0.0.1:8000/storage/books/6261bf56-94da-491c-a007-e80a97df591e.jpg', 1, '2026-05-05 01:41:51', '2026-05-05 01:41:51');

-- Dumping structure for table mybookstore.payment_session
CREATE TABLE IF NOT EXISTS `payment_session` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `reference` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qr_url` text COLLATE utf8mb4_unicode_ci,
  `payment_url` text COLLATE utf8mb4_unicode_ci,
  `provider_transaction_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_order_code` bigint unsigned DEFAULT NULL,
  `provider_payment_link_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `callback_token` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `confirmed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_session_provider_order_code_unique` (`provider_order_code`),
  UNIQUE KEY `payment_session_callback_token_unique` (`callback_token`),
  KEY `payment_session_order_id_foreign` (`order_id`),
  CONSTRAINT `payment_session_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.payment_session: ~3 rows (approximately)
INSERT INTO `payment_session` (`id`, `order_id`, `provider`, `status`, `amount`, `reference`, `qr_url`, `payment_url`, `provider_transaction_id`, `provider_order_code`, `provider_payment_link_id`, `callback_token`, `expires_at`, `confirmed_at`, `created_at`, `updated_at`) VALUES
	('019df31d-6b5e-705d-afe1-d5549a6446ed', '019df31d-65a8-71d0-9140-ad264c13e4a5', 'PAYOS', 'PENDING', 60000.00, 'DH-019DF31D', 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=00020101021238590010A000000727012900069704180115V3CAS88603830730208QRIBFTTA53037045405600005802VN62270823CSL1U1N0KV5%20DH%20019DF31D6304EE4B', 'https://pay.payos.vn/web/af91f085e3084661af69610ca04d3d81', NULL, 1777900283502, 'af91f085e3084661af69610ca04d3d81', '3d447dae4cf4436da99bd973eafca226', '2026-05-04 13:26:24', NULL, '2026-05-04 13:11:24', '2026-05-04 13:11:24'),
	('019df5c3-d09c-72dd-ac8f-4f96094bdff1', '019df5c3-c28f-7022-9c94-9565ee1221a7', 'PAYOS', 'PENDING', 1000.00, 'DH-019DF5C3', 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=00020101021238590010A000000727012900069704180115V3CAS88603830730208QRIBFTTA5303704540410005802VN62270823CSODB06QME8%20DH%20019DF5C3630479EB', 'https://pay.payos.vn/web/331c7a115aa44dc4a83df4bfb371dccd', NULL, 1777944740924, '331c7a115aa44dc4a83df4bfb371dccd', '0bd0c299046646e2a6535b6875ce380b', '2026-05-05 01:47:24', NULL, '2026-05-05 01:32:24', '2026-05-05 01:32:24'),
	('019df5cc-7b7b-70ee-9a78-2c974adf4311', '019df5cc-77d0-708f-b37c-90714b2e614c', 'PAYOS', 'PENDING', 1000.00, 'DH-019DF5CC', 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=00020101021238590010A000000727012900069704180115V3CAS88603830730208QRIBFTTA5303704540410005802VN62270823CSOU7H7OTH1%20DH%20019DF5CC630499AA', 'https://pay.payos.vn/web/96e0f6aebd1d41809de3b2859e61379d', NULL, 1777945312217, '96e0f6aebd1d41809de3b2859e61379d', 'fbcbadb56d394bf49c60670f40d500ad', '2026-05-05 01:56:52', NULL, '2026-05-05 01:41:52', '2026-05-05 01:41:52');

-- Dumping structure for table mybookstore.permissions
CREATE TABLE IF NOT EXISTS `permissions` (
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.permissions: ~0 rows (approximately)

-- Dumping structure for table mybookstore.permission_role
CREATE TABLE IF NOT EXISTS `permission_role` (
  `role_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`role_name`,`permission_name`),
  KEY `permission_role_permission_name_foreign` (`permission_name`),
  CONSTRAINT `permission_role_permission_name_foreign` FOREIGN KEY (`permission_name`) REFERENCES `permissions` (`name`) ON DELETE CASCADE,
  CONSTRAINT `permission_role_role_name_foreign` FOREIGN KEY (`role_name`) REFERENCES `roles` (`name`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.permission_role: ~0 rows (approximately)

-- Dumping structure for table mybookstore.review
CREATE TABLE IF NOT EXISTS `review` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `book_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'APPROVED',
  `verified_purchase` tinyint(1) NOT NULL DEFAULT '0',
  `admin_reply` text COLLATE utf8mb4_unicode_ci,
  `customer_reply` text COLLATE utf8mb4_unicode_ci,
  `replied_at` timestamp NULL DEFAULT NULL,
  `customer_replied_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `review_book_id_foreign` (`book_id`),
  KEY `review_user_id_foreign` (`user_id`),
  CONSTRAINT `review_book_id_foreign` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.review: ~0 rows (approximately)
INSERT INTO `review` (`id`, `book_id`, `user_id`, `rating`, `content`, `status`, `verified_purchase`, `admin_reply`, `customer_reply`, `replied_at`, `customer_replied_at`, `created_at`, `updated_at`) VALUES
	('019df1ca-b25d-71f4-9901-d64c504e55b0', '019df0e4-09f1-7026-9e05-d46e851bcb6a', '019df077-c5d0-7242-95cd-730d47a7f845', 4, 'sách rất hay', 'APPROVED', 0, NULL, NULL, NULL, NULL, '2026-05-04 07:01:26', '2026-05-04 07:01:26');

-- Dumping structure for table mybookstore.review_reply
CREATE TABLE IF NOT EXISTS `review_reply` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `review_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_reply_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `review_reply_review_id_foreign` (`review_id`),
  KEY `review_reply_parent_reply_id_foreign` (`parent_reply_id`),
  KEY `review_reply_user_id_foreign` (`user_id`),
  CONSTRAINT `review_reply_parent_reply_id_foreign` FOREIGN KEY (`parent_reply_id`) REFERENCES `review_reply` (`id`) ON DELETE SET NULL,
  CONSTRAINT `review_reply_review_id_foreign` FOREIGN KEY (`review_id`) REFERENCES `review` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_reply_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.review_reply: ~0 rows (approximately)
INSERT INTO `review_reply` (`id`, `review_id`, `parent_reply_id`, `user_id`, `content`, `created_at`, `updated_at`) VALUES
	('019df1ca-ddeb-70be-8193-59f4832fa659', '019df1ca-b25d-71f4-9901-d64c504e55b0', NULL, '019df077-c5d0-7242-95cd-730d47a7f845', 'hay phết', '2026-05-04 07:01:37', '2026-05-04 07:01:37');

-- Dumping structure for table mybookstore.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.roles: ~2 rows (approximately)
INSERT INTO `roles` (`name`, `description`, `created_at`, `updated_at`) VALUES
	('ADMIN', 'Admin role', '2026-05-04 00:51:11', '2026-05-04 00:51:11'),
	('USER', 'User role', '2026-05-04 00:51:11', '2026-05-04 00:51:11');

-- Dumping structure for table mybookstore.role_user
CREATE TABLE IF NOT EXISTS `role_user` (
  `role_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`role_name`,`user_id`),
  KEY `role_user_user_id_foreign` (`user_id`),
  CONSTRAINT `role_user_role_name_foreign` FOREIGN KEY (`role_name`) REFERENCES `roles` (`name`) ON DELETE CASCADE,
  CONSTRAINT `role_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.role_user: ~4 rows (approximately)
INSERT INTO `role_user` (`role_name`, `user_id`) VALUES
	('ADMIN', '019df077-c5d0-7242-95cd-730d47a7f845'),
	('USER', '019df090-9bde-72ea-b0b7-22292582cff1'),
	('USER', '019df092-3e23-7171-9a7e-a396fdb40e48'),
	('USER', '019df098-1086-7030-b76c-e872751ec510');

-- Dumping structure for table mybookstore.system_settings
CREATE TABLE IF NOT EXISTS `system_settings` (
  `id` bigint unsigned NOT NULL,
  `store_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BookStore',
  `support_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `office_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `periodic_email` tinyint(1) NOT NULL DEFAULT '1',
  `stock_alert` tinyint(1) NOT NULL DEFAULT '1',
  `new_review` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.system_settings: ~0 rows (approximately)
INSERT INTO `system_settings` (`id`, `store_name`, `support_phone`, `office_address`, `periodic_email`, `stock_alert`, `new_review`, `created_at`, `updated_at`) VALUES
	(1, 'BookStore', '', '', 1, 1, 0, '2026-05-04 00:51:11', '2026-05-04 00:51:11');

-- Dumping structure for table mybookstore.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dob` date DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table mybookstore.users: ~4 rows (approximately)
INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `dob`, `phone`, `address`, `bio`, `two_factor_enabled`, `status`, `created_at`, `updated_at`) VALUES
	('019df077-c5d0-7242-95cd-730d47a7f845', 'Administrator', 'admin@admin.com', '$2y$12$DjcikM4ecpAS40a/8Bq0Xup8/XceN/3FMvzx6Bx8p5Npr1Rk733QO', NULL, NULL, NULL, '', 0, 'ACTIVE', '2026-05-04 00:51:14', '2026-05-04 00:51:14'),
	('019df090-9bde-72ea-b0b7-22292582cff1', 'Test User', 'test_1777857497@example.com', '$2y$12$YHt81LFi1RXFaT5uLRTdCeahSl.Hv7zUXuPKN.CD9gfx8K7d7yRYS', NULL, NULL, NULL, NULL, 0, 'ACTIVE', '2026-05-04 01:18:22', '2026-05-04 01:18:22'),
	('019df092-3e23-7171-9a7e-a396fdb40e48', 'Browser Test', 'browser_1777857607009@example.com', '$2y$12$bIH7c670gXpuzjSnRphVvum4g/i17LTZSP/aQclco0cu5XvXg0436', NULL, NULL, NULL, NULL, 0, 'ACTIVE', '2026-05-04 01:20:09', '2026-05-04 01:20:09'),
	('019df098-1086-7030-b76c-e872751ec510', 'Trịnh Duy Nam', 'a@gmail.com', '$2y$12$Mn6nV9BxBFVmDsD4aUBp4uTQXjzDgYZjZFenO57jp1bdqApmj3rIa', NULL, NULL, NULL, NULL, 0, 'ACTIVE', '2026-05-04 01:26:30', '2026-05-04 01:26:30');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
