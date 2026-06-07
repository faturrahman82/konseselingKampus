ALTER TABLE `Appointment`
  ADD COLUMN `hiddenByStudentAt` DATETIME(3) NULL,
  ADD COLUMN `hiddenByCounselorAt` DATETIME(3) NULL;
