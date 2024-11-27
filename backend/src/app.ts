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
import SettingsService from './services/settings.service.js';

class App {
  eListener?: http.Server;
  baseUrl?: string;

  constructor(
    public e: Express,
    public port: number,
    public database: Database,
    public github: GitHub,
    public settingsService: SettingsService
  ) {
    this.port = port;
  }

  public async start() {
    try {
      logger.info('Starting application');
      this.setupExpress();
      logger.info('Express setup complete');
      return;

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

  public async stop() {
    await new Promise(resolve => this.eListener?.close(resolve));
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
    this.e.get(
      '*',
      rateLimit({
        windowMs: 15 * 60 * 1000, max: 5000,
      }),
      (_, res) => res.sendFile(path.join(frontendPath, 'index.html'))
    );

    this.eListener = this.e.listen(this.port);
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

export default App;
