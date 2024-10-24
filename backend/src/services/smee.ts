import { createWebhookChannel, createWebhookProxy } from "../helpers/webhook-proxy";

export const createSmeeWebhookProxy = async (port: number) => {
  const url = await createWebhookChannel();
  if (!url)  throw new Error('Unable to create webhook channel');
  const eventSource = await createWebhookProxy({
    url,
    port,
    path: '/api/github/webhooks'
  });
  return { url, eventSource };
}