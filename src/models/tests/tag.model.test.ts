import { db } from "../db";
import { TagModel } from "./tag.model";
import { Tag } from "../types/tag";

describe('TagModel', () => {
  const testTag: Tag = {
    tag_id: '9001',
    tag_name: 'unit-test-tag',
  };

  afterEach(async () => {
    await db.none('DELETE FROM tags WHERE tag_id = $1', [testTag.tag_id]);
  });
  
  afterAll(() => {
      db.$pool.end(); // ✅ 關閉 pg-promise 的連線池
  });

  test('should create a tag successfully', async () => {
    await TagModel.create(testTag);
    const result = await db.oneOrNone('SELECT * FROM tags WHERE tag_id = $1', [testTag.tag_id]);
    expect(result).not.toBeNull();
    expect(result.tag_name).toBe(testTag.tag_name);
  });

  test('should get a tag by ID', async () => {
    await db.none('INSERT INTO tags (tag_id, tag_name) VALUES ($1, $2)', [
      testTag.tag_id,
      testTag.tag_name,
    ]);
    const result = await TagModel.getById(testTag.tag_id);
    expect(result).not.toBeNull();
    expect(result?.tag_name).toBe(testTag.tag_name);
  });

  test('should return null if tag ID does not exist', async () => {
    const result = await TagModel.getById('999999');
    expect(result).toBeNull();
  });

  test('should get all tags including the test tag', async () => {
    await db.none('INSERT INTO tags (tag_id, tag_name) VALUES ($1, $2)', [
      testTag.tag_id,
      testTag.tag_name,
    ]);
    const result = await TagModel.getAll();
    const found = result.find((tag) => tag.tag_id === testTag.tag_id);
    expect(found).toBeDefined();
    expect(found?.tag_name).toBe(testTag.tag_name);
  });

  test('should delete a tag and return the deleted tag', async () => {
    await db.none('INSERT INTO tags (tag_id, tag_name) VALUES ($1, $2)', [
      testTag.tag_id,
      testTag.tag_name,
    ]);
    const deleted = await TagModel.deleteById(testTag.tag_id);
    expect(deleted).not.toBeNull();
    expect(deleted?.tag_id).toBe(testTag.tag_id);

    const result = await db.oneOrNone('SELECT * FROM tags WHERE tag_id = $1', [testTag.tag_id]);
    expect(result).toBeNull();
  });

  test('should return null when deleting a non-existent tag', async () => {
    const result = await TagModel.deleteById('999999');
    expect(result).toBeNull();
  });
});
