import { readFileSync } from "fs";
import { App, createNodeMiddleware, Octokit } from "octokit";
import { QueryService } from "./services/query.service.js";
import WebhookService from './services/smee.js';
import logger from "./services/logger.js";
import updateDotenv from 'update-dotenv';
import { Express } from 'express';
import { Endpoints } from '@octokit/types';
import { setupWebhookListeners } from "./controllers/webhook.controller.js";
import app from "./index.js";

interface SetupStatusDbsInitialized {
  usage?: boolean;
  metrics?: boolean;
  copilotSeats?: boolean;
  teamsAndMembers?: boolean;
  [key: string]: boolean | undefined;
}
export interface SetupStatus {
  isSetup?: boolean;
  dbConnected?: boolean;
  dbInitialized?: boolean;
  dbsInitialized?: SetupStatusDbsInitialized,
  installation?: Endpoints["GET /app"]["response"]['data'];
}

export interface GitHubInput {
  appId?: string;
  privateKey?: string;
  webhooks?: {
    secret?: string;
  };
  oauth?: {
    clientId: never;
    clientSecret: never;
  };
}
class GitHub {
  app?: App;
  queryService?: QueryService;
  webhooks?: Express;
  webhookPingReceived = false;
  input: GitHubInput;
  expressApp: Express;
  installations = [] as {
    installation: Endpoints["GET /app/installations"]["response"]["data"][0],
    octokit: Octokit
  }[];
  status = 'starting';
  cronExpression = '0 0 * * * *';

  constructor(
    input: GitHubInput,
    expressApp: Express,
    public webhookService: WebhookService,
    private baseUrl: string
  ) {
    this.input = input;
    this.expressApp = expressApp;
  }

  connect = async (input?: GitHubInput) => {
    if (input) this.setInput(input);
    if (!this.input.appId) throw new Error('GITHUB_APP_ID is required');
    if (!this.input.privateKey) throw new Error('GITHUB_APP_PRIVATE_KEY is required');

    this.app = new App({
      appId: this.input.appId,
      privateKey: this.input.privateKey,
      ...this.input.webhooks?.secret ? { webhooks: { secret: this.input.webhooks.secret } } : {},
      oauth: {
        clientId: null,
        clientSecret: null
      } as {
        clientId: never;
        clientSecret: never;
      }
    });

    await updateDotenv({ GITHUB_APP_ID: this.input.appId })
    await updateDotenv({ GITHUB_APP_PRIVATE_KEY: String(this.input.privateKey) })
    if (this.input.webhooks?.secret) await updateDotenv({ GITHUB_WEBHOOK_SECRET: this.input.webhooks.secret })

    try {
      await this.webhookService.connect();
    } catch (error) {
      logger.error('Failed to connect to webhook Smee', error);
    }

    // if (this.webhookService.url) {
    //   try {
    //     await this.app.octokit.request('PATCH /app/hook/config', {
    //       url: this.webhookService.url,
    //       secret: this.input.webhooks?.secret
    //     });
    //     logger.info('Webhook config updated for app', this.webhookService.url, this.input.webhooks?.secret?.replace(/\S/, '*'));
    //   } catch (error) {
    //     logger.warn('Failed to update webhook config for app', error);
    //   }
    //   app.settingsService.updateSetting('webhookProxyUrl', this.webhookService.url, false);
    // }

    try {
      if (!this.app) throw new Error('GitHub App is not initialized')
      if (!this.expressApp) throw new Error('Express app is not initialized')
      const webhookMiddlewareIndex = this.expressApp._router.stack.findIndex((layer: {
        name: string;
      }) => layer.name === 'bound middleware');
      if (webhookMiddlewareIndex > -1) {
        this.expressApp._router.stack.splice(webhookMiddlewareIndex, 1);
      }
      setupWebhookListeners(this.app);
      this.webhooks = this.expressApp.use(createNodeMiddleware(this.app));
    } catch (error) {
      logger.debug(error);
      logger.error('Failed to create webhook middleware')
    }

    if (!this.queryService) {
      this.queryService = new QueryService(this.app, {
        cronTime: this.cronExpression
      });
      await this.queryService.start();
      logger.info(`CRON task ${this.cronExpression} started`);
    }
    for await (const { octokit, installation } of this.app.eachInstallation.iterator()) {
      if (!installation.account?.login) return;
      this.installations.push({
        installation,
        octokit
      });
    }
    return this.app;
  }

  disconnect = () => {
    this.queryService?.delete();
    this.installations = [];
  }

  getAppManifest() {
    const manifest = JSON.parse(readFileSync('github-manifest.json', 'utf8'));
    const base = new URL(this.baseUrl || 'localhost');
    manifest.url = base.href;
    manifest.setup_url = new URL('/api/setup/install/complete', base).href;
    manifest.redirect_url = new URL('/api/setup/registration/complete', base).href;
    manifest.hook_attributes.url = this.webhookService.url;
    if (!manifest.hook_attributes.url) manifest.hook_attributes.url = 'https://example.com/github/events';
    return manifest;
  };

  async createAppFromManifest(code: string) {
    const {
      data: {
        id,
        pem,
        webhook_secret,
        html_url
      }
    } = await new Octokit().rest.apps.createFromManifest({ code });

    if (!id || !pem) throw new Error('Failed to create app from manifest');

    this.input.appId = id.toString();
    this.input.privateKey = pem;

    if (webhook_secret) {
      this.input.webhooks = {
        secret: webhook_secret
      }
      await updateDotenv({
        GITHUB_WEBHOOK_SECRET: webhook_secret,
      });
      app.settingsService.updateSetting('webhookSecret', webhook_secret, false);
    }
    await updateDotenv({
      GITHUB_APP_ID: id.toString(),
      GITHUB_APP_PRIVATE_KEY: pem
    });

    return { id, pem, webhook_secret, html_url };
  }

  async getInstallation(id: string | number) {
    if (!this.app) throw new Error('App is not initialized');
    return new Promise<{
      installation: Endpoints["GET /app/installations"]["response"]["data"][0],
      octokit: Octokit
    }>((resolve, reject) => {
      this.app?.eachInstallation(async ({ installation, octokit }) => {
        if (
          (typeof id === 'string' && id === installation.account?.login) ||
          id === installation.id
        ) {
          resolve({ installation, octokit });
        }
      }).finally(() => reject('Installation not found'));
    });
  }

  setInput(input: GitHubInput) {
    this.input = { ...this.input, ...input };
    return this.input;
  }
}

export default GitHub;