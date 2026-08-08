CREATE TABLE `refresh_sessions` (
  `session_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `account_type` enum('customer','admin') NOT NULL,
  `customer_id` int(10) UNSIGNED DEFAULT NULL,
  `admin_id` int(10) UNSIGNED DEFAULT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
    ON UPDATE current_timestamp(),

  PRIMARY KEY (`session_id`),
  UNIQUE KEY `uq_refresh_sessions_token_hash` (`token_hash`),

  KEY `idx_refresh_sessions_customer` (
    `customer_id`,
    `revoked_at`,
    `expires_at`
  ),

  KEY `idx_refresh_sessions_admin` (
    `admin_id`,
    `revoked_at`,
    `expires_at`
  ),

  CONSTRAINT `fk_refresh_sessions_customer`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`customer_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `fk_refresh_sessions_admin`
    FOREIGN KEY (`admin_id`)
    REFERENCES `admins` (`admin_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `chk_refresh_sessions_account`
    CHECK (
      (
        `account_type` = 'customer'
        AND `customer_id` IS NOT NULL
        AND `admin_id` IS NULL
      )
      OR
      (
        `account_type` = 'admin'
        AND `admin_id` IS NOT NULL
        AND `customer_id` IS NULL
      )
    )
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;