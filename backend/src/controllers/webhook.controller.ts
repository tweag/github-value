import { Webhooks } from '@octokit/webhooks';
import { App } from 'octokit';
import logger from '../services/logger.js';
import settingsService from '../services/settings.service.js';
import { QueryService } from 'services/query.service.js';
import { deleteMember, deleteMemberFromTeam, deleteTeam } from 'models/teams.model.js';

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET || 'your-secret',
  log: {
    debug: logger.debug,
    info: logger.info,
    warn: logger.warn,
    error: logger.error
  }
});

export const setupWebhookListeners = (github: App) => {
  github.webhooks.on("pull_request.opened", ({ octokit, payload }) => {
    const surveyUrl = new URL(`/surveys/new`, settingsService.baseUrl);

    surveyUrl.searchParams.append('url', payload.pull_request.html_url);
    surveyUrl.searchParams.append('author', payload.pull_request.user.login);

    try {
      octokit.rest.issues.createComment({
        owner: payload.repository.owner.login,
        repo: payload.repository.name,
        issue_number: payload.pull_request.number,
        body: `Hi @${payload.pull_request.user.login}! \
  Please fill out this [survey](${surveyUrl.toString()}) \
  to help us understand if you leveraged Copilot in your pull request.`
      });
    } catch (error) {
      logger.error('Error creating survey comment', error);
    };
  });

  github.webhooks.on("team", async ({ payload }) => {
    try {
      switch (payload.action) {
        case 'created':
        case 'edited':
          await QueryService.getInstance().queryTeamsAndMembers(payload.team.slug);
          break;
        case 'deleted':
          await deleteTeam(payload.team.id);
          break;
      }
    } catch (error) {
      logger.error('Error processing team event', error);
    }
  });

  github.webhooks.on("membership", async ({ payload }) => {
    try {
      switch (payload.action) {
        case 'added':
          await QueryService.getInstance().queryTeamsAndMembers(payload.team.slug);
          break;
        case 'removed':
          if (payload.member) {
            await deleteMemberFromTeam(payload.team.id, payload.member.id)
          }
          break;
      }
    } catch (error) {
      logger.error('Error processing membership event', error);
    }
  });

  github.webhooks.on("member", async ({ payload }) => {
    try {
      switch (payload.action) {
        case 'added':
        case 'edited':
          await QueryService.getInstance().queryTeamsAndMembers(undefined, payload.member?.login);
          break;
        case 'removed':
          if (payload.member) {
            await deleteMember(payload.member.id)
          }
          break;
      }
    } catch (error) {
      logger.error('Error processing member event', error);
    }
  });
}

export default webhooks;
