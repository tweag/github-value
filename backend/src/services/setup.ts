import dotenv from 'dotenv';
import { readFileSync } from "fs";
import { App, createNodeMiddleware, Octokit } from "octokit";
import { setupWebhookListeners } from '../controllers/webhook.controller.js';
import { app as expressApp } from '../app.js';
import { QueryService } from "./query.service.js";
import SmeeService from './smee.js';
import logger from "./logger.js";
import updateDotenv from 'update-dotenv';
import settingsService from './settings.service.js';
import { Express } from 'express';
import { Endpoints } from '@octokit/types';

interface SetupStatusDbsInitialized {
  usage?: boolean;
  metrics?: boolean;
  copilotSeats?: boolean;
  teamsAndMembers?: boolean;
  [key: string]: boolean | undefined;
}
export interface SetupStatus {
  isSetup?: boolean;
  dbInitialized?: boolean;
  dbsInitialized?: SetupStatusDbsInitialized,
  installation?: Endpoints["GET /app"]["response"]['data'];
}

class Setup {
  private static instance: Setup;
  app?: App;
  webhooks?: Express;
  installationId?: number;
  installation?: Endpoints["GET /app"]["response"]['data'];
  installUrl: string | undefined;
  setupStatus: SetupStatus = {
    isSetup: false,
    dbInitialized: false,
    dbsInitialized: {
      usage: false,
      metrics: false,
      copilotSeats: false,
      teamsAndMembers: false
    },
    installation: undefined
  };

  private constructor() { }
  public static getInstance(): Setup {
    if (!Setup.instance) {
      Setup.instance = new Setup();
    }
    return Setup.instance;
  }

  createAppFromCode = async (code: string) => {
    dotenv.config();
    const _octokit = new Octokit();
    const response = await _octokit.rest.apps.createFromManifest({
      code,
    })
    const data = response.data;

    this.addToEnv({
      GITHUB_APP_ID: data.id.toString(),
      GITHUB_APP_PRIVATE_KEY: data.pem
    });
    if (data.webhook_secret) {
      this.addToEnv({
        GITHUB_WEBHOOK_SECRET: data.webhook_secret,
      });
    }

    return data;
  }

  createAppFromExisting = async (appId: string, privateKey: string, webhookSecret: string) => {
    const _app = new App({
      appId: appId,
      privateKey: privateKey,
      webhooks: {
        secret: webhookSecret
      },
      oauth: {
        clientId: null!,
        clientSecret: null!
      }
    })

    this.installUrl = await _app.getInstallationUrl();
    if (!this.installUrl) {
      throw new Error('Failed to get installation URL');
    }

    const installation = await this._findFirstInstallation(_app);

    await _app.getInstallationOctokit(installation.id);

    this.installationId = installation.id;
    this.addToEnv({
      GITHUB_APP_ID: appId,
      GITHUB_APP_PRIVATE_KEY: privateKey,
      GITHUB_WEBHOOK_SECRET: webhookSecret,
      GITHUB_APP_INSTALLATION_ID: installation.id.toString()
    })
    
    return this.createAppFromEnv();
  }

  addToEnv = (obj: { [key: string]: string }) => {
    updateDotenv(obj);
    Object.entries(obj).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }

  getEnv = (key: string) => {
    return process.env[key];
  }

  createAppFromInstallationId = async (installationId: number) => {
    dotenv.config();
    if (!process.env.GITHUB_APP_ID) throw new Error('GITHUB_APP_ID is not set');
    if (!process.env.GITHUB_APP_PRIVATE_KEY) throw new Error('GITHUB_APP_PRIVATE_KEY is not set');
    if (!process.env.GITHUB_WEBHOOK_SECRET) throw new Error('GITHUB_WEBHOOK_SECRET is not set');

    this.app = new App({
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
      installationId: installationId,
      webhooks: {
        secret: process.env.GITHUB_WEBHOOK_SECRET
      },
      oauth: {
        clientId: null!,
        clientSecret: null!
      },
    });

    this.addToEnv({
      GITHUB_APP_INSTALLATION_ID: installationId.toString()
    })
    this.installationId = installationId;

    this.start();
    return this.app;
  }

