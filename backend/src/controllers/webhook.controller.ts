import { App } from 'octokit';
import logger from '../services/logger.js';
import { deleteMember, deleteMemberFromTeam, deleteTeam } from '../models/teams.model.js';
import surveyService from '../services/survey.service.js';
import app from '../app.js';

export const setupWebhookListeners = (github: App) => {
  github.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
    const survey = await surveyService.createSurvey({
      status: 'pending',
      hits: 0,
      userId: payload.pull_request.user.login,
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      prNumber: payload.pull_request.number,
      usedCopilot: false,
      percentTimeSaved: -1,
      reason: '',
      timeUsedFor: '',
    })
    
    const installation = app.github.installations.find(i => i.installation.id === payload.installation?.id);
    const surveyUrl = new URL(`copilot/surveys/new/${survey.id}`, installation?.installation.html_url);

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
    const queryService = app.github.installations.find(i => i.installation.id === payload.installation?.id)?.queryService;
    if (!queryService) throw new Error('No query service found');
    try {
      switch (payload.action) {
        case 'created':
        case 'edited':
          await queryService.queryTeamsAndMembers(payload.team.slug);
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
    const queryService = app.github.installations.find(i => i.installation.id === payload.installation?.id)?.queryService;
    if (!queryService) throw new Error('No query service found');
    try {
      switch (payload.action) {
        case 'added':
          await queryService.queryTeamsAndMembers(payload.team.slug);
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
    const queryService = app.github.installations.find(i => i.installation.id === payload.installation?.id)?.queryService;
    if (!queryService) throw new Error('No query service found');
    try {
      switch (payload.action) {
        case 'added':
        case 'edited':
          await queryService.queryTeamsAndMembers(undefined, payload.member?.login);
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
