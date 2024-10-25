import 'dotenv/config'
import express from 'express';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import apiRoutes from "./routes/index"
import { dbConnect } from './database';
import setup from './services/setup';
import SmeeService from './services/smee';
import logger, { expressLoggerMiddleware } from './services/logger';

const PORT = Number(process.env.PORT) || 80;

export const app = express();
app.use(cors());
app.use(expressLoggerMiddleware);

(async () => {
  await dbConnect();

  const { url: webhookProxyUrl } = await SmeeService.createSmeeWebhookProxy(PORT);

  try {
    await setup.createAppFromEnv();
  } catch (error) {
    logger.info('Failed to create app from environment. This is expected if the app is not yet installed.');
  }

  // API Routes
  app.use('/api', bodyParser.json(), bodyParser.urlencoded({ extended: true }), apiRoutes);

  // Angular Frontend
  const frontendPath = path.join(__dirname, '../../frontend/dist/github-value/browser');
  app.use(express.static(frontendPath));
  app.get('*', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // limit each IP to 100 requests per windowMs
  }), (_, res) => res.sendFile(path.join(frontendPath, 'index.html')));

  app.listen(PORT, () => {
    logger.info(`Server is running at http://localhost:${PORT} 🚀`);
    if (process.env.WEB_URL) {
      logger.debug(`Frontend is running at ${process.env.WEB_URL} 🚀`);
    }
  });
})();