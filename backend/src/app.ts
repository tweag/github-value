import express from 'express';
import bodyParser from 'body-parser';
import apiRoutes from "./routes/index"
import { createWebhookChannel, createWebhookProxy } from './helpers/webhook-proxy';
import { createNodeMiddleware } from '@octokit/webhooks';
import webhooks from './controllers/webhook.controller';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.use('/webhooks', createNodeMiddleware(webhooks));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});

// this creates the smee webhook proxy
createWebhookChannel().then((url) => {
    console.log("Smee proxy url:", url);
    if (!url) return;
    createWebhookProxy({
        url,
        port: PORT,
        path: '/events'
    });
});