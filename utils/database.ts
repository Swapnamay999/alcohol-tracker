import * as SQLite from 'expo-sqlite';

// Initialize the database synchronously (Modern Expo SDK 50+ approach)
const db = SQLite.openDatabaseSync('bac_tracker.db');

export const initDB = () => {
  try {
    // PRAGMA statements optimize performance and enforce foreign key constraints
    db.execSync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        height REAL NOT NULL,
        weight REAL NOT NULL,
        age INTEGER NOT NULL,
        sex TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS drink_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        volume_ml REAL NOT NULL,
        abv REAL NOT NULL,
        count INTEGER NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      );
    `);
    console.log('Database and relational tables initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error);
  }
};

export const getDB = () => db;


export const addUser = (name: string, height: number, weight: number, age: number, sex: string) => {
  const statement = db.prepareSync(
    'INSERT INTO users (name, height, weight, age, sex) VALUES (?, ?, ?, ?, ?)'
  );
  const result = statement.executeSync([name, height, weight, age, sex]);
  return result.lastInsertRowId;
};

export const getAllUsers = () => {
  return db.getAllSync('SELECT * FROM users');
};

// --- DRINK LOG QUERIES ---

export const addDrinkLog = (userId: number, type: string, volumeMl: number, abv: number, count: number, timestamp: string) => {
  const statement = db.prepareSync(
    'INSERT INTO drink_logs (user_id, type, volume_ml, abv, count, timestamp) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = statement.executeSync([userId, type, volumeMl, abv, count, timestamp]);
  return result.lastInsertRowId;
};

export const getUserDrinks = (userId: number) => {
  // getAllSync directly returns an array of the resulting rows
  return db.getAllSync<any>(
    'SELECT * FROM drink_logs WHERE user_id = ? ORDER BY timestamp ASC', 
    [userId]
  );
};

export const clearUserDrinks = (userId: number) => {
  const statement = db.prepareSync('DELETE FROM drink_logs WHERE user_id = ?');
  statement.executeSync([userId]);
};