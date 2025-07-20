import { db } from '../db';
import { User } from '../types/user';
import { UserModel } from './user.model';

describe('UserModel Comprehensive Unit Tests', () => {
  const insertUser = async (user: User) => {
    await db.none('INSERT INTO users (user_id, name) VALUES ($1, $2)', [user.user_id, user.name]);
  };

  const deleteUser = async (id: string) => {
    await db.none('DELETE FROM users WHERE user_id = $1', [id]);
  };

  afterAll(async () => {
    await db.$pool.end();
  });

  it('getById should return the correct user', async () => {
    const user: User = { user_id: '3001', name: 'UnitTest-User-ById' };
    await insertUser(user);

    const result = await UserModel.getById(user.user_id);
    expect(result).not.toBeNull();
    expect(result?.user_id).toBe(user.user_id);
    expect(result?.name).toBe(user.name);

    await deleteUser(user.user_id);
  });

  it('getById should return null if user not found', async () => {
    const result = await UserModel.getById('999999999');
    expect(result).toBeNull();
  });

  it('getByName should return the correct user', async () => {
    const user: User = { user_id: '3002', name: 'UnitTest-User-ByName' };
    await insertUser(user);

    const result = await UserModel.getByName(user.name);
    expect(result).not.toBeNull();
    expect(result?.user_id).toBe(user.user_id);

    await deleteUser(user.user_id);
  });

  it('getByName should return null if name not found', async () => {
    const result = await UserModel.getByName('NameNotFound');
    expect(result).toBeNull();
  });

  it('getAll should include inserted user', async () => {
    const user: User = { user_id: '3003', name: 'UnitTest-User-GetAll' };
    await insertUser(user);

    const all = await UserModel.getAll();
    expect(Array.isArray(all)).toBe(true);
    const found = all.find((u) => u.user_id === user.user_id);
    expect(found).toBeDefined();

    await deleteUser(user.user_id);
  });

  it('create should insert and allow retrieval', async () => {
    const user: User = { user_id: '3004', name: 'UnitTest-User-Create' };
    await UserModel.create(user);

    const result = await UserModel.getById(user.user_id);
    expect(result).not.toBeNull();
    expect(result?.name).toBe(user.name);

    await deleteUser(user.user_id);
  });

  it('deleteById should delete and return the deleted user', async () => {
    const user: User = { user_id: '3005', name: 'UnitTest-User-Delete' };
    await insertUser(user);

    const deleted = await UserModel.deleteById(user.user_id);
    expect(deleted).not.toBeNull();
    expect(deleted?.name).toBe(user.name);

    const after = await UserModel.getById(user.user_id);
    expect(after).toBeNull();
  });

  it('deleteById should return null if user does not exist', async () => {
    const result = await UserModel.deleteById('88888888');
    expect(result).toBeNull();
  });
});