  createAppFromEnv = async () => {
    if (!process.env.GITHUB_APP_ID) throw new Error('GITHUB_APP_ID is not set');
    if (!process.env.GITHUB_APP_PRIVATE_KEY) throw new Error('GITHUB_APP_PRIVATE_KEY is not set');
    if (!process.env.GITHUB_WEBHOOK_SECRET) throw new Error('GITHUB_WEBHOOK_SECRET is not set');
    if (!process.env.GITHUB_APP_INSTALLATION_ID) throw new Error('GITHUB_APP_INSTALLATION_ID is not set');
    const installationId = Number(process.env.GITHUB_APP_INSTALLATION_ID);
    if (isNaN(installationId)) {
      throw new Error('GITHUB_APP_INSTALLATION_ID is not a valid number');
    }
    this.installationId = installationId;

    this.app = new App({
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
      installationId: process.env.GITHUB_APP_INSTALLATION_ID,
      webhooks: {
        secret: process.env.GITHUB_WEBHOOK_SECRET
      },
      oauth: {
        clientId: null!,
        clientSecret: null!
      },
    });

    await this.start();
    return this.app;
  }

  createWebhookMiddleware = () => {
    const webhookMiddlewearIndex = expressApp._router.stack.findIndex((layer: {
      name: string;
    }) => layer.name === 'bound middleware');
    if (webhookMiddlewearIndex > -1) {
      expressApp._router.stack.splice(webhookMiddlewearIndex, 1);
    }
    if (this.webhooks) {
      logger.debug('Webhook middleware already created');
    }
    if (!this.app) {
      throw new Error('App is not initialized');
    }
    setupWebhookListeners(this.app);
    const web = expressApp.use(createNodeMiddleware(this.app));
    return web;
  };

  getOctokit = () => {
    if (!this.app || !this.installationId) {
      throw new Error('App is not initialized');
    }
    return this.app.getInstallationOctokit(this.installationId);
  }

  start = async () => {
    if (!this.installationId) throw new Error('Installation ID is not set');
    const octokit = await this.getOctokit();
    const authenticated = await octokit.rest.apps.getAuthenticated();
    if (!authenticated.data) throw new Error('Failed to get app');
    this.installation = authenticated.data;
    this.webhooks = this.createWebhookMiddleware();

    const metricsCronExpression = await settingsService.getSettingsByName('metricsCronExpression').catch(() => {
      return '0 0 * * *';
    });
    const timezone = await settingsService.getSettingsByName('timezone').catch(() => {
      return 'UTC';
    });
    QueryService.createInstance(metricsCronExpression, timezone);

    logger.info(`GitHub App ${this.installation.slug} is ready to use`);
  }

  isSetup = () => {
    return !!this.app;
  }

  getSetupStatus = (): SetupStatus => {
    return {
      ...this.setupStatus,
      isSetup: this.isSetup(),
      installation: this.installation
    };
  }

  setSetupStatus = (obj: SetupStatus) => {
    this.setupStatus = {
      ...this.setupStatus,
      ...obj
    };
  }

  setSetupStatusDbInitialized = (dbsInitalized: SetupStatusDbsInitialized) => {
    Object.entries(dbsInitalized).forEach(([key, value]) => {
      if (!this.setupStatus?.dbsInitialized) return;
      if (value) {
        this.setupStatus.dbsInitialized[key] = value;
      }
    });
  }

  getManifest = (baseUrl: string) => {
    const manifest = JSON.parse(readFileSync('github-manifest.json', 'utf8'));
    const base = new URL(baseUrl);
    manifest.url = base.href;
    manifest.hook_attributes.url = new URL('/api/github/webhooks', base).href;
    manifest.setup_url = new URL('/api/setup/install/complete', base).href;
    manifest.redirect_url = new URL('/api/setup/registration/complete', base).href;
    manifest.hook_attributes.url = SmeeService.getWebhookProxyUrl();
    return manifest;
  };

  _findFirstInstallation = async (_app: App) => (new Promise<Endpoints["GET /app/installations"]["response"]["data"][0]>((resolve, reject) => {
    _app.eachInstallation((install) => {
      if (install && install.installation && install.installation.id) {
        resolve(install.installation);
      } else {
        reject(new Error("No installation found"));
      }
      return false;
    });
  }));

}

export default Setup.getInstance();