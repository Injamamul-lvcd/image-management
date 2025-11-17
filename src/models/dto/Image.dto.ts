export interface CreateImageDto {
  userId: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
}

export interface UpdateImageDto {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
}
