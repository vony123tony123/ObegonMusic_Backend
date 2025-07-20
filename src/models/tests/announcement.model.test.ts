import { AnnouncementModel } from './announcement.model';
import { db } from '../db';

describe('AnnouncementModel', () => {

  afterAll(() => {
      db.$pool.end(); // 關閉 pg-promise 的連線池
  });
  it('should return a valid announcement when ID exists', async () => {
    const result = await AnnouncementModel.getById(1); // 假設 ID 1 存在
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('announcement_id', '1');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('content_url');
  });

  it('should return null when announcement ID does not exist', async () => {
    const result = await AnnouncementModel.getById(999999); // 假設這 ID 不存在
    expect(result).toBeNull();
  });
});
