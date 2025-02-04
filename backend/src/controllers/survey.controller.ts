import { application, Request, Response } from 'express';
import { SurveyType } from '../models/survey.model.js';
import logger from '../services/logger.js';
import surveyService from '../services/survey.service.js';
import app from '../index.js';
import mongoose from 'mongoose';
import { MemberType } from 'models/teams.model.js';
import { memoryUsage } from 'process';
import validator from 'validator';




class SurveyController {
  async updateSurveyGitHub(req: Request, res: Response): Promise<void> {
    let survey: SurveyType;
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
      console.log('req.body', req.body);
      const newSurvey = req.body;
      //const member = await this.getMemberByLogin(newSurvey.userId, newSurvey.org)|| true; //needs to be fixed :"Cannot read properties of undefined (reading 'getMemberByLogin')""
      if (true) {
        const survey = surveyService.createSurvey(newSurvey);
        res.status(201).json(survey);
      }
    } catch (error) {
      res.status(500).json((error as Error).message);
      return;
    }
  }

  async getAllSurveys(req: Request, res: Response): Promise<void> {
    const { org, team, reasonLength, since, until, status } = req.query as { [key: string]: string | undefined };;
    try {
      const dateFilter: any = {};
      if (since) {
        dateFilter.$gte = new Date(since);
      }
      if (until) {
        dateFilter.$lte = new Date(until);
      }

      const query = {
        filter: {
          ...(org ? { org: String(org) } : {}),
          ...(team ? { team: String(team) } : {}),
          ...(reasonLength ? { $expr: { $and: [{ $gt: [{ $strLenCP: { $ifNull: ['$reason', ''] } }, 40] }, { $ne: ['$reason', null] }] } } : {}),
          ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
          ...(status ? { status } : {}),
        },
        projection: {
          _id: 0,
          __v: 0,
        }
      };

      const Survey = mongoose.model('Survey');
      const surveys = await Survey.find(query.filter, query.projection);
      res.status(200).json(surveys);

    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getSurveyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const Survey = mongoose.model('Survey');
      const survey = await Survey.findOne({ id: Number(id) }); // Cast `id` to Number
      if (!survey) {
        res.status(404).json({ message: 'Survey not found' });
        return;
      }
      res.status(200).json(survey);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updateSurvey(req: Request, res: Response): Promise<void> {
    try {
      const Survey = mongoose.model('Survey');
      const { id } = req.params;
      const updated = await Survey.findOneAndUpdate({
        id: Number(id) // Cast `id` to Number
      }, req.body);
      if (updated) {
        res.status(200).json({ _id: id, ...req.body });
      } else {
        res.status(404).json({ error: 'Survey not found' });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async deleteSurvey(req: Request, res: Response): Promise<void> {
    try {
      const Survey = mongoose.model('Survey');
      const { id } = req.params;
      const deleted = await Survey.findByIdAndDelete(id);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Survey not found' });
      }
    } catch (error) {
      res.status(500).json(error);
    }
    //create a helper function that calls this api
    //router.get('/members/:login', teamsController.getMemberByLogin);
  }

  async getMemberByLogin(loginToFind: string, orgToMatch: string): Promise<MemberType> {
    // Ensure both values are provided.
    if (!loginToFind || !orgToMatch) {
      throw new Error('Both login and org must be provided');
    }

    // Trim the login input and then validate.
    const trimmedLogin = loginToFind.trim();
    if (!validator.isAlphanumeric(trimmedLogin, 'en-US', { ignore: '-' })) {
      throw new Error('Invalid login: Only alphanumeric characters and dashes are allowed');
    }

    // Optionally validate org if needed
    const trimmedOrg = orgToMatch.trim();
    if (!trimmedOrg) {
      throw new Error('Invalid organization provided');
    }

    // Retrieve the Member model once instead of on every method call.
    const Member = mongoose.model<MemberType>('Member');

    try {
      const member = await Member.findOne({ login: trimmedLogin, org: trimmedOrg })
        .select('login name url avatar_url')
        .exec();

      if (member) {
        return member;
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error('Member lookup failed with: ' + (error as Error).message);
    }
  }
}


export default new SurveyController();