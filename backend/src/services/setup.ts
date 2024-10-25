import dotenv from 'dotenv';
import { appendFileSync, readFileSync } from "fs";
import { App, createNodeMiddleware, Octokit } from "octokit";
import { setupWebhookListeners } from '../controllers/webhook.controller';
import { app as expressApp } from '../app';
import { queryCopilotMetrics } from "./metrics.service";
import SmeeService from './smee';
import logger from "./logger";

class Setup {
  private static instance: Setup;
  app?: App;
  webhooks: any;
  installationId: number | undefined;
  installation: any;

  private constructor() {} // Private constructor to prevent direct instantiation

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
      code: code as string,
    })
    const data = response.data;

    appendFileSync('.env', `GITHUB_WEBHOOK_SECRET=${data.webhook_secret}\n`);
    appendFileSync('.env', `GITHUB_APP_ID=${data.id}\n`);
    appendFileSync('.env', `GITHUB_APP_PRIVATE_KEY="${data.pem}"\n`);
    process.env.GITHUB_WEBHOOK_SECRET = data.webhook_secret;
    process.env.GITHUB_APP_ID = data.id.toString();
    process.env.GITHUB_APP_PRIVATE_KEY = data.pem;

    return data;
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

    appendFileSync('.env', `GITHUB_APP_INSTALLATION_ID=${installationId.toString()}\n`);
    process.env.GITHUB_APP_INSTALLATION_ID = installationId.toString();
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

    this.start();
    return this.app;
  }

  createWebhookMiddleware = () => {
    if (this.webhooks) {
      logger.debug('Webhook middleware already created');
      return;
    }
    if (!this.app) {
      throw new Error('App is not initialized');
    }
    setupWebhookListeners(this.app);
    this.webhooks = expressApp.use(createNodeMiddleware(this.app));
  };

  getOctokit = () => {
    if (!this.app || !this.installationId) {
      throw new Error('App is not initialized');
    }
    return this.app.getInstallationOctokit(this.installationId);
  }

  start = async () => {
    const octokit = await this.getOctokit();
    const authenticated = await octokit.rest.apps.getAuthenticated();
    this.installation = authenticated.data;
    this.createWebhookMiddleware();
    queryCopilotMetrics();
    logger.info(`GitHub App ${this.installation.slug} is ready to use`);
  }

  isSetup = () => {
    return !!this.app;
  }

  getManifest = (baseUrl: string) => {
    const manifest = JSON.parse(readFileSync('github-manifest.json', 'utf8'));
    manifest.url = baseUrl;
    manifest.hook_attributes.url = `${baseUrl}/api/github/webhooks`;
    manifest.setup_url = `${baseUrl}/api/setup/install`;
    manifest.redirect_url = `${baseUrl}/api/setup/redirect`;
    manifest.hook_attributes.url = SmeeService.getWebhookProxyUrl();
    return manifest;
  };

}

export default Setup.getInstance();