# Image Management API Documentation

## Overview

This is a RESTful API for user authentication and image management built with Node.js, Express, and TypeScript. The API allows users to register, login, and manage their images with secure file upload capabilities.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **API Documentation**: Swagger/OpenAPI
- **Validation**: express-validator
- **Development**: ts-node-dev, Jest for testing

## Project Structure

```
src/
├── config/           # Database and Swagger configuration
├── controllers/      # HTTP request handlers
├── middleware/       # Express middleware functions
├── models/           # Database models and interfaces
│   ├── dto/         # Data Transfer Objects
│   ├── interfaces/  # TypeScript interfaces
│   └── errors/      # Custom error classes
├── repositories/     # Data access layer
├── routes/          # API route definitions
├── services/        # Business logic layer
└── utils/           # Utility functions
```

## TypeScript Concepts Used

### 1. Interfaces

Interfaces define the shape of objects and are used throughout the application:

```typescript
// User interface defining the complete user object
export interface User {
  id: number;
  email: string;
  fullName: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for safe user data transfer (without password)
export interface UserDto {
  id: number;
  email: string;
  createdAt: Date;
}
```

### 2. Classes and Inheritance

The application uses ES6 classes with inheritance:

```typescript
// Sequelize model extending base Model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  // ... other properties
}

// Custom error classes extending base AppError
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}
```

### 3. Generics

Sequelize models use generics for type safety:

```typescript
interface UserAttributes {
  id: number;
  email: string;
  // ...
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> {
  // ...
}
```

### 4. Type Declarations

The application extends Express types for custom properties:

```typescript
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
```

### 5. Enums and Union Types

While not extensively used, the codebase demonstrates TypeScript's type system with interfaces and optional properties.

### 6. Async/Await with Promises

All asynchronous operations use async/await for better readability:

```typescript
async login(email: string, password: string): Promise<{ token: string; user: UserDto }> {
  const user = await userRepository.findByEmail(email);
  // ... validation logic
  return { token, user: userDto };
}
```

## Overall Project Flow

### 1. Application Startup

1. **Environment Setup**: Load environment variables using dotenv
2. **Express App**: Initialize Express application with middleware
3. **Database Connection**: Connect to MySQL database and sync models
4. **Route Mounting**: Mount API routes under `/api/v1/`
5. **Server Start**: Start HTTP server with graceful shutdown handling

### 2. Request Flow

```
Client Request → Middleware → Controller → Service → Repository → Database
                      ↓
                Response ← Controller ← Service ← Repository ← Database
```

### 3. Authentication Flow

1. **Registration**: User provides email/password → Validate → Hash password → Store in DB → Return user ID
2. **Login**: User provides credentials → Verify → Generate JWT → Return token + user data
3. **Protected Routes**: JWT in Authorization header → Verify token → Attach userId to request

### 4. Image Management Flow

1. **Upload**: Authenticated user → Validate file → Store file → Create DB record → Return image data
2. **Update**: Check ownership → Delete old file → Upload new file → Update DB record
3. **Delete**: Check ownership → Delete file from disk → Remove DB record
4. **List**: Get user's images from DB → Return formatted data

## API Endpoints

### Authentication Endpoints

#### POST /api/v1/users/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": 1
  }
}
```

#### POST /api/v1/users/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "createdAt": "2023-..."
    }
  }
}
```

### Image Management Endpoints

All image endpoints require authentication (Bearer token in Authorization header).

#### POST /api/v1/images
Upload a new image.

**Content-Type:** multipart/form-data
**Body:** image file

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": 1,
    "filename": "image-123456789.jpg",
    "originalName": "vacation.jpg",
    "mimetype": "image/jpeg",
    "size": 1024000,
    "url": "/uploads/image-123456789.jpg",
    "createdAt": "2023-..."
  }
}
```

#### GET /api/v1/images
Get all images for the authenticated user.

**Response:**
```json
{
  "success": true,
  "message": "Images retrieved successfully",
  "data": [
    {
      "id": 1,
      "filename": "image-123.jpg",
      "originalName": "photo.jpg",
      "mimetype": "image/jpeg",
      "size": 2048000,
      "url": "/uploads/image-123.jpg",
      "createdAt": "2023-..."
    }
  ]
}
```

#### PUT /api/v1/images/:id
Update an existing image.

**Parameters:** id (image ID)
**Content-Type:** multipart/form-data
**Body:** new image file

#### DELETE /api/v1/images/:id
Delete an image.

**Parameters:** id (image ID)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Images Table
```sql
CREATE TABLE images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mimetype VARCHAR(100) NOT NULL,
  size INT NOT NULL,
  path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=image_management

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your database credentials and other settings

4. **Set up MySQL database**
   - Create a database named `image_management`
   - Update `.env` with your MySQL credentials

5. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production build
   npm run build
   npm start
   ```

6. **Access the API**
   - API Base URL: `http://localhost:3000`
   - API Documentation: `http://localhost:3000/api-docs`
   - Health Check: `http://localhost:3000/health`

## Testing

Run tests with Jest:
```bash
npm test
```

## Key TypeScript Features Demonstrated

1. **Strong Typing**: All variables, function parameters, and return types are explicitly typed
2. **Interface Segregation**: Separate interfaces for different concerns (User, UserDto, etc.)
3. **Class-based Architecture**: Clean separation of concerns with controllers, services, repositories
4. **Error Handling**: Custom error classes with proper inheritance
5. **Middleware Typing**: Extended Express Request interface for custom properties
6. **Generic Constraints**: Sequelize models with proper generic constraints
7. **Async/Await Patterns**: Consistent asynchronous programming patterns
8. **Module System**: Proper ES6 module imports/exports

## Best Practices Implemented

- **Separation of Concerns**: Clear layers (controllers, services, repositories)
- **Error Handling**: Centralized error handling with custom error types
- **Validation**: Input validation at multiple layers
- **Security**: Password hashing, JWT authentication, file type validation
- **Documentation**: Swagger/OpenAPI documentation
- **Environment Configuration**: Environment-based configuration
- **Graceful Shutdown**: Proper cleanup on application termination
- **File Management**: Secure file upload with cleanup on updates/deletes

This documentation provides a comprehensive overview of the Image Management API, focusing on both the overall architecture and TypeScript-specific implementations to help new TypeScript developers understand the codebase.