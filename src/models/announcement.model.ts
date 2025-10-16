import { db } from '../db';
import { Announcement } from '../types/announcement';

export class AnnouncementModel {
  static async getAll(): Promise<Announcement[]> {
    return db.any('SELECT * FROM announcements ORDER BY create_time DESC');
  }

  static async getById(announcement_id: number): Promise<Announcement | null> {
    return db.oneOrNone('SELECT * FROM announcements WHERE announcement_id = $1', [announcement_id]);
  }

  static async create(announcement: Omit<Announcement, 'announcement_id' | 'create_time' | 'update_time' | 'views'>): Promise<Announcement> {
    const { title, content_url } = announcement;
    return db.one(
      `INSERT INTO announcements (title, content_url) VALUES ($1, $2) RETURNING *`,
      [title, content_url]
    );
  }

  static async incrementViews(announcement_id: number): Promise<Announcement | null> {
    return db.oneOrNone(
      'UPDATE announcements SET views = views + 1, update_time = CURRENT_TIMESTAMP WHERE announcement_id = $1 RETURNING *',
      [announcement_id]
    );
  }

  static async updateTitle(announcement_id: number, newTitle: string): Promise<Announcement | null> {
    return db.oneOrNone(
      'UPDATE announcements SET title = $1, update_time = CURRENT_TIMESTAMP WHERE announcement_id = $2 RETURNING *',
      [newTitle, announcement_id]
    );
  }

  static async delete(announcement_id: number): Promise<Announcement> {
    return db.one('DELETE FROM announcements WHERE announcement_id = $1 RETURNING *', [announcement_id]);
  }
}
