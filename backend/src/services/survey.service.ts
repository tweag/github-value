import { Survey, SurveyType } from "../models/survey.model.js";
import { Op } from 'sequelize';

class SurveyService {
  async createSurvey(survey: SurveyType) {
    return await Survey.create(survey);
  }

  async updateSurvey(survey: SurveyType) {
    await Survey.update(survey, {
      where: { id: survey.id }
    });
    return await Survey.findByPk(survey.id);
  }

  
  async getRecentSurveysWithGoodReasons(minReasonLength: number): Promise<Survey[]> {
    return Survey.findAll({
      where: {
        reason: {
          [Op.and]: [
            { [Op.ne]: null },
            { [Op.ne]: '' },
            { [Op.gte]: minReasonLength }
          ]
        }
      },
      order: [['updatedAt', 'DESC']],
      limit: 20
    });
  }
}

export default new SurveyService();