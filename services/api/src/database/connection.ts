import { Pool } from 'pg';
import { getSecret } from '../services/secrets.service';

let pool: Pool | null = null;

export async function getDbPool() {
  if (pool) {
    return pool;
  }

  try {
    // Obtener credenciales de Secrets Manager
    const creds = await getSecret('examen2-db-credentials');

    pool = new Pool({
      host: creds.rdsHost,
      user: creds.username,
      password: creds.password,
      database: creds.dbname,
      port: creds.port,
      max: 20, // número máximo de conexiones
      idleTimeoutMillis: 30000, // tiempo de espera antes de cerrar la conexión
      connectionTimeoutMillis: 2000, // tiempo de espera antes de intentar una nueva conexión
      ssl: {
        rejectUnauthorized: false // Desactiva la validación estricta del certificado
      }
    });

    const res = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa a la base de datos RDS:', res.rows[0].now);

    return pool;
  } catch (error) {
    console.error('Error al conectar a la base de datos RDS:', error);
    throw error;
  }
};