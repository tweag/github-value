import express from 'express';
import bodyParser from 'body-parser';
import apiRoutes from "./routes/index"
import { createWebhookChannel, createWebhookProxy } from './helpers/webhook-proxy';
import { createNodeMiddleware, Webhooks } from '@octokit/webhooks';
import { App } from "octokit";
// import webhooks from './controllers/webhook.controller';
import EventSource from 'eventsource';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// // this creates the smee webhook proxy
// createWebhookChannel().then((url) => {
//     console.log("Smee proxy url:", url);
//     if (!url) return;
//     createWebhookProxy({
//         url,
//         port: PORT,
//         path: '/api/github/webhooks'
//     });
// });
const url = 'https://smee.io/SxQC6L1O80NWJqdL';

const webhooks = new Webhooks({
    secret: 'bananas', // process.env.GITHUB_WEBHOOK_SECRET || 'your-secret',
    log: console,
});

webhooks.onAny(({ id, name, payload }) => {
    console.log(name, 'event received:', payload);
    // Process the webhook event here
});

app.use(createNodeMiddleware(webhooks));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT} 🚀`);
});
