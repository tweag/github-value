import { SurveyType } from "../models/survey.model.js";
import mongoose from 'mongoose';

class SurveyService {
  async createSurvey(survey: SurveyType) {
    const Survey = mongoose.model('Survey');
    console.log('Creating survey (service):', survey);
    return await Survey.create(survey);
  }

  async updateSurvey(survey: SurveyType) {
    const Survey = mongoose.model('Survey');
    await Survey.updateOne({ id: survey.id }, survey);
    return await Survey.findOne({ id: survey.id });
  }
  
  async getRecentSurveysWithGoodReasons(minReasonLength: number): Promise<SurveyType[]> {
    const Survey = mongoose.model('Survey');
    return Survey.find({
      reason: {
        $and: [
          { $ne: null },
          { $ne: '' },
          { $gte: minReasonLength }
        ]
      }
    }).sort({ updatedAt: -1 }).limit(20).exec();
  }
}

export default new SurveyService();