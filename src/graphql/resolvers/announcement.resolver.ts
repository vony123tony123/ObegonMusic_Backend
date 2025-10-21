import { AnnouncementController } from '../../services/Annoucement.service';

export const announcementResolvers = {
  getAll: () => AnnouncementController.getAll(),
  getById: ({ announcement_id }: { announcement_id: number }) => AnnouncementController.getById(announcement_id),
  create: ({ input }: any) => AnnouncementController.create(input),
  updateTitle: ({ announcement_id, newTitle }: any) => AnnouncementController.updateTitle(announcement_id, newTitle),
  delete: ({ announcement_id }: { announcement_id: number }) => AnnouncementController.delete(announcement_id),
  incrementViews: ({ announcement_id }: { announcement_id: number }) => AnnouncementController.incrementViews(announcement_id),
};