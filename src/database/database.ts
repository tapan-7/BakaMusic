import * as SQLite from 'expo-sqlite';
import { ScannedTrack } from '../services/musicScannerService';

const db = SQLite.openDatabaseSync('songs.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      duration INTEGER NOT NULL,
      artwork TEXT,
      lastModified REAL NOT NULL
    );
  `);
};

export const getSongsFromDB = (): ScannedTrack[] => {
  try {
    const rows = db.getAllSync('SELECT * FROM songs');
    return rows as ScannedTrack[];
  } catch (error) {
    console.error('Failed to get songs from DB:', error);
    return [];
  }
};

export const getSongById = (id: string): ScannedTrack | null => {
  try {
    const row = db.getFirstSync('SELECT * FROM songs WHERE id = ?', [id]);
    return (row as ScannedTrack) || null;
  } catch (error) {
    console.error('Failed to get song from DB:', error);
    return null;
  }
};

export const insertOrUpdateSong = (song: ScannedTrack) => {
  try {
    db.runSync(
      `INSERT OR REPLACE INTO songs (id, url, title, artist, album, duration, artwork, lastModified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        song.id,
        song.url,
        song.title,
        song.artist,
        song.album || null,
        song.duration,
        song.artwork || null,
        song.lastModified || 0,
      ]
    );
  } catch (error) {
    console.error('Failed to insert/update song in DB:', error);
  }
};

export const deleteSongsNotInList = (validIds: string[]) => {
  try {
    if (validIds.length === 0) {
      db.runSync('DELETE FROM songs');
      return;
    }
    
    // Create placeholders
    const placeholders = validIds.map(() => '?').join(',');
    db.runSync(`DELETE FROM songs WHERE id NOT IN (${placeholders})`, validIds);
  } catch (error) {
    console.error('Failed to delete songs from DB:', error);
  }
};

export const clearDatabase = () => {
  try {
    db.runSync('DELETE FROM songs');
  } catch (error) {
    console.error('Failed to clear DB:', error);
  }
};
