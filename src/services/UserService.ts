import userRepository from '../repositories/UserRepository';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { ValidationError, AuthenticationError } from '../models/errors/AppError';
import { UserDto } from '../models/interfaces/User.interface';

export interface IAuthService {
  register(email: string, password: string, fullName: string): Promise<{ userId: number }>;
  login(email: string, password: string): Promise<{ token: string; user: UserDto }>;
}

class AuthService implements IAuthService {
  /**
   * Register a new user with email and password
   * @param email - User email address
   * @param password - User password
   * @returns Object containing the new user ID
   * @throws ValidationError if email is invalid or already exists
   */
  async register(email: string, password: string, fullName: string): Promise<{ userId: number }> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Check for duplicate email
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await userRepository.create(email, hashedPassword, fullName);

    return { userId: user.id };
  }

  /**
   * Login user with email and password
   * @param email - User email address
   * @param password - User password
   * @returns Object containing JWT token and user data
   * @throws AuthenticationError if credentials are invalid
   */
  async login(email: string, password: string): Promise<{ token: string; user: UserDto }> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate token
    const token = generateToken(user.id);

    // Return token and user data (without password)
    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };

    return { token, user: userDto };
  }
}

export default new AuthService();
