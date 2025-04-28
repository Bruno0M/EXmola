import * as SQLite from 'expo-sqlite';
import { Quotation } from './types';

const db = SQLite.openDatabaseAsync("database.db");

export const initDatabase = async () => {
  console.log('Initializing native database...');
  try {
    const database = await db;
    await database.execAsync(
      `CREATE TABLE IF NOT EXISTS quotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        currency TEXT NOT NULL,
        latest_date TEXT NOT NULL,
        previous_date TEXT NOT NULL,
        latest_value REAL NOT NULL,
        previous_value REAL NOT NULL
      );`
    );
    return Promise.resolve();
  } catch (error) {
    console.error('Error initializing database:', error);
    return Promise.reject(error);
  }
};

export const addQuotation = async (quotation: Quotation): Promise<void> => {
  try {
    const database = await db;
    await database.runAsync(
      'INSERT INTO quotations (currency, latest_date, previous_date, latest_value, previous_value) VALUES (?, ?, ?, ?, ?);',
      [quotation.currency, quotation.latest_date, quotation.previous_date, quotation.latest_value, quotation.previous_value]
    );
  } catch (error) {
    console.error('Error adding quotation:', error);
    throw error;
  }
};

export const getQuotations = async (): Promise<Quotation[]> => {
  try {
    const database = await db;
    return await database.getAllAsync('SELECT * FROM quotations;');
  } catch (error) {
    console.error('Error getting quotations:', error);
    throw error;
  }
};