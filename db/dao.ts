import * as SQLite from 'expo-sqlite';
import { dbName } from './database';

export interface Movie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  duration: number;
  status: 'Now Showing' | 'Coming Soon';
}

export interface Theater {
  id: number;
  name: string;
  address: string;
}

export interface Showtime {
  id: number;
  movie_id: number;
  theater_id: number;
  start_time: string;
  room: string;
  price: number;
}

export interface Ticket {
  id: number;
  user_id: number;
  showtime_id: number;
  seat_number: string;
  created_at: string;
}

export async function getMoviesByStatus(status: 'Now Showing' | 'Coming Soon'): Promise<Movie[]> {
  const db = await SQLite.openDatabaseAsync(dbName);
  return await db.getAllAsync<Movie>('SELECT * FROM Movies WHERE status = ?', [status]);
}

export async function getMovieById(id: number): Promise<Movie | null> {
  const db = await SQLite.openDatabaseAsync(dbName);
  return await db.getFirstAsync<Movie>('SELECT * FROM Movies WHERE id = ?', [id]);
}

export async function getTheaters(): Promise<Theater[]> {
  const db = await SQLite.openDatabaseAsync(dbName);
  return await db.getAllAsync<Theater>('SELECT * FROM Theaters');
}

export type ShowtimeWithTheater = Showtime & { theater_name: string; theater_address: string };

export async function getShowtimesByMovieId(movieId: number): Promise<ShowtimeWithTheater[]> {
  const db = await SQLite.openDatabaseAsync(dbName);
  return await db.getAllAsync<ShowtimeWithTheater>(
    `SELECT s.*, t.name as theater_name, t.address as theater_address 
     FROM Showtimes s 
     JOIN Theaters t ON s.theater_id = t.id 
     WHERE s.movie_id = ?`,
    [movieId]
  );
}

export async function getShowtimeById(id: number): Promise<ShowtimeWithTheater | null> {
  const db = await SQLite.openDatabaseAsync(dbName);
  return await db.getFirstAsync<ShowtimeWithTheater>(
    `SELECT s.*, t.name as theater_name, t.address as theater_address 
     FROM Showtimes s 
     JOIN Theaters t ON s.theater_id = t.id 
     WHERE s.id = ?`,
    [id]
  );
}

export async function getBookedSeatsByShowtime(showtimeId: number): Promise<string[]> {
  const db = await SQLite.openDatabaseAsync(dbName);
  const seats = await db.getAllAsync<{seat_number: string}>('SELECT seat_number FROM Tickets WHERE showtime_id = ?', [showtimeId]);
  return seats.map(s => s.seat_number);
}

export async function bookTicket(userId: number, showtimeId: number, seatNumber: string): Promise<number> {
  const db = await SQLite.openDatabaseAsync(dbName);
  const result = await db.runAsync(
    'INSERT INTO Tickets (user_id, showtime_id, seat_number) VALUES (?, ?, ?)',
    [userId, showtimeId, seatNumber]
  );
  return result.lastInsertRowId;
}

export type TicketDetails = Ticket & {
  movie_title: string;
  theater_name: string;
  start_time: string;
  room: string;
};

export async function getTicketsByUserId(userId: number): Promise<TicketDetails[]> {
  const db = await SQLite.openDatabaseAsync(dbName);
  return await db.getAllAsync<TicketDetails>(
    `SELECT t.*, m.title as movie_title, th.name as theater_name, s.start_time, s.room
     FROM Tickets t
     JOIN Showtimes s ON t.showtime_id = s.id
     JOIN Theaters th ON s.theater_id = th.id
     JOIN Movies m ON s.movie_id = m.id
     WHERE t.user_id = ?
     ORDER BY t.created_at DESC`,
    [userId]
  );
}