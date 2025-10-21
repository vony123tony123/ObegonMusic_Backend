import { Announcement } from '../types/announcement';
import { AnnouncementModel } from '../models/announcement.model';

export class AnnouncementController {
  static async getAll(): Promise<Announcement[]> {
    return await AnnouncementModel.getAll();
  }

  static async getById(announcement_id: number): Promise<Announcement | null> {
    return await AnnouncementModel.getById(announcement_id);
  }

  static async create(input: Omit<Announcement, 'announcement_id' | 'create_time' | 'update_time' | 'views'>): Promise<Announcement> {
    return await AnnouncementModel.create(input);
  }

  static async incrementViews(announcement_id: number): Promise<Announcement | null> {
    return await AnnouncementModel.incrementViews(announcement_id);
  }

  static async updateTitle(announcement_id: number, newTitle: string): Promise<Announcement | null> {
    return await AnnouncementModel.updateTitle(announcement_id, newTitle);
  }

  static async delete(announcement_id: number): Promise<Announcement> {
    return AnnouncementModel.delete(announcement_id);
  }
}
