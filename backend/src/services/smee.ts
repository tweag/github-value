import { App, createNodeMiddleware } from "octokit";
import { Express } from "express";
import logger from "./logger.js";
import settingsService from "./settings.service.js";
import { setupWebhookListeners } from "../controllers/webhook.controller.js";

class WebhookService {
  private port: number;
  private _webhookProxyUrl?: string;
  get webhookProxyUrl() {
    if (!this._webhookProxyUrl) throw new Error('Webhook proxy URL is not set');
    return this._webhookProxyUrl;
  }
  set webhookProxyUrl(url: string) {
    this._webhookProxyUrl = url;
  }
  webhookProxy?: {
    url: string;
    eventSource: EventSource | undefined;
}

  constructor(port: number) {
    this.port = port;
    this.connect();
  }

  async connect() {
    this.webhookProxy = await this.createSmeeWebhookProxy(this.port);
  }

  private async createSmeeWebhookUrl() {
    const webhookProxyUrl = await (await import("smee-client")).default.createChannel();
    if (!webhookProxyUrl) {
      throw new Error('Unable to create webhook channel');
    }
    this._webhookProxyUrl = webhookProxyUrl;
    return webhookProxyUrl;
  }

  public async createSmeeWebhookProxy(port?: number) {
    if (!port) port = this.port;
    try {
      this._webhookProxyUrl = process.env.WEBHOOK_PROXY_URL || await settingsService.getSettingsByName('webhookProxyUrl');
      if (!this._webhookProxyUrl) {
        throw new Error('Webhook proxy URL is not set');
      }
    } catch {
      this._webhookProxyUrl = await this.createSmeeWebhookUrl();
    }
    let eventSource: EventSource | undefined;
    try {
      eventSource = await this.createWebhookProxy({
        url: this._webhookProxyUrl,
        port,
        path: '/api/github/webhooks'
      });
    } catch (error) {
      logger.error(`Unable to connect to ${this._webhookProxyUrl}. recreating webhook.`, error);
      this._webhookProxyUrl = await this.createSmeeWebhookUrl();
      eventSource = await this.createWebhookProxy({
        url: this._webhookProxyUrl,
        port,
        path: '/api/github/webhooks'
      });
      if (!eventSource) throw new Error('Unable to connect to smee.io');
    }
    this.port = port;
    return { url: this._webhookProxyUrl, eventSource };
  }

  async createWebhookProxy(
    opts: {
      url: string;
      port?: number;
      path?: string;
    },
  ): Promise<EventSource | undefined> {
    try {
      const smee = new (await import("smee-client")).default({
        source: opts.url,
        target: `http://localhost:${opts.port}${opts.path}`,
        logger: {
          info: (msg: string, ...args) => logger.info('Smee', msg, ...args),
          error: (msg: string, ...args) => logger.error('Smee', msg, ...args),
        }
      });
      return smee.start() as EventSource;
    } catch (error) {
      logger.error('Unable to connect to smee.io', error);
    }
  };

  webhookMiddlewareCreate(app: App, e: Express) {
    if (!app) throw new Error('GitHub App is not initialized')
    if (!e) throw new Error('Express app is not initialized')
    const webhookMiddlewareIndex = e._router.stack.findIndex((layer: {
      name: string;
    }) => layer.name === 'bound middleware');
    if (webhookMiddlewareIndex > -1) {
      e._router.stack.splice(webhookMiddlewareIndex, 1);
    }
    setupWebhookListeners(app);
    const web = e.use(createNodeMiddleware(app));
    return web;
  };

}

export default WebhookService;