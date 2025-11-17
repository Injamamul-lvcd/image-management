# Image Management API

A RESTful API for user authentication and image management built with Node.js, Express, TypeScript, and MySQL.

## Features

- User registration and authentication with JWT
- Image upload, update, and deletion
- Secure file storage
- Interactive API documentation with Swagger

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

4. Create the MySQL database specified in your `.env` file

## Running the Application

### Development mode
```bash
npm run dev
```

### Production mode
```bash
npm run build
npm start
```

## API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Custom middleware
├── models/         # Database models
├── repositories/   # Data access layer
├── services/       # Business logic
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## Testing

```bash
npm test
```
