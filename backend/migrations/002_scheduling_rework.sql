-- HokieExchange scheduling rework: recurring time-blocks, service-level price/duration,
-- appointments with concrete booked_at, verified ratings.

-- Drop scheduling tables in reverse dependency order.
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS `time-blocks`;
DROP TABLE IF EXISTS `time-blocks-config`;
DROP TABLE IF EXISTS services;

-- services: price + duration on the service, no category/schedule_type.
CREATE TABLE services (
    service_id    INT NOT NULL AUTO_INCREMENT,
    vendor_id     INT NOT NULL,
    service_name  VARCHAR(255) NOT NULL,
    description   VARCHAR(1000) NOT NULL,
    location      VARCHAR(255) NULL,
    price         DECIMAL(10,2) NOT NULL,
    duration      TIME NOT NULL,
    date_created  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (service_id),
    CONSTRAINT services_vendors_vendor_id_fk FOREIGN KEY (vendor_id)
        REFERENCES vendors (vendor_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX services_vendors_vendor_id_fk (vendor_id)
);

-- time-blocks: recurring weekly slots (day-of-week + start time; end = start + duration).
CREATE TABLE `time-blocks` (
    `time-block-id` INT NOT NULL AUTO_INCREMENT,
    service_id      INT NOT NULL,
    day_of_week     INT NOT NULL COMMENT '0=Monday ... 6=Sunday',
    start_time      TIME NOT NULL,
    status          VARCHAR(11) NOT NULL DEFAULT 'available' COMMENT "'available' or 'unavailable'",
    date_created    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_updated    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`time-block-id`),
    CONSTRAINT `time-blocks_services_service_id_fk` FOREIGN KEY (service_id)
        REFERENCES services (service_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `time-blocks_services_service_id_fk` (service_id)
);

-- appointments: a concrete booking occurrence of a recurring slot.
CREATE TABLE appointments (
    appointment_id    INT NOT NULL AUTO_INCREMENT,
    time_block_id     INT NOT NULL,
    booked_at         DATETIME NOT NULL,
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
    UNIQUE KEY uq_appointments_time_block_booked_at (time_block_id, booked_at),
    CONSTRAINT fk_appointments_time_block FOREIGN KEY (time_block_id)
        REFERENCES `time-blocks` (`time-block-id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_appointments_student FOREIGN KEY (student_id)
        REFERENCES students (student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX fk_appointments_student (student_id)
);

-- ratings: verified reviews (one per appointment per direction).
ALTER TABLE vendor_ratings
    ADD COLUMN appointment_id INT NULL,
    ADD UNIQUE KEY uq_vendor_ratings_appointment (appointment_id),
    ADD CONSTRAINT fk_vendor_ratings_appointment FOREIGN KEY (appointment_id)
        REFERENCES appointments (appointment_id) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE consumer_ratings
    ADD COLUMN appointment_id INT NULL,
    ADD UNIQUE KEY uq_consumer_ratings_appointment (appointment_id),
    ADD CONSTRAINT fk_consumer_ratings_appointment FOREIGN KEY (appointment_id)
        REFERENCES appointments (appointment_id) ON DELETE SET NULL ON UPDATE CASCADE;
