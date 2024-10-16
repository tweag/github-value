# My Fullstack App

Welcome to My Fullstack App! 🎉 This project is a full-stack application built with Angular for the frontend and Node.js for the backend, all written in TypeScript. It uses SQLite as the database and is containerized using Docker Compose. 🐳

## Project Structure

```
my-fullstack-app
├── frontend          # Angular frontend
│   ├── src          # Source files
│   ├── angular.json  # Angular CLI configuration
│   ├── package.json  # Frontend dependencies
│   ├── tsconfig.json # TypeScript configuration
│   └── README.md     # Frontend documentation
├── backend           # Node.js backend
│   ├── src          # Source files
│   ├── package.json  # Backend dependencies
│   ├── tsconfig.json # TypeScript configuration
│   └── README.md     # Backend documentation
├── database          # SQLite database
│   └── sqlite.db    # Database file
├── docker-compose.yml # Docker Compose configuration
└── README.md         # Overall project documentation
```

## Getting Started

### Prerequisites

- Node.js and npm
- Docker and Docker Compose

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd my-fullstack-app
   ```

2. Install dependencies for the frontend:
   ```
   cd frontend
   npm install
   ```

3. Install dependencies for the backend:
   ```
   cd ../backend
   npm install
   ```

### Running the Application

To run the application using Docker Compose, execute the following command in the root directory:

```
docker-compose up
```

This will start both the frontend and backend services along with the SQLite database.

### Contributing

Feel free to submit issues or pull requests! Contributions are welcome! 🤗

### License

This project is licensed under the MIT License. See the LICENSE file for details.

Happy coding! 🚀