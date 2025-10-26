import pgPromise from 'pg-promise';

const initOptions = {
  connect: (e: any) => {
    e.client.query('RESET ALL')
      .catch((error: any) => {
        console.error('Error resetting client state:', error);
      });
  },
};

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                   // max number of connections in the pool
  idleTimeoutMillis: 10000,  // idle over 10s then release
  connectionTimeoutMillis: 5000 // Timeout in 5s
};

export const pgp = pgPromise(initOptions);
export const db = pgp(dbConfig);