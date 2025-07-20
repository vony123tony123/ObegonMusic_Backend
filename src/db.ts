import pgPromise from 'pg-promise';
import { dbConfig } from './config/database';

const pgp = pgPromise({});
export const db = pgp(dbConfig);