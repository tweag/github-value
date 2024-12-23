import { Request, Response } from 'express';
import { Survey } from '../models/survey.model.js';
import logger from '../services/logger.js';
import surveyService from '../services/survey.service.js';
import app from '../index.js';
import { Op, Sequelize, WhereOptions } from 'sequelize';
import mongoose from 'mongoose';

class SurveyController {
  async updateSurveyGitHub(req: Request, res: Response): Promise<void> {
    let survey: Survey;
    try {
      const _survey = await surveyService.updateSurvey({
        ...req.body,
        status: 'completed'
      })
      if (!_survey) throw new Error('Survey not found');
      survey = _survey;
      res.status(201).json(survey);
    } catch (error) {
      res.status(500).json(error);
      return;
    }
    try {
      const { installation, octokit } = await app.github.getInstallation(survey.org);
      const surveyUrl = new URL(`copilot/surveys/${survey.id}`, app.baseUrl);

      if (!survey.repo || !survey.org || !survey.prNumber) {
        logger.warn('Cannot process survey comment: missing survey data');
        return;
      }
      const comments = await octokit.rest.issues.listComments({
        owner: survey.org,
        repo: survey.repo,
        issue_number: survey.prNumber
      });
      const comment = comments.data.find(comment => comment.user?.login.startsWith(installation.app_slug));
      if (comment) {
        octokit.rest.issues.updateComment({
          owner: survey.org,
          repo: survey.repo,
          comment_id: comment.id,
          body: `Thanks for filling out the [copilot survey](${surveyUrl.toString()}) @${survey.userId}!`
        });
      } else {
        logger.info(`No comment found for survey from ${survey.org}`);
      }
    } catch (error) {
      logger.error('Error updating survey comment', error);
      throw error;
    }
  }

  async createSurvey(req: Request, res: Response): Promise<void> {
    try {
      const Survey = mongoose.model('Survey');
      const survey = await Survey.create(
        req.body,
        { upsert: true }
      );
      res.status(201).json(survey);
    } catch (error) {
      res.status(500).json(error);
      return;
    }
  }

  async getAllSurveys(req: Request, res: Response): Promise<void> {
    try {
      console.log('getting surveys')
      const { org, reasonLength } = req.query;
      const Survey = mongoose.model('Survey');

      const surveys = await Survey.find({
        ...org ? { org: org as string } : {},
        ...reasonLength ? {$expr: { $gt: [{ $strLenCP: '$name' }, 40] } } : {}
      });
      console.log('good', surveys)
      res.status(200).json(surveys);
    } catch (error) {
      console.log('error', error)
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
      // implement the other fields... possibly
      const [updated] = await Survey.update(req.body, {
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