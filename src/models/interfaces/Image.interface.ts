export interface Image {
  id: number;
  userId: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImageDto {
  id: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: Date;
}
