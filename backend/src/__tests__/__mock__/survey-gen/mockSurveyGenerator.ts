import { addDays } from 'date-fns';
import mongoose from 'mongoose';
import { SurveyMockConfig } from '../types.js';
import SequenceService from '../../../services/sequence.service.js';
import surveyExample from './exampleSurvey.json' assert { type: 'json' };
import { SurveyType } from '../../../database.js';

class MockSurveyGenerator {
  private config: SurveyMockConfig;
  private baseData: any = surveyExample;  // The template data structure

  constructor(config: SurveyMockConfig, templateData: any) {
    this.config = config;
    this.baseData = templateData;
    return Math.floor(Math.random() * 100);
  }

  private getRandomUserId(): string {
    return this.config.userIds[Math.floor(Math.random() * this.config.userIds.length)];
  }

  private getRandomOrg(): string {
    return this.config.orgs[Math.floor(Math.random() * this.config.orgs.length)];
  }

  private getRandomRepo(): string {
    return this.config.repos[Math.floor(Math.random() * this.config.repos.length)];
  }

  private getRandomPrNumber(): number {
    return Math.floor(Math.random() * 100);
  }

  private getRandomPercentTimeSaved(): number {
    const x = Math.floor(Math.random() * 100);
    if ( x < 50 ){
      return Math.floor(Math.random() * 100) || 100;
    }
    return 100;
  }

  private getRandomReason(): string {
    return this.config.reasons[Math.floor(Math.random() * this.config.reasons.length)];
  }

  private getRandomTimeUsedFor(): string {
    return this.config.timeUsedFors[Math.floor(Math.random() * this.config.timeUsedFors.length)];
  }

  private getRandomDate(): Date {
    return addDays(this.config.startDate, Math.floor(Math.random() * (this.config.endDate.getTime() - this.config.startDate.getTime()) / (1000 * 60 * 60 * 24)));
  }

  public async generateSurveys() {
    const newData = JSON.parse(JSON.stringify(this.baseData));

    newData.surveys = await Promise.all(newData.surveys.map(async (survey: SurveyType) => {
      survey.id = await SequenceService.getNextSequenceValue('survey-sequence');
      survey.userId = this.getRandomUserId();
      survey.org = this.getRandomOrg();
      //survey.repo = this.getRandomRepo();
      survey.prNumber = this.getRandomPrNumber();
      survey.usedCopilot = Math.random() > 0.5;
      survey.percentTimeSaved = this.getRandomPercentTimeSaved();
      survey.reason = this.getRandomReason();
      survey.timeUsedFor = this.getRandomTimeUsedFor();
      survey.createdAt = this.getRandomDate();
      survey.updatedAt = this.getRandomDate();
      return survey;
    }));

    return newData;
  }
}

export { MockSurveyGenerator };
