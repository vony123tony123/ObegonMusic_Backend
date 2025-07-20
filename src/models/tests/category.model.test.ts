import { db } from '../db';
import { Category } from '../types/category';
import { CategoryModel } from './category.model';

describe('CategoryModel - Final Comprehensive Unit Tests', () => {
  // Helper: Insert category directly
  const insertCategory = async (data: { category_id: string; name: string }) => {
    await db.none(`INSERT INTO categories (category_id, name) VALUES ($1, $2)`, [
      data.category_id,
      data.name,
    ]);
  };

  // Helper: Delete category directly
  const deleteCategory = async (id: string) => {
    await db.none(`DELETE FROM categories WHERE category_id = $1`, [id]);
  };

  afterAll(async () => {
    await db.$pool.end();
  });

  it('getById should return the correct category', async () => {
    const data = { category_id: '2001', name: 'UnitTest-GetById' };
    await insertCategory(data);

    const result = await CategoryModel.getById(data.category_id);
    expect(result).not.toBeNull();
    expect(result?.category_id).toBe(data.category_id);
    expect(result?.name).toBe(data.name);

    await deleteCategory(data.category_id);
  });

  it('getById should return null if category does not exist', async () => {
    const result = await CategoryModel.getById('999999999');
    expect(result).toBeNull();
  });

  it('getByName should return the correct category', async () => {
    const data = { category_id: '2002', name: 'UnitTest-GetByName' };
    await insertCategory(data);

    const result = await CategoryModel.getByName(data.name);
    expect(result).not.toBeNull();
    expect(result?.category_id).toBe(data.category_id);

    await deleteCategory(data.category_id);
  });

  it('getByName should return null for nonexistent name', async () => {
    const result = await CategoryModel.getByName('NameNotExist123');
    expect(result).toBeNull();
  });

  it('getAll should include the inserted category', async () => {
    const data = { category_id: '2003', name: 'UnitTest-GetAll' };
    await insertCategory(data);

    const all = await CategoryModel.getAll();
    expect(Array.isArray(all)).toBe(true);
    const found = all.find((c) => c.category_id === data.category_id);
    expect(found).toBeDefined();

    await deleteCategory(data.category_id);
  });

  it('create should insert and retrieve category', async () => {
    const data: Category = {
      category_id: '2004',
      name: 'UnitTest-Create'
    };

    await CategoryModel.create(data);
    const created = await CategoryModel.getById(data.category_id);
    expect(created).not.toBeNull();
    expect(created?.name).toBe(data.name);

    await deleteCategory(data.category_id);
  });

  it('create should throw if name already exists (unique constraint)', async () => {
    const data = { category_id: '2005', name: 'UnitTest-Duplicate' };
    await insertCategory(data);

    const duplicate: Category = {
      category_id: '2006',
      name: data.name // duplicate name
    };

    await expect(CategoryModel.create(duplicate)).rejects.toThrow();

    await deleteCategory(data.category_id);
  });

  it('deleteById should return deleted category', async () => {
    const data = { category_id: '2007', name: 'UnitTest-Delete' };
    await insertCategory(data);

    const deleted = await CategoryModel.deleteById(data.category_id);
    expect(deleted).not.toBeNull();
    expect(deleted?.name).toBe(data.name);

    const after = await CategoryModel.getById(data.category_id);
    expect(after).toBeNull();
  });

  it('deleteById should return null when category not found', async () => {
    const result = await CategoryModel.deleteById('88888888');
    expect(result).toBeNull();
  });
});