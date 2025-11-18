export interface User {
  id: number;
  email: string;
  fullName: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDto {
  id: number;
  email: string;
  createdAt: Date;
}
