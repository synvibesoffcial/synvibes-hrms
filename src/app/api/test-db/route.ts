import mysql from 'mysql2/promise';



interface EmployeeAttendanceRecord {
  emp_id: string | null;
  fingerprint_id: string;
  name: string | null;
  company: string | null;
  timestamp: string;
  latitude: string | number | null;
  longitude: string | number | null;
  is_active: boolean | number | null;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Create joined records - Employee and Attendance records linked by fingerprint_id
    const [employeeAttendanceRecords] = await connection.execute(`
      SELECT 
        a.emp_id,
        e.fingerprint_id,
        a.name,
        a.company,
        e.timestamp,
        e.latitude,
        e.longitude,
        a.is_active
      FROM employees e
      LEFT JOIN attendance a ON e.fingerprint_id = a.fingerprint_id
      ORDER BY e.fingerprint_id, e.timestamp DESC
    `);

    // Convert latitude and longitude from strings to numbers with validation
    const processedEmployeeAttendanceRecords = (employeeAttendanceRecords as EmployeeAttendanceRecord[]).map(record => ({
      ...record,
      latitude: record.latitude !== null && record.latitude !== undefined ? Number(record.latitude) : null,
      longitude: record.longitude !== null && record.longitude !== undefined ? Number(record.longitude) : null,
      is_active: record.is_active !== null ? Boolean(record.is_active) : null
    }));

    await connection.end();

    return new Response(JSON.stringify({ 
      employeeAttendanceRecords: processedEmployeeAttendanceRecords 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    const mysqlError = error as { code?: string; errno?: number; sqlState?: string };
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: mysqlError.code,
      errno: mysqlError.errno,
      sqlState: mysqlError.sqlState,
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch data from database',
      details: errorMessage,
      code: mysqlError.code || 'UNKNOWN'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}