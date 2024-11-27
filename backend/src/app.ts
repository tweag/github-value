import 'dotenv/config'
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as http from 'http';
import apiRoutes from "./routes/index.js"
import Database from './database.js';
import logger, { expressLoggerMiddleware } from './services/logger.js';
import GitHub from './github.js';
import WebhookService from './services/smee.js';
import SettingsService from './services/settings.service.js';

class App {
  eListener?: http.Server;
  baseUrl?: string;
  e: Express;

  constructor(
    public port: number,
    public database: Database,
    public github: GitHub,
    public settingsService: SettingsService
  ) {
    this.port = port;
    this.e = express();
  }

  public async start() {
    try {
      this.setupExpress();
      return;
      logger.info('Express setup complete');

      await this.database.connect();
      logger.info('Database connected');

      await this.initializeSettings();
      logger.info('Settings initialized');

      await this.github.connect();
      logger.info('GitHub App connected');

      return this.e;
    } catch (error) {
      await this.github.smee.connect();
      logger.debug(error);
      logger.error('Failed to start application ❌');
      if (error instanceof Error) {
        logger.error(error.message);
      }
    }
  }

  public stop() {
    this.eListener?.close(() => {
      logger.info('Server closed');
    });
    this.database.disconnect();
    this.github.disconnect();
  }

  private setupExpress() {
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

    const listener = this.e.listen(this.port);
    this.eListener = listener;
  }

  private initializeSettings() {
    this.settingsService.initialize()
      .then(async (settings) => {
        if (settings.webhookProxyUrl) {
          this.github.smee.options.url = settings.webhookProxyUrl
        }
        if (settings.webhookSecret) {
          this.github.setInput({
            webhooks: {
              secret: settings.webhookSecret
            }
          });
        }
        if (settings.metricsCronExpression) {
          this.github.cronExpression = settings.metricsCronExpression;
        }
        if (settings.baseUrl) {
          this.baseUrl = settings.baseUrl;
        }
      })
      .finally(async () => {
        await this.github.smee.connect()
        await this.settingsService.updateSetting('webhookSecret', this.github.input.webhooks?.secret || '');
        await this.settingsService.updateSetting('webhookProxyUrl', this.github.smee.options.url!);
        await this.settingsService.updateSetting('metricsCronExpression', this.github.cronExpression!);
      });
  }
}

const port = Number(process.env.PORT) || 80;
const app = new App(
  port,
  new Database(process.env.JAWSDB_URL ? process.env.JAWSDB_URL : {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT) || 3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'value'
  }),
  new GitHub(
    {
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
      webhooks: {
        secret: process.env.GITHUB_WEBHOOK_SECRET
      }
    },
    e,
    new WebhookService({
      url: process.env.WEBHOOK_PROXY_URL,
      path: '/api/github/webhooks',
      port
    })
  ), new SettingsService({
    baseUrl: process.env.BASE_URL,
    webhookProxyUrl: process.env.GITHUB_WEBHOOK_PROXY_URL,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
    metricsCronExpression: '0 0 * * *',
    devCostPerYear: '100000',
    developerCount: '100',
    hoursPerYear: '2080',
    percentTimeSaved: '20',
    percentCoding: '20'
  })
);

['SIGTERM', 'SIGINT', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => {
    logger.info(`Received ${signal}. Stopping the app...`);
    app.stop();
    process.exit(signal === 'uncaughtException' ? 1 : 0);
  });
});

app.start();
logger.info('App started');

export default app;
