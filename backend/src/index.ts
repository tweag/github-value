
import App from 'app.js';
import Database from 'database.js';
import express from 'express';
import GitHub from 'github.js';
import SettingsService from 'services/settings.service.js';
import WebhookService from 'services/smee.js';
import whyIsNodeRunning from 'why-is-node-running';

const port = Number(process.env.PORT) || 80;
const e = express();
const app = new App(
  e,
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
  process.on(signal, async () => {
    await app.stop();
    whyIsNodeRunning()
    process.exit(0);
  });
});

app.start();

e.listen(port);