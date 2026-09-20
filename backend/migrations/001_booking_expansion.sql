-- HokieExchange schema expansion: booking system.
--
-- Apply against the live database, e.g.:
--   mysql -u USER -p DATABASE < migrations/001_booking_expansion.sql
--
-- The enum-like columns are modeled as VARCHAR + COMMENT to match the existing
-- `services.schedule_type` convention (portable across MySQL/DataBricks).

-- 1. services.category
ALTER TABLE services
    ADD COLUMN category VARCHAR(50) NOT NULL AFTER location;

-- 2. time-blocks.status
ALTER TABLE `time-blocks`
    ADD COLUMN status VARCHAR(11) NOT NULL DEFAULT 'available'
        COMMENT "'available' or 'unavailable'"
        AFTER start_time;

-- 3. appointments
CREATE TABLE appointments (
    appointment_id    INT NOT NULL AUTO_INCREMENT,
    time_block_id     INT NOT NULL,
    student_id        INT NOT NULL,
    status            VARCHAR(16) NOT NULL DEFAULT 'active'
        COMMENT "'seller-cancelled', 'buyer-cancelled', 'active', 'complete', or 'no-show'",
    price_at_booking  DECIMAL(10,2) NOT NULL,
    cancel_reason     VARCHAR(255) NULL,
    cancelled_at      TIMESTAMP NULL,
    completed_at      TIMESTAMP NULL,
    date_created      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_updated      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (appointment_id),
    UNIQUE KEY uq_appointments_time_block (time_block_id),
    CONSTRAINT fk_appointments_time_block FOREIGN KEY (time_block_id)
        REFERENCES `time-blocks` (`time-block-id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_appointments_student FOREIGN KEY (student_id)
        REFERENCES students (student_id) ON DELETE CASCADE ON UPDATE CASCADE
);
