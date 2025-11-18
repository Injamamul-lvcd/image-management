import { Request, Response, NextFunction } from 'express';
import userService from '../services/UserService';
// import { AppError } from '../models/errors/AppError';


class UserController {
  /**
   * Register a new user
   * POST /api/auth/register
   * @param req - Express request with email and password in body
   * @param res - Express response
   * @param next - Express next function for error handling
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName } = req.body;

      // Validate required fields
      if (!email || !password || !fullName) {
        res.status(400).json({
          success: false,
          message: 'Email, password, and fullName are required',
        });
        return;
      }

      // Call service to register user
      const result = await userService.register(email, password, fullName);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   * @param req - Express request with email and password in body
   * @param res - Express response
   * @param next - Express next function for error handling
   */
  async login(req: Request, res: Response, _next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
        return;
      }

      // Call service to authenticate user
      const result = await userService.login(email, password);
      console.log("result --->",result);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      res.status(500).send({success: false, message:"Internal server error", data: {}})
    }
  }
}

export default new UserController();
