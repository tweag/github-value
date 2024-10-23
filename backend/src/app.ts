import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import apiRoutes from "./routes/index"
import { createNodeMiddleware } from "octokit";
import { setupWebhookListeners } from './controllers/webhook.controller';
import github from './services/octokit';
import cors from 'cors';
import { queryCopilotMetrics } from './services/metrics.service';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());

// Setup webhook listeners
setupWebhookListeners(github);
app.use(createNodeMiddleware(github));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

queryCopilotMetrics();