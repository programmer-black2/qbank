create database medical_question_bank;

use medical_question_bank;

CREATE TABLE `roles` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `name_roles` enum('Admin','Writer','Student') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_roles` (`name_roles`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- test 
CREATE TABLE `subscription_plans` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_days` smallint unsigned NOT NULL,
  `price` decimal(20,2) NOT NULL,
  `discount_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_subscription_plans_discount_percent` CHECK (((`discount_percent` >= 0) and (`discount_percent` <= 100))),
  CONSTRAINT `chk_subscription_plans_duration_days` CHECK ((`duration_days` > 0)),
  CONSTRAINT `chk_subscription_plans_price` CHECK ((`price` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- test
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `role_id` tinyint unsigned NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_phone` (`phone`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `fk_users_role_id` (`role_id`),
  CONSTRAINT `fk_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- test 
CREATE TABLE `user_subscriptions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `subscription_plan_id` smallint unsigned NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_user_subscriptions_user_id` (`user_id`),
  KEY `fk_user_subscriptions_subscription_plan_id` (`subscription_plan_id`),
  CONSTRAINT `fk_user_subscriptions_subscription_plan_id` FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_user_subscriptions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_user_subscriptions_dates` CHECK ((`end_date` > `start_date`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `education_stages` (
  `id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `name_education_stage` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_education_stages_name` (`name_education_stage`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `courses` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `stage_id` tinyint unsigned NOT NULL,
  `name_course` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_courses_stage_name` (`stage_id`,`name_course`),
  CONSTRAINT `fk_courses_stage_id` FOREIGN KEY (`stage_id`) REFERENCES `education_stages` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `years` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `course_id` smallint unsigned NOT NULL,
  `years_number` tinyint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_years_course_number` (`course_id`,`years_number`),
  CONSTRAINT `fk_years_course_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_years_number` CHECK ((`years_number` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `exam_types` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `year_id` smallint unsigned NOT NULL,
  `name_exam_types` enum('midterm','final') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_exam_types_year_name` (`year_id`,`name_exam_types`),
  CONSTRAINT `fk_exam_types_year_id` FOREIGN KEY (`year_id`) REFERENCES `years` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `questions` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_by` int unsigned NOT NULL,
  `exam_type_id` smallint unsigned NOT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` enum('mcq','descriptive') COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulty` enum('easy','medium','hard','unknown') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unknown',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_questions_created_by` (`created_by`),
  KEY `fk_questions_exam_type_id` (`exam_type_id`),
  CONSTRAINT `fk_questions_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_questions_exam_type_id` FOREIGN KEY (`exam_type_id`) REFERENCES `exam_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- test
CREATE TABLE `question_choices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `question_id` int unsigned NOT NULL,
  `option_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_number` tinyint unsigned NOT NULL,
  `is_correct` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_question_choices_question_option` (`question_id`,`option_number`),
  CONSTRAINT `fk_question_choices_question_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_question_choices_option_number` CHECK ((`option_number` between 1 and 10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `question_answers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `question_id` int unsigned NOT NULL,
  `descriptive_answer_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_question_answers_question_id` (`question_id`),
  CONSTRAINT `fk_question_answers_question_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `question_likes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `question_id` int unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_question_likes_user_question` (`user_id`,`question_id`),
  KEY `idx_question_likes_user_id` (`user_id`),
  KEY `idx_question_likes_question_id` (`question_id`),
  CONSTRAINT `fk_question_likes_question_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_question_likes_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `question_reports` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `question_id` int unsigned NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','resolved') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_question_reports_user_id` (`user_id`),
  KEY `idx_question_reports_question_id` (`question_id`),
  KEY `idx_question_reports_status` (`status`),
  CONSTRAINT `fk_question_reports_question_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_question_reports_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




DELIMITER $$
CREATE TRIGGER `trg_question_media_before_insert` BEFORE INSERT ON `question_media` FOR EACH ROW BEGIN
    IF (
        (NEW.question_id IS NULL AND NEW.question_answer_id IS NULL)
        OR
        (NEW.question_id IS NOT NULL AND NEW.question_answer_id IS NOT NULL)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Each media must belong either to a question or to a question answer, not both.';
    END IF;
END
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `trg_question_media_before_update` BEFORE UPDATE ON `question_media` FOR EACH ROW BEGIN
    IF (
        (NEW.question_id IS NULL AND NEW.question_answer_id IS NULL)
        OR
        (NEW.question_id IS NOT NULL AND NEW.question_answer_id IS NOT NULL)
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Each media must belong either to a question or to a question answer, not both.';
    END IF;
END
DELIMITER ;

ALTER TABLE question_choices
ADD CONSTRAINT uq_question_choices_id_question_id UNIQUE (id, question_id);



CREATE TABLE question_selected_options (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    choice_id INT UNSIGNED NOT NULL,

    selected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_question_selected_options_user_question UNIQUE (user_id, question_id),

    INDEX idx_question_selected_options_user_id (user_id),
    INDEX idx_question_selected_options_question_id (question_id),
    INDEX idx_question_selected_options_choice_id (choice_id),

    CONSTRAINT fk_question_selected_options_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_question_selected_options_question_id
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_question_selected_options_choice_question
        FOREIGN KEY (choice_id, question_id)
        REFERENCES question_choices(id, question_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);


CREATE TABLE question_workflow_statuses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT NULL,

    CONSTRAINT uq_question_workflow_statuses_name UNIQUE (name),
    CONSTRAINT uq_question_workflow_statuses_code UNIQUE (code)
);




CREATE TABLE question_status_history (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    question_id INT UNSIGNED NOT NULL,
    old_status_id INT UNSIGNED NULL,
    new_status_id INT UNSIGNED NOT NULL,
    changed_by INT UNSIGNED NOT NULL,

    note TEXT NULL,

    changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_question_status_history_question_id (question_id),
    INDEX idx_question_status_history_old_status_id (old_status_id),
    INDEX idx_question_status_history_new_status_id (new_status_id),
    INDEX idx_question_status_history_changed_by (changed_by),

    CONSTRAINT fk_question_status_history_question_id
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_question_status_history_old_status_id
        FOREIGN KEY (old_status_id)
        REFERENCES question_workflow_statuses(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_question_status_history_new_status_id
        FOREIGN KEY (new_status_id)
        REFERENCES question_workflow_statuses(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_question_status_history_changed_by
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE `question_media` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `question_id` int unsigned DEFAULT NULL,
  `question_answer_id` int unsigned DEFAULT NULL,
  `media_type` enum('image','audio','video','pdf','document') COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(2048) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt_text` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_question_media_question_id` (`question_id`),
  KEY `fk_question_media_question_answer_id` (`question_answer_id`),
  CONSTRAINT `fk_question_media_question_answer_id` FOREIGN KEY (`question_answer_id`) REFERENCES `question_answers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_question_media_question_id` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE exams (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    description TEXT NULL,

    start_time DATETIME NULL,
    duration_minutes INT UNSIGNED NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_exams_start_time (start_time),
    INDEX idx_exams_created_at (created_at)
);


CREATE TABLE exam_questions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    exam_id INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,

    UNIQUE KEY uq_exam_questions_exam_id_question_id (exam_id, question_id),

    INDEX idx_exam_questions_exam_id (exam_id),
    INDEX idx_exam_questions_question_id (question_id),

    CONSTRAINT fk_exam_questions_exam_id
        FOREIGN KEY (exam_id)
        REFERENCES exams(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_exam_questions_question_id
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);




CREATE TABLE student_exam_attempts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    student_id INT UNSIGNED NOT NULL,
    exam_id INT UNSIGNED NOT NULL,

    started_at DATETIME NOT NULL,
    finished_at DATETIME NULL,

    score DECIMAL(5,2) NULL,

    UNIQUE KEY uq_student_exam_attempts_student_id_exam_id (student_id, exam_id),

    INDEX idx_student_exam_attempts_student_id (student_id),
    INDEX idx_student_exam_attempts_exam_id (exam_id),
    INDEX idx_student_exam_attempts_started_at (started_at),

    CONSTRAINT fk_student_exam_attempts_student_id
        FOREIGN KEY (student_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_student_exam_attempts_exam_id
        FOREIGN KEY (exam_id)
        REFERENCES exams(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);



CREATE TABLE student_exam_answers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    exam_attempt_id INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    choice_id INT UNSIGNED NOT NULL,

    UNIQUE KEY uq_student_exam_answers_exam_attempt_id_question_id (exam_attempt_id, question_id),

    INDEX idx_student_exam_answers_exam_attempt_id (exam_attempt_id),
    INDEX idx_student_exam_answers_question_id (question_id),
    INDEX idx_student_exam_answers_choice_id (choice_id),

    CONSTRAINT fk_student_exam_answers_exam_attempt_id
        FOREIGN KEY (exam_attempt_id)
        REFERENCES student_exam_attempts(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_student_exam_answers_question_id
        FOREIGN KEY (question_id)
        REFERENCES questions(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_student_exam_answers_choice_id
        FOREIGN KEY (choice_id)
        REFERENCES question_choices(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

ALTER TABLE question_status_history
ADD INDEX idx_question_status_history_changed_by_changed_at (changed_by, changed_at);

ALTER TABLE `users`
ADD COLUMN `last_login` DATETIME NULL DEFAULT NULL AFTER `is_active`;


ALTER TABLE years
MODIFY years_number SMALLINT UNSIGNED NOT NULL;


ALTER TABLE questions
ADD INDEX idx_questions_question_type (question_type),
ADD INDEX idx_questions_difficulty (difficulty),
ADD INDEX idx_questions_created_at (created_at);

ALTER TABLE question_choices
ADD INDEX idx_question_choices_question_is_correct (question_id, is_correct);

ALTER TABLE user_subscriptions
ADD INDEX idx_user_subscriptions_user_active (user_id, is_active),
ADD INDEX idx_user_subscriptions_end_date (end_date);
