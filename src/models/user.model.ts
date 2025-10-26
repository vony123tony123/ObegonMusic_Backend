import { db } from '../db';
import { User } from '../types/user';

export class UserModel {
  static async getById(id: bigint | string): Promise<User | null> {
    return db.oneOrNone<User>(
      'SELECT user_id::text, name FROM users WHERE user_id = $1',
      [id]
    );
  }

  static async getByName(name: string): Promise<User | null> {
    return db.oneOrNone<User>(
      'SELECT user_id::text, name FROM users WHERE name = $1',
      [name]
    );
  }

  static async getAll(): Promise<User[]> {
    return db.manyOrNone<User>('SELECT user_id::text, name FROM users');
  }

  static async createUser(user: User): Promise<User> {
    const result = await db.one<User>(
      'INSERT INTO users (user_id, name) VALUES ($1, $2) RETURNING user_id::text, name',
      [user.user_id, user.name]
    );
    return result;
  }

  static async deleteById(id: bigint | string): Promise<User | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    await db.none('DELETE FROM users WHERE user_id = $1', [id]);
    return existing;
  }

  static async updateUser(id: bigint | string, user: Partial<User>): Promise<User | null> {
    const existing = await this.getById(id);
    if (!existing) return null; 
    const updatedUser = { ...existing, ...user };

    const result = await db.one<User>(
      'UPDATE users SET name = $1 WHERE user_id = $2 RETURNING user_id::text, name',
      [updatedUser.name, id]
    );
    return result;
  }
}
