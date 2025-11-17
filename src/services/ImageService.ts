import imageRepository from '../repositories/ImageRepository';
import { AuthorizationError, NotFoundError, ValidationError } from '../models/errors/AppError';
import { ImageDto } from '../models/interfaces/Image.interface';
import { CreateImageDto, UpdateImageDto } from '../models/dto/Image.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface IImageService {
  uploadImage(userId: number, file: Express.Multer.File): Promise<ImageDto>;
  updateImage(userId: number, imageId: number, file: Express.Multer.File): Promise<ImageDto>;
  deleteImage(userId: number, imageId: number): Promise<void>;
  getUserImages(userId: number): Promise<ImageDto[]>;
}

class ImageService implements IImageService {
  /**
   * Upload a new image for a user
   * @param userId - ID of the user uploading the image
   * @param file - Multer file object containing image data
   * @returns ImageDto with image metadata and URL
   * @throws ValidationError if file is invalid
   */
  async uploadImage(userId: number, file: Express.Multer.File): Promise<ImageDto> {
    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Validate file is an image
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ValidationError('Invalid file type. Only JPEG, PNG, and GIF images are allowed');
    }

    // Create image record in database
    const createImageDto: CreateImageDto = {
      userId,
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    };

    const image = await imageRepository.create(createImageDto);

    // Return image DTO with URL
    return this.toImageDto(image);
  }

  /**
   * Update an existing image
   * @param userId - ID of the user requesting the update
   * @param imageId - ID of the image to update
   * @param file - Multer file object containing new image data
   * @returns ImageDto with updated image metadata and URL
   * @throws NotFoundError if image doesn't exist
   * @throws AuthorizationError if user doesn't own the image
   * @throws ValidationError if file is invalid
   */
  async updateImage(userId: number, imageId: number, file: Express.Multer.File): Promise<ImageDto> {
    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Validate file is an image
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new ValidationError('Invalid file type. Only JPEG, PNG, and GIF images are allowed');
    }

    // Find existing image
    const existingImage = await imageRepository.findById(imageId);
    if (!existingImage) {
      throw new NotFoundError('Image not found');
    }

    // Check authorization
    if (existingImage.userId !== userId) {
      throw new AuthorizationError('You are not authorized to update this image');
    }

    // Delete old file
    try {
      await fs.unlink(existingImage.path);
    } catch (error) {
      // Log error but continue - file might already be deleted
      console.error('Error deleting old file:', error);
    }

    // Update image record
    const updateImageDto: UpdateImageDto = {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
    };

    const updatedImage = await imageRepository.update(imageId, updateImageDto);

    // Return image DTO with URL
    return this.toImageDto(updatedImage);
  }

  /**
   * Delete an image
   * @param userId - ID of the user requesting the deletion
   * @param imageId - ID of the image to delete
   * @throws NotFoundError if image doesn't exist
   * @throws AuthorizationError if user doesn't own the image
   */
  async deleteImage(userId: number, imageId: number): Promise<void> {
    // Find existing image
    const existingImage = await imageRepository.findById(imageId);
    if (!existingImage) {
      throw new NotFoundError('Image not found');
    }

    // Check authorization
    if (existingImage.userId !== userId) {
      throw new AuthorizationError('You are not authorized to delete this image');
    }

    // Delete file from filesystem
    try {
      await fs.unlink(existingImage.path);
    } catch (error) {
      // Log error but continue - file might already be deleted
      console.error('Error deleting file:', error);
    }

    // Delete database record
    await imageRepository.delete(imageId);
  }

  /**
   * Get all images for a user
   * @param userId - ID of the user
   * @returns Array of ImageDto objects
   */
  async getUserImages(userId: number): Promise<ImageDto[]> {
    const images = await imageRepository.findByUserId(userId);
    return images.map(image => this.toImageDto(image));
  }

  /**
   * Convert Image model to ImageDto
   * @param image - Image model instance
   * @returns ImageDto with URL
   */
  private toImageDto(image: any): ImageDto {
    return {
      id: image.id,
      filename: image.filename,
      originalName: image.originalName,
      mimetype: image.mimetype,
      size: image.size,
      url: `/uploads/${image.filename}`,
      createdAt: image.createdAt,
    };
  }
}

export default new ImageService();
