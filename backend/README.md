# Backend Documentation

## Overview
This is the backend part of the fullstack application built with Node.js, TypeScript, and SQLite. The backend serves as the API for the frontend Angular application.

## Project Structure
- **src/**: Contains the source code for the backend.
  - **controllers/**: Handles incoming requests and responses.
  - **models/**: Defines data models for interacting with the SQLite database.
  - **routes/**: Sets up API routes and links them to controllers.
  - **services/**: Contains business logic and data access methods.
  - **app.ts**: Entry point for the Node.js backend, setting up the Express app.

## Getting Started
1. Clone the repository.
2. Navigate to the backend directory.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```

## Database
The backend uses SQLite for data storage. The database file is located in the `database/` directory.

## API Endpoints
Refer to the routes defined in the `src/routes/index.ts` file for available API endpoints.

## License
This project is licensed under the MIT License.