import logger from "./logger.js";
import Client from "smee-client";
import EventSource from "eventsource";

export interface WebhookServiceOptions {
  url?: string,
  port: number,
  path: string
}

class WebhookService {
  eventSource?: EventSource;
  options: WebhookServiceOptions;
  smee?: Client;

  constructor(options: WebhookServiceOptions) {
    this.options = options;
  }

  public async connect(options?: Partial<WebhookServiceOptions>) {
    if (options) {
      this.options = {
        ...this.options,
        ...options
      }
    }

    if (!this.options.url) {
      this.options.url = await this.createSmeeWebhookUrl();
    }

    if (this.options.url.includes('smee.io')) {
      logger.info(`Using Smee to receive webhooks ${this.options.url}`);
      try {
        const SmeeClient = (await import("smee-client")).default;
        this.smee = new SmeeClient({
          source: this.options.url,
          target: `http://localhost:${this.options.port}${this.options.path}`,
          logger: {
            info: (msg: string, ...args) => logger.info('Smee', msg, ...args),
            error: (msg: string, ...args) => logger.error('Smee', msg, ...args),
          }
        });
      
        this.eventSource = await this.smee.start()
      } catch {
        logger.error('Failed to create Smee client');
      };
    } else {
      logger.info(`Using EventSource to receive webhooks ${this.options.url}`);
      const eventSourceUrl = new URL(this.options.url);
      eventSourceUrl.pathname = '/api/github/webhooks';
      this.eventSource = new EventSource(eventSourceUrl.toString());
    }

    return this.eventSource;
  }

  public async disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  private async createSmeeWebhookUrl() {
    const webhookProxyUrl = await (await import("smee-client")).default.createChannel();
    if (!webhookProxyUrl) {
      throw new Error('Unable to create webhook channel');
    }
    return webhookProxyUrl;
  }
}

export default WebhookService;