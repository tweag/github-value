# Backend

## Overview


## Development
```bash
npm run dev
```

## Database
The backend uses a MySQL database to store data.

You can run the docker compose file to start the database. Just shutdown the backend server so you can free up the port.

You can also run it manually:
```bash
docker run -d \
  --name db \
  --restart always \
  -e MYSQL_PASSWORD=octocat \
  -e MYSQL_DATABASE=value \
  -p 3306:3306 \
  -v db:/var/lib/mysql \
  -v ./db/init.sql:/docker-entrypoint-initdb.d/init.sql \
  mysql
```

## API Endpoints
Refer to the routes defined in the [`src/routes/index.ts`](./src/routes/index.ts) file for available API endpoints.
