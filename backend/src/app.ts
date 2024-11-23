import 'dotenv/config'
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as http from 'http';
import { AddressInfo } from 'net';
import apiRoutes from "./routes/index.js"
import Database from './database.js';
import logger, { expressLoggerMiddleware } from './services/logger.js';
import GitHub from './github.js';
import WebhookService from './services/smee.js';
import SettingsService from './services/settings.service.js';

class App {
  eListener?: http.Server;

  constructor(
    public e: Express,
    public port: number,
    public database: Database,
    public github: GitHub,
    public settingsService: SettingsService
  ) {
    this.e = e;
    this.port = port;
  }

  public async start() {
    try {
      this.setupExpress();
      await this.database.connect();

      await this.settingsService.initialize()
        .then(async (settings) => {
          console.log(settings)
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
        })
        .finally(async () => {
          await this.github.smee.connect()
        });
      logger.info('Settings loaded ✅');

      await this.github.connect();
      logger.info('Created GitHub App from environment ✅');

      return this.e;
    } catch (error) {
      this.github.smee.connect();
      logger.debug(error);
      logger.error('Failed to start application ❌');
    }
  }

  public async stop() {
    await this.eListener?.close();
    await this.database.disconnect();
    await this.github.disconnect();
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

    const listener = this.e.listen(this.port, () => {
      const address = listener.address() as AddressInfo;
      logger.info(`Server is running at http://${address.address}:${address.port} 🚀`);
      if (this.settingsService.settings.baseUrl) {
        logger.debug(`Frontend is running at ${this.settingsService.settings.baseUrl} 🌐`);
      }
    });
    this.eListener = listener;

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
    webhookProxyUrl: process.env.GITHUB_WEBHOOK_SECRET,
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
    metricsCronExpression: '0 0 * * *',
    devCostPerYear: '100000',
    developerCount: '100',
    hoursPerYear: '2080',
    percentTimeSaved: '20',
    percentCoding: '20'
  })
);
app.start();

export default app;