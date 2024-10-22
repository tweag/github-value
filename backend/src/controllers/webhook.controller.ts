import { Webhooks } from '@octokit/webhooks';
import { App } from 'octokit';
import { webUrl } from '../routes/index';

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET || 'your-secret',
});

webhooks.onAny(({ id, name, payload }) => {
  console.log(name, 'event received:', payload);
  // Process the webhook event here
});

export const setupWebhookListeners = (octokit: App) => {
  octokit.webhooks.on("pull_request.opened", ({ octokit, payload }) => {
    console.log("Pull request opened", payload);
    return octokit.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.pull_request.number,
      body: `Hi @${payload.pull_request.user.login}! Please fill out this [survey](${webUrl}/copilot-survey) to help us understand if you leveraged Copilot in your pull request.`
    });
  });
}

export default webhooks;
