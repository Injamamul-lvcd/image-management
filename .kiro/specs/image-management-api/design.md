# Design Document

## Overview

The Image Management API is a RESTful service built with Node.js, Express.js, and TypeScript that provides user authentication and image management capabilities. The system uses MySQL for data persistence, JWT for authentication, and Swagger for API documentation. Images are stored on the file system with metadata tracked in the database.

## Architecture

### Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Sequelize with TypeScript support
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local file system with multer middleware
- **API Documentation**: Swagger (swagger-ui-express, swagger-jsdoc)
- **Password Hashing**: bcrypt
- **Validation**: express-validator

### System Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ HTTP/REST
       │
┌──────▼──────────────────────────────────┐
│         Express.js Application          │
│  ┌────────────────────────────────────┐ │
│  │     Middleware Layer               │ │
│  │  - Body Parser                     │ │
│  │  - CORS                            │ │
│  │  - Multer (File Upload)            │ │
│  │  - JWT Authentication              │ │
│  │  - Error Handler                   │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │     Route Layer                    │ │
│  │  - Auth Routes                     │ │
│  │  - Image Routes                    │ │
│  │  - Swagger Routes                  │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │     Controller Layer               │ │
│  │  - AuthController                  │ │
│  │  - ImageController                 │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │     Service Layer                  │ │
│  │  - AuthService                     │ │
│  │  - ImageService                    │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │     Repository Layer               │ │
│  │  - UserRepository                  │ │
│  │  - ImageRepository                 │ │
│  └────────────────────────────────────┘ │
└──────┬──────────────────────┬───────────┘
       │                      │
       │                      │
┌──────▼──────┐        ┌──────▼──────┐
│   MySQL     │        │ File System │
│  Database   │        │  (uploads/) │
└─────────────┘        └─────────────┘
```

## Components and Interfaces

### 1. Database Layer

**Sequelize Configuration**
- Sequelize instance with MySQL dialect
- Configuration from environment variables
- Connection pool settings
- Automatic model synchronization

**Sequelize Models**

**User Model**
```typescript
import { Model, DataTypes } from 'sequelize';

class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Model definition
User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'users',
  timestamps: true,
  underscored: true,
});
```

**Image Model**
```typescript
import { Model, DataTypes } from 'sequelize';

class Image extends Model {
  public id!: number;
  public userId!: number;
  public filename!: string;
  public originalName!: string;
  public mimetype!: string;
  public size!: number;
  public path!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Model definition
Image.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mimetype: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'images',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['userId'],
    },
  ],
});

// Associations
User.hasMany(Image, { foreignKey: 'userId', as: 'images' });
Image.belongsTo(User, { foreignKey: 'userId', as: 'user' });
```

### 2. Repository Layer

**UserRepository**
```typescript
interface IUserRepository {
  create(email: string, hashedPassword: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
}

// Implementation uses Sequelize model methods
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
```

**ImageRepository**
```typescript
interface IImageRepository {
  create(imageData: CreateImageDto): Promise<Image>;
  findById(id: number): Promise<Image | null>;
  findByUserId(userId: number): Promise<Image[]>;
  update(id: number, imageData: UpdateImageDto): Promise<Image>;
  delete(id: number): Promise<void>;
}

// Implementation uses Sequelize model methods
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
    if (!image) throw new NotFoundError('Image not found');
    return await image.update(imageData);
  }
  
  async delete(id: number): Promise<void> {
    await Image.destroy({ where: { id } });
  }
}
```

### 3. Service Layer

**AuthService**
```typescript
interface IAuthService {
  register(email: string, password: string): Promise<{ userId: number }>;
  login(email: string, password: string): Promise<{ token: string; user: UserDto }>;
  verifyToken(token: string): Promise<{ userId: number }>;
}
```

**ImageService**
```typescript
interface IImageService {
  uploadImage(userId: number, file: Express.Multer.File): Promise<ImageDto>;
  updateImage(userId: number, imageId: number, file: Express.Multer.File): Promise<ImageDto>;
  deleteImage(userId: number, imageId: number): Promise<void>;
  getUserImages(userId: number): Promise<ImageDto[]>;
}
```

### 4. Controller Layer

**AuthController**
- POST /api/auth/register - User registration
- POST /api/auth/login - User login

**ImageController**
- POST /api/images - Upload image (authenticated)
- PUT /api/images/:id - Update image (authenticated)
- DELETE /api/images/:id - Delete image (authenticated)
- GET /api/images - Get user's images (authenticated)

### 5. Middleware

**Authentication Middleware**
```typescript
interface AuthMiddleware {
  verifyToken(req: Request, res: Response, next: NextFunction): Promise<void>;
}
```
- Extracts JWT from Authorization header
- Verifies token validity
- Attaches user ID to request object
- Returns 401 for invalid/missing tokens

**File Upload Middleware**
- Multer configuration for image uploads
- File type validation (jpeg, jpg, png, gif)
- File size limits (e.g., 5MB)
- Unique filename generation

**Validation Middleware**
- Request body validation using express-validator
- Email format validation
- Password strength validation
- File presence validation

## Data Models

### User Model
```typescript
interface User {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserDto {
  id: number;
  email: string;
  createdAt: Date;
}
```

### Image Model
```typescript
interface Image {
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

interface ImageDto {
  id: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  createdAt: Date;
}
```

### DTOs (Data Transfer Objects)
```typescript
interface RegisterDto {
  email: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface CreateImageDto {
  userId: number;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
}

interface UpdateImageDto {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
}
```

## Error Handling

### Error Types
```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message);
    this.statusCode = 401;
  }
}

class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message);
    this.statusCode = 403;
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(message);
    this.statusCode = 404;
  }
}
```

### Global Error Handler
- Catches all errors from routes and middleware
- Formats error responses consistently
- Logs errors for debugging
- Returns appropriate HTTP status codes
- Hides sensitive information in production

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
```

## Testing Strategy

### Unit Tests
- Service layer business logic
- Repository layer database operations
- Utility functions (password hashing, token generation)
- Validation logic

### Integration Tests
- API endpoint testing
- Authentication flow
- Image upload/update/delete operations
- Database interactions
- File system operations

### Test Tools
- Jest as test framework
- Supertest for API testing
- Mock database connections for unit tests
- Test database for integration tests

## Security Considerations

1. **Password Security**
   - Bcrypt hashing with salt rounds (10+)
   - No plain text password storage

2. **JWT Security**
   - Secure secret key from environment
   - Token expiration (e.g., 24 hours)
   - HTTPS in production

3. **File Upload Security**
   - File type validation
   - File size limits
   - Unique filename generation to prevent overwrites
   - Path traversal prevention

4. **Input Validation**
   - Email format validation
   - SQL injection prevention via parameterized queries
   - XSS prevention via input sanitization

5. **Authorization**
   - Users can only access their own images
   - Token verification on protected routes

## Configuration

### Environment Variables
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=image_management
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

## API Documentation (Swagger)

### Swagger Configuration
- Swagger UI served at /api-docs
- OpenAPI 3.0 specification
- Auto-generated from JSDoc comments
- Interactive testing interface
- Authentication support in UI

### Documentation Structure
- API information and version
- Server URLs
- Authentication schemes (Bearer JWT)
- Endpoint definitions with:
  - Request parameters
  - Request body schemas
  - Response schemas
  - Error responses
  - Example requests/responses
