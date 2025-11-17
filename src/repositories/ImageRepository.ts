import Image from '../models/Image';
import { CreateImageDto, UpdateImageDto } from '../models/dto/Image.dto';

export interface IImageRepository {
  create(imageData: CreateImageDto): Promise<Image>;
  findById(id: number): Promise<Image | null>;
  findByUserId(userId: number): Promise<Image[]>;
  update(id: number, imageData: UpdateImageDto): Promise<Image>;
  delete(id: number): Promise<void>;
}

class ImageRepository implements IImageRepository {
  async create(imageData: CreateImageDto): Promise<Image> {
    return await Image.create(imageData);
  }

  async findById(id: number): Promise<Image | null> {
    return await Image.findByPk(id);
  }

  async findByUserId(userId: number): Promise<Image[]> {
    return await Image.findAll({ where: { userId } });
  }

  async update(id: number, imageData: UpdateImageDto): Promise<Image> {
    const image = await Image.findByPk(id);
    if (!image) {
      throw new Error('Image not found');
    }
    return await image.update(imageData);
  }

  async delete(id: number): Promise<void> {
    await Image.destroy({ where: { id } });
  }
}

export default new ImageRepository();
