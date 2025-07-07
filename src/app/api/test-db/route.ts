import mysql from 'mysql2/promise';

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [attendance] = await connection.execute('SELECT * FROM attendance');
    const [users] = await connection.execute('SELECT * FROM users');

    await connection.end();

    return new Response(JSON.stringify({ attendance, users }), {
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