import * as SQLite from 'expo-sqlite';

export const dbName = 'movieapp.db';

export async function initDatabase() {
  const db = await SQLite.openDatabaseAsync(dbName);
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      posterUrl TEXT,
      duration INTEGER,
      status TEXT CHECK( status IN ('Now Showing', 'Coming Soon') ) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Theaters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT
    );

    CREATE TABLE IF NOT EXISTS Showtimes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      movie_id INTEGER NOT NULL,
      theater_id INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      room TEXT,
      price REAL,
      FOREIGN KEY(movie_id) REFERENCES Movies(id) ON DELETE CASCADE,
      FOREIGN KEY(theater_id) REFERENCES Theaters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      showtime_id INTEGER NOT NULL,
      seat_number TEXT NOT NULL,
      created_at DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY(showtime_id) REFERENCES Showtimes(id) ON DELETE CASCADE
    );
  `);
  
  // Fix URLs directly in case they were already broken
  try {
    await db.execAsync(`
      UPDATE Movies SET posterUrl = 'https://upload.wikimedia.org/wikipedia/en/0/00/Spider-Man_No_Way_Home_poster.jpg' WHERE title LIKE '%Spider-Man%';
      UPDATE Movies SET posterUrl = 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg' WHERE title LIKE '%Avengers%';
      UPDATE Movies SET posterUrl = 'https://upload.wikimedia.org/wikipedia/en/f/ff/The_Batman_%28film%29_poster.jpg' WHERE title LIKE '%Batman%';
      UPDATE Movies SET posterUrl = 'https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_Part_Two_poster.jpg' WHERE title LIKE '%Dune%';
    `);
  } catch(e) {}
  
  // Seed initial data if empty
  const movieCount = await db.getFirstAsync<{count: number}>("SELECT COUNT(*) as count FROM Movies;");
  if (movieCount && movieCount.count === 0) {
    await insertDummyData(db);
  }
}

async function insertDummyData(db: SQLite.SQLiteDatabase) {
  // Insert dummy user
  await db.runAsync(`INSERT INTO Users (username, password) VALUES (?, ?)`, ['admin', '123456']);

  // Use sequential inserts for dummy data to avoid issues.
  await db.runAsync(`INSERT INTO Movies (title, description, posterUrl, duration, status) VALUES (?, ?, ?, ?, ?)`, ['Avengers: Endgame', 'The Avengers...', 'https://upload.wikimedia.org/wikipedia/en/0/0d/Avengers_Endgame_poster.jpg', 181, 'Now Showing']);
  await db.runAsync(`INSERT INTO Movies (title, description, posterUrl, duration, status) VALUES (?, ?, ?, ?, ?)`, ['Spider-Man: No Way Home', 'With Spider-Mans...', 'https://upload.wikimedia.org/wikipedia/en/0/00/Spider-Man_No_Way_Home_poster.jpg', 148, 'Now Showing']);
  await db.runAsync(`INSERT INTO Movies (title, description, posterUrl, duration, status) VALUES (?, ?, ?, ?, ?)`, ['The Batman', 'When a sadistic serial...', 'https://upload.wikimedia.org/wikipedia/en/f/ff/The_Batman_%28film%29_poster.jpg', 176, 'Coming Soon']);
  await db.runAsync(`INSERT INTO Movies (title, description, posterUrl, duration, status) VALUES (?, ?, ?, ?, ?)`, ['Dune: Part Two', 'Paul Atreides unites...', 'https://upload.wikimedia.org/wikipedia/en/8/8e/Dune_Part_Two_poster.jpg', 166, 'Coming Soon']);

  await db.runAsync(`INSERT INTO Theaters (name, address) VALUES (?, ?)`, ['CGV Vincom', 'Vincom Center']);
  await db.runAsync(`INSERT INTO Theaters (name, address) VALUES (?, ?)`, ['Lotte Cinema', 'Lotte Mart']);

  await db.runAsync(`INSERT INTO Showtimes (movie_id, theater_id, start_time, room, price) VALUES (?, ?, ?, ?, ?)`, [1, 1, '18:00', 'Room 1', 100000]);
  await db.runAsync(`INSERT INTO Showtimes (movie_id, theater_id, start_time, room, price) VALUES (?, ?, ?, ?, ?)`, [1, 2, '20:00', 'Room 2', 120000]);
  await db.runAsync(`INSERT INTO Showtimes (movie_id, theater_id, start_time, room, price) VALUES (?, ?, ?, ?, ?)`, [2, 1, '19:30', 'Room 3', 90000]);
}