import { User } from '../types/user';
import { UserModel } from '../models/user.model';

export class UserService {
    async getUserById(userId: bigint): Promise<User | null> {
        return await UserModel.getById(userId);
    }

    async createUser(userData: User): Promise<User> {
        return await UserModel.createUser(userData);
    }

    async deleteUser(userId: bigint): Promise<User> {
        return await UserModel.deleteById(userId);
    }

    async listUsers(): Promise<User[]> {
        return await UserModel.getAll();
    }
}