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
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch data from database' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}