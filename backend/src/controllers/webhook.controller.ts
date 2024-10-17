import { Webhooks } from '@octokit/webhooks';

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET || 'your-secret',
});

webhooks.onAny(({ id, name, payload }) => {
  console.log(name, 'event received:', payload);
  // Process the webhook event here
});

export default webhooks;
