import 'dotenv/config'
import { Options } from 'sequelize';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from "./routes/index.js"
import Database from './database.js';
import settingsService from './services/settings.service.js';
import logger, { expressLoggerMiddleware } from './services/logger.js';
import GitHub from './github.js';
import WebhookService from './services/smee.js';
import * as http from 'http';
import { AddressInfo } from 'net';

class App {
  eListener?: http.Server;

  constructor(
    public e: Express,
    public port: number,
    public database: Database,
    public github: GitHub
  ) {
    this.e = e;
    this.port = port;
  }

  private async setupGithubApp() {
    try {
      await this.github.connect();
      logger.info('Created GitHub App from environment ✅');
    } catch (error) {
      logger.debug(error);
      logger.warn('Failed to create app from environment. This is expected if the app is not yet installed.');
    }
  }

  private setupRoutes() {
    this.e.use(cors());
    this.e.use(expressLoggerMiddleware);

    this.e.use((req, res, next) => {
      if (req.path === '/api/github/webhooks') {
        return next();
      }
      bodyParser.json()(req, res, next);
    }, bodyParser.urlencoded({ extended: true }));
    this.e.use('/api', apiRoutes);

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const frontendPath = path.resolve(__dirname, '../../frontend/dist/github-value/browser');

    this.e.use(express.static(frontendPath));
    this.e.get('*', rateLimit({
      windowMs: 15 * 60 * 1000, max: 5000,
    }), (_, res) => res.sendFile(path.join(frontendPath, 'index.html')));

    this.eListener = this.e.listen(this.port, () => {
      logger.info(`Server is running at http://localhost:${this.port} 🚀`);
      if (process.env.WEB_URL) {
        logger.debug(`Frontend is running at ${process.env.WEB_URL} 🚀`);
      }
    });

    const address = this.eListener.address() as AddressInfo;
    logger.info(`Server address: ${address.address}:${address.port}`);
  }

  public async start() {
    try {
      this.setupRoutes();
      await this.database.connect();
      await settingsService.initializeSettings();
      logger.info('Settings loaded ✅');
      await this.setupGithubApp();

      return this.e;
    } catch (error) {
      logger.debug(error);
      logger.error('Failed to start application ❌');
    }
  }
}

const port = Number(process.env.PORT) || 80;
const e = express();
const app = new App(
  e,
  port,
  new Database({
    dialect: 'mysql',
    logging: (sql) => logger.debug(sql),
    timezone: '+00:00', // Force UTC timezone
    dialectOptions: {
      timezone: '+00:00' // Force UTC for MySQL connection
    },
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  }),
  new GitHub(
    {
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
      installationId: Number(process.env.GITHUB_APP_INSTALLATION_ID),
      webhooks: {
        secret: process.env.GITHUB_WEBHOOK_SECRET
      }
    },
    e,
    new WebhookService(port)
  )
);
app.start();

export default app;