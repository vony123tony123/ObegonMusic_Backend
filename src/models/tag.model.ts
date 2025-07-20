import { db } from '../db';
import { Tag } from '../types/tag';

export class TagModel {
  static async getById(id: string | number): Promise<Tag | null> {
    return db.oneOrNone<Tag>(
      'SELECT tag_id::text, tag_name FROM tags WHERE tag_id = $1',
      [id]
    );
  }

  static async getByName(name: string): Promise<Tag | null> {
    return db.oneOrNone<Tag>(
      'SELECT tag_id::text, tag_name FROM tags WHERE tag_name = $1',
      [name]
    );
  }

  static async getAll(): Promise<Tag[]> {
    return db.manyOrNone<Tag>('SELECT tag_id::text, tag_name FROM tags');
  }

  static async create(tag: Tag): Promise<Tag> {
    const result = await db.one<Tag>(
      'INSERT INTO tags (tag_id, tag_name) VALUES ($1, $2) RETURNING tag_id::text, tag_name',
      [tag.tag_id, tag.tag_name]
    );
    return result;
  }

  static async deleteById(id: string | number): Promise<Tag | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    await db.none('DELETE FROM tags WHERE tag_id = $1', [id]);
    return existing;
  }
}