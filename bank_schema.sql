-- Bank System SQL Schema
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
  `account_id` VARCHAR(20) NOT NULL,
  `account_pin` VARCHAR(6) NOT NULL,
  `userqrcodedata` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `users` (
  `name`, `email`, `password`, `national_id_card_url`, `birth_date`, `country`, `city`, `phone_number`, `account_id`, `account_pin`, `userqrcodedata`
) VALUES (
  'sado', 'sado@example.com', 'testpass', 'https://example.com/idcard/sado.png', '2000-01-01', 'Cambodia', 'Phnom Penh', '012813949', '92832838', '1234', 'RNB:293828383'
);

CREATE TABLE `deposit_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `date` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `withdraw_history` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `date` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `transfer_transaction` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `from_user_id` INT(11) NOT NULL,
  `to_user_id` INT(11) NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `date` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
