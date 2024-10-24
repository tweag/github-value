import 'dotenv/config'
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import apiRoutes from "./routes/index"
import { createNodeMiddleware } from "octokit";
import { setupWebhookListeners } from './controllers/webhook.controller';
import { queryCopilotMetrics } from './services/metrics.service';
import github from './services/octokit';
import { createSmeeWebhookProxy } from './services/smee';

// queryCopilotMetrics(); Temporarily disabling the metrics query for testing

// const proxy = await createSmeeWebhookProxy(3000);

const app = express();
const PORT = Number(process.env.PORT) || 80;

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
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
