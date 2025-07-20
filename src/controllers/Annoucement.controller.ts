import { Announcement } from '../types/announcement';
import { AnnouncementModel } from '../models/announcement.model';

export class AnnouncementController {
  static async getAll(): Promise<Announcement[]> {
    return await AnnouncementModel.getAll();
  }

  static async getById(announcement_id: number): Promise<Announcement | null> {
    return await AnnouncementModel.getById(announcement_id);
  }

  static async create(input: Omit<Announcement, 'create_time' | 'update_time' | 'views'>): Promise<void> {
    await AnnouncementModel.create(input);
  }

  static async incrementViews(announcement_id: number): Promise<void> {
    await AnnouncementModel.incrementViews(announcement_id);
  }

  static async updateTitle(announcement_id: number, newTitle: string): Promise<void> {
    await AnnouncementModel.updateTitle(announcement_id, newTitle);
  }

  static async delete(announcement_id: number): Promise<void> {
    await AnnouncementModel.delete(announcement_id);
  }
}
