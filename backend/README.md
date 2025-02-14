# Backend

## Overview


## Development
```bash
npm run dev
```

## Database
The backend uses a MongoDB database to store data.

You can run the docker compose file to start the database. Just shutdown the backend server so you can free up the port.
```bash
docker-compose up -d mongo
```

## API Endpoints
Refer to the routes defined in the [`src/routes/index.ts`](./src/routes/index.ts) file for available API endpoints.
