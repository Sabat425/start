-- Bank System SQL Schema (with multi-currency accounts)
-- Database: s930_sado

CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `national_id_card_url` VARCHAR(255) NOT NULL,
  `birth_date` DATE NOT NULL,
  `country` VARCHAR(50) NOT NULL,
  `city` VARCHAR(50) NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `accounts` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `account_id` VARCHAR(20) NOT NULL,
  `currency` ENUM('USD','KHR') NOT NULL,
  `balance` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `account_pin` VARCHAR(6) NOT NULL,
  `userqrcodedata` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Example user and accounts
INSERT INTO `users` (`name`, `email`, `password`, `national_id_card_url`, `birth_date`, `country`, `city`, `phone_number`)
VALUES ('sado', 'sado@example.com', 'testpass', 'https://example.com/idcard/sado.png', '2000-01-01', 'Cambodia', 'Phnom Penh', '012813949');

INSERT INTO `accounts` (`user_id`, `account_id`, `currency`, `balance`, `account_pin`, `userqrcodedata`)
VALUES
  (1, '92832838', 'USD', 1000.00, '1234', 'RNB:293828383'),
  (1, '92832839', 'KHR', 4000000.00, '1234', 'RNB:293828384');

CREATE TABLE `deposit_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `account_id` INT(11) NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `date` DATETIME NOT NULL,
  `note` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `withdraw_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `account_id` INT(11) NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `date` DATETIME NOT NULL,
  `note` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `transfer_transaction` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `from_account_id` INT(11) NOT NULL,
  `to_account_id` INT(11) NOT NULL,
  `amount` DECIMAL(18,2) NOT NULL,
  `date` DATETIME NOT NULL,
  `note` VARCHAR(255),
  PRIMARY KEY (`id`),
  FOREIGN KEY (`from_account_id`) REFERENCES `accounts`(`id`),
  FOREIGN KEY (`to_account_id`) REFERENCES `accounts`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
