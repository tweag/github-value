import { Request, Response } from 'express';
import { Survey } from '../models/survey.model.js';
import setup from '../services/setup.js';
import logger from '../services/logger.js';
import settingsService from '../services/settings.service.js';
import surveyService from '../services/survey.service.js';

class SurveyController {
  async createSurvey(req: Request, res: Response): Promise<void> {
    try {
      const survey = await surveyService.updateSurvey({
        ...req.body,
        status: 'completed'
      })
      if (!survey) throw new Error('Survey not found');
      res.status(201).json(survey);
      try {
        const surveyUrl = new URL(`copilot/surveys/${survey.id}`, settingsService.baseUrl);
        const octokit = await setup.getOctokit();
        if (!survey.repo || !survey.owner || !survey.prNumber) {
          logger.warn('Cannot process survey comment: missing survey data');
          return;
        }
        const comments = await octokit.rest.issues.listComments({
          owner: survey.owner,
          repo: survey.repo,
          issue_number: survey.prNumber
        });
        if (!setup.installation?.slug) {
          logger.warn('Cannot process survey comment: GitHub App installation or slug not found');
          return;
        }
        const comment = comments.data.find(comment => comment.user?.login.startsWith(setup.installation!.slug!));
        if (comment) {
          octokit.rest.issues.updateComment({
            owner: survey.owner,
            repo: survey.repo,
            comment_id: comment.id,
            body: `Thanks for filling out the [copilot survey](${surveyUrl.toString()}) @${survey.userId}!`
          });
        } else {
          logger.info(`No comment found for survey from ${setup.installation?.slug}`)
        }
      } catch (error) {
        logger.error('Error updating survey comment', error);
        throw error;
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getAllSurveys(req: Request, res: Response): Promise<void> {
    try {
      const surveys = await Survey.findAll();
      res.status(200).json(surveys);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getSurveyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const survey = await Survey.findByPk(id);
      if (survey) {
        res.status(200).json(survey);
      } else {
        res.status(404).json({ error: 'Survey not found' });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updateSurvey(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId, usedCopilot, percentTimeSaved, timeUsedFor } = req.body;
      const [updated] = await Survey.update({ userId, usedCopilot, percentTimeSaved, timeUsedFor }, {
        where: { id }
      });
      if (updated) {
        const updatedSurvey = await Survey.findByPk(id);
        res.status(200).json(updatedSurvey);
      } else {
        res.status(404).json({ error: 'Survey not found' });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async deleteSurvey(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await Survey.destroy({
        where: { id }
      });
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Survey not found' });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new SurveyController();