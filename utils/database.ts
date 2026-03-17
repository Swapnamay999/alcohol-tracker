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

      CREATE TABLE IF NOT EXISTS user_presets (
      id TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      volume_ml REAL NOT NULL,
      abv REAL NOT NULL,
      icon TEXT NOT NULL,
      is_custom INTEGER NOT NULL, -- 1 for true, 0 for false
      is_deleted INTEGER NOT NULL DEFAULT 0, -- 1 for deleted (soft delete), 0 for active
      PRIMARY KEY (id, user_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
    `);

    try {
        db.execSync('ALTER TABLE user_presets ADD COLUMN is_deleted INTEGER DEFAULT 0;');
      } catch (e) {
        // Column already exists, safe to ignore
    }
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

export const updateDrinkLogCount = (userId: number, timestamp: string, newCount: number) => {
  const statement = db.prepareSync(
    'UPDATE drink_logs SET count = $newCount WHERE user_id = $userId AND timestamp = $timestamp'
  );
  try {
    statement.executeSync({ 
      $newCount: newCount, 
      $userId: userId, 
      $timestamp: timestamp 
    });
  } finally {
    statement.finalizeSync();
  }
};

export const getUserPresets = (userId: number) => {
  const statement = db.prepareSync('SELECT * FROM user_presets WHERE user_id = $userId and is_deleted = 0');
  try {
    return statement.executeSync({ $userId: userId }).getAllSync();
  } finally {
    statement.finalizeSync();
  }
};
export const saveUserPreset = (
  userId: number,
  presetId: string,
  name: string,
  type: string,
  volumeMl: number,
  abv: number,
  icon: string,
  isCustom: number
) => {
  const statement = db.prepareSync(`
    INSERT OR REPLACE INTO user_presets (id, user_id, name, type, volume_ml, abv, icon, is_custom, is_deleted)
    VALUES ($id, $userId, $name, $type, $volumeMl, $abv, $icon, $isCustom, 0)
  `);
  try {
    statement.executeSync({
      $id: presetId,
      $userId: userId,
      $name: name,
      $type: type,
      $volumeMl: volumeMl,
      $abv: abv,
      $icon: icon,
      $isCustom: isCustom,
    });
  } finally {
    statement.finalizeSync();
  }
};

export const deleteCustomPreset = (userId: number, presetId: string) => {
  // Soft Delete: Update flag instead of dropping the row
  const statement = db.prepareSync(
    'UPDATE user_presets SET is_deleted = 1 WHERE user_id = $userId AND id = $id AND is_custom = 1'
  );
  try {
    statement.executeSync({ 
      $userId: userId, 
      $id: presetId 
    });
  } finally {
    statement.finalizeSync();
  }
};

export const resetEditedPresets = (userId: number) => {
  const statement = db.prepareSync(
    'UPDATE user_presets SET is_deleted = 1 WHERE user_id = $userId AND is_custom = 0'
  );
  try {
    statement.executeSync({ 
      $userId: userId 
    });
  } finally {
    statement.finalizeSync();
  }
};
