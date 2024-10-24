import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { createNodeMiddleware } from "octokit";
import apiRoutes from "./routes/index"
import { setupWebhookListeners } from './controllers/webhook.controller';
import github from './services/octokit';
import { createSmeeWebhookProxy } from './services/smee';
import settingsService from './services/settings.service';
import { dbConnect } from './database';

const PORT = Number(process.env.PORT) || 80;

// I hate esm modules... I can't use top level await without a ton of misc. issues
(async () => {
  await dbConnect();

  // queryCopilotMetrics(); // Temporarily disabling the metrics query for testing

  const { url } = await createSmeeWebhookProxy(PORT);
  settingsService.updateOrCreateSettings({ webhookProxyUrl: url });

  const app = express();

  app.use(cors());

  // GitHub Webhook middleware
  setupWebhookListeners(github);
  app.use(createNodeMiddleware(github));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // API Routes
  app.use('/api', apiRoutes);

  // Angular Frontend
  const frontendPath = path.join(__dirname, '../../frontend/dist/github-value/browser');
  app.use(express.static(frontendPath));
  app.get('*', (_, res) => res.sendFile(path.join(frontendPath, 'index.html')));

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT} 🚀`);
  });
})();