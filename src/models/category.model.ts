import { db } from '../db';
import { Category } from '../types/category';

export class CategoryModel {
  static async getById(id: string): Promise<Category | null> {
    return db.oneOrNone('SELECT * FROM categories WHERE category_id = $1', [id]);
  }

  static async getByName(name: string): Promise<Category | null> {
    return db.oneOrNone('SELECT * FROM categories WHERE name = $1', [name]);
  }

  static async create(category: Omit<Category, 'create_time' | 'update_time'>): Promise<void> {
    await db.none(
      `INSERT INTO categories (category_id, name)
       VALUES ($1, $2)`,
      [category.category_id, category.name]
    );
  }

  static async getAll(): Promise<Category[]> {
    return db.any('SELECT * FROM categories');
  }

  static async deleteById(id: string): Promise<Category | null> {
    const category = await this.getById(id);
    if (!category) return null;

    await db.none('DELETE FROM categories WHERE category_id = $1', [id]);
    return category;
  }
}
