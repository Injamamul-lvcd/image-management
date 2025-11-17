import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Image Management API',
    version: '1.0.0',
    description: 'RESTful API for user authentication and image management with file upload capabilities',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Development server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'User ID',
            example: 1,
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp',
          },
        },
      },
      Image: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Image ID',
            example: 1,
          },
          filename: {
            type: 'string',
            description: 'Stored filename',
            example: '1234567890-image.jpg',
          },
          originalName: {
            type: 'string',
            description: 'Original filename',
            example: 'vacation-photo.jpg',
          },
          mimetype: {
            type: 'string',
            description: 'MIME type',
            example: 'image/jpeg',
          },
          size: {
            type: 'integer',
            description: 'File size in bytes',
            example: 1024000,
          },
          url: {
            type: 'string',
            description: 'URL to access the image',
            example: '/uploads/1234567890-image.jpg',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Upload timestamp',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            minLength: 6,
            description: 'User password (minimum 6 characters)',
            example: 'password123',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            description: 'User password',
            example: 'password123',
          },
        },
      },
      RegisterResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'User registered successfully',
          },
          data: {
            type: 'object',
            properties: {
              userId: {
                type: 'integer',
                example: 1,
              },
            },
          },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Login successful',
          },
          data: {
            type: 'object',
            properties: {
              token: {
                type: 'string',
                description: 'JWT authentication token',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              user: {
                $ref: '#/components/schemas/User',
              },
            },
          },
        },
      },
      ImageResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Image uploaded successfully',
          },
          data: {
            $ref: '#/components/schemas/Image',
          },
        },
      },
      ImagesListResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Images retrieved successfully',
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Image',
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'email',
                },
                message: {
                  type: 'string',
                  example: 'Invalid email format',
                },
              },
            },
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
