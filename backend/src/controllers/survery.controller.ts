import { Request, Response } from 'express';
import Survey from '../models/survey.model';
import github from '../services/octokit';
import { Octokit } from 'octokit';

class SurveyController {
  // Create a new survey 🎨
  async createSurvey(req: Request, res: Response): Promise<void> {
    try {
      const survey = await Survey.create(req.body);
      res.status(201).json(survey);
      try {
        const octokit = await github.getInstallationOctokit(
          Number(process.env.GITHUB_APP_INSTALLATION_ID)
        );
        const comments = await octokit.rest.issues.listComments({
          owner: survey.owner,
          repo: survey.repo,
          issue_number: survey.prNumber
        })
        const comment = comments.data.find(comment => comment.user?.login === 'demonstrate-value[bot]');
        if (comment) {
          octokit.rest.issues.updateComment({
            owner: survey.owner,
            repo: survey.repo,
            comment_id: comment.id,
            body: `Thanks for filling out the copilot survey @${survey.userId}!`
          })
        }
      } catch (error) {
        console.log('error', error);
      }
    } catch (error) {
      res.status(500).json(error); // 🚨 Error handling
    }
  }

  // Get all surveys 📋
  async getAllSurveys(req: Request, res: Response): Promise<void> {
    try {
      const surveys = await Survey.findAll();
      res.status(200).json(surveys); // 🎉 All surveys retrieved!
    } catch (error) {
      res.status(500).json(error); // 🚨 Error handling
    }
  }

  // Get a survey by ID 🔍
  async getSurveyById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const survey = await Survey.findByPk(id);
      if (survey) {
        res.status(200).json(survey); // 🎉 Survey found!
      } else {
        res.status(404).json({ error: 'Survey not found' }); // 🚨 Survey not found
      }
    } catch (error) {
      res.status(500).json(error); // 🚨 Error handling
    }
  }

  // Update a survey ✏️
  async updateSurvey(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { daytime, userId, usedCopilot, pctTimesaved, timeUsedFor } = req.body;
      const [updated] = await Survey.update({ daytime, userId, usedCopilot, pctTimesaved, timeUsedFor }, {
        where: { id }
      });
      if (updated) {
        const updatedSurvey = await Survey.findByPk(id);
        res.status(200).json(updatedSurvey); // 🎉 Survey updated!
      } else {
        res.status(404).json({ error: 'Survey not found' }); // 🚨 Survey not found
      }
    } catch (error) {
      res.status(500).json(error); // 🚨 Error handling
    }
  }

  // Delete a survey 🗑️
  async deleteSurvey(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await Survey.destroy({
        where: { id }
      });
      if (deleted) {
        res.status(204).send(); // 🎉 Survey deleted!
      } else {
        res.status(404).json({ error: 'Survey not found' }); // 🚨 Survey not found
      }
    } catch (error) {
      res.status(500).json(error); // 🚨 Error handling
    }
  }
}

export default new SurveyController();