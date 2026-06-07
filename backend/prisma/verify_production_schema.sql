SELECT
  expected.table_name,
  expected.column_name,
  CASE WHEN actual.COLUMN_NAME IS NULL THEN 'MISSING' ELSE 'OK' END AS status
FROM (
  SELECT 'Appointment' AS table_name, 'hiddenByStudentAt' AS column_name
  UNION ALL
  SELECT 'Appointment', 'hiddenByCounselorAt'
) AS expected
LEFT JOIN INFORMATION_SCHEMA.COLUMNS AS actual
  ON actual.TABLE_SCHEMA = DATABASE()
 AND actual.TABLE_NAME = expected.table_name
 AND actual.COLUMN_NAME = expected.column_name;
