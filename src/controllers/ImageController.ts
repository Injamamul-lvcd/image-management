import { Request, Response, NextFunction } from 'express';
import imageService from '../services/ImageService';

/**
 * Controller for image management endpoints
 */
class ImageController {
  /**
   * Upload a new image
   * POST /api/images
   * @param req - Express request with file and authenticated userId
   * @param res - Express response
   * @param next - Express next function for error handling
   */
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // userId is attached by authentication middleware
      const userId = req.userId!;
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No file provided',
        });
        return;
      }

      // Call service to upload image
      const result = await imageService.uploadImage(userId, file);

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing image
   * PUT /api/images/:id
   * @param req - Express request with file, image ID in params, and authenticated userId
   * @param res - Express response
   * @param next - Express next function for error handling
   */
  async updateImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // userId is attached by authentication middleware
      const userId = req.userId!;
      const imageId = parseInt(req.params.id, 10);
      const file = req.file;

      if (isNaN(imageId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid image ID',
        });
        return;
      }

      if (!file) {
        res.status(400).json({
          success: false,
          message: 'No file provided',
        });
        return;
      }

      // Call service to update image
      const result = await imageService.updateImage(userId, imageId, file);

      res.status(200).json({
        success: true,
        message: 'Image updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an image
   * DELETE /api/images/:id
   * @param req - Express request with image ID in params and authenticated userId
   * @param res - Express response
   * @param next - Express next function for error handling
   */
  async deleteImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // userId is attached by authentication middleware
      const userId = req.userId!;
      const imageId = parseInt(req.params.id, 10);

      if (isNaN(imageId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid image ID',
        });
        return;
      }

      // Call service to delete image
      await imageService.deleteImage(userId, imageId);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all images for the authenticated user
   * GET /api/images
   * @param req - Express request with authenticated userId
   * @param res - Express response
   * @param next - Express next function for error handling
   */
  async getUserImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // userId is attached by authentication middleware
      const userId = req.userId!;

      // Call service to get user's images
      const result = await imageService.getUserImages(userId);

      res.status(200).json({
        success: true,
        message: 'Images retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ImageController();
