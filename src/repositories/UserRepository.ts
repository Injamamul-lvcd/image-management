import User from '../models/User';

export interface IUserRepository {
  create(email: string, hashedPassword: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
}

class UserRepository implements IUserRepository {
  async create(email: string, hashedPassword: string): Promise<User> {
    return await User.create({ email, password: hashedPassword });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return await User.findByPk(id);
  }
}

export default new UserRepository();
