import { db } from '../db';
import { Announcement } from '../types/announcement';

export class AnnouncementModel {
  static async getAll(): Promise<Announcement[]> {
    return db.any('SELECT * FROM announcements ORDER BY create_time DESC');
  }

  static async getById(announcement_id: number): Promise<Announcement | null> {
    return db.oneOrNone('SELECT * FROM announcements WHERE announcement_id = $1', [announcement_id]);
  }

  static async create(announcement: Omit<Announcement, 'create_time' | 'update_time' | 'views'>): Promise<void> {
    const { announcement_id, title, content_url } = announcement;
    await db.none(
      `INSERT INTO announcements (announcement_id, title, content_url) VALUES ($1, $2, $3)`,
      [announcement_id, title, content_url]
    );
  }

  static async incrementViews(announcement_id: number): Promise<void> {
    await db.none(
      'UPDATE announcements SET views = views + 1 WHERE announcement_id = $1',
      [announcement_id]
    );
  }

  static async updateTitle(announcement_id: number, newTitle: string): Promise<void> {
    await db.none(
      'UPDATE announcements SET title = $1 WHERE announcement_id = $2',
      [newTitle, announcement_id]
    );
  }

  static async delete(announcement_id: number): Promise<void> {
    await db.none('DELETE FROM announcements WHERE announcement_id = $1', [announcement_id]);
  }
}
