import pgPromise from 'pg-promise';
import { dbConfig } from './config/database';

const initOptions = {
  // 當連線從池中被借用時觸發
  connect: (e: any) => { // e 是事件上下文物件
    // 執行 RESET ALL 將所有會話設定重置為預設值
    // 這可以避免連線池中連線的「髒」狀態影響後續操作
    e.client.query('RESET ALL')
      .then(() => {
        // 可以在這裡選擇性地設定 search_path，如果需要
        // e.client.query('SET search_path = public');
      })
      .catch((error: any) => {
        console.error('Error resetting client state:', error);
      });
  },
  // 可以在這裡添加其他選項，例如錯誤處理等
};

export const pgp = pgPromise(initOptions);
export const db = pgp(dbConfig);