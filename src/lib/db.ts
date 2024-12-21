import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl || !authToken) {
  throw new Error('Database configuration missing');
}

export const db = createClient({
  url: dbUrl,
  authToken: authToken
});