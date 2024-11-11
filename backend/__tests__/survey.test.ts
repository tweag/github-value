import 'dotenv/config'
import Survey from '../src/models/survey.model'
import sequelize from '../src/database';
import logger from '../src/services/logger';

beforeAll(async () => {
  try {
    await sequelize.authenticate();
    logger.info('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  await sequelize.sync({ force: true });});

afterAll(async () => {
  await sequelize.close();
});

describe('Survey Model', () => {
  it('should create a survey with valid data', async () => {
    const survey = await Survey.create({
      daytime: new Date(),
      userId: 1044,
      usedCopilot: true,
      pctTimesaved: 50,
      timeUsedFor: 'Releases',
    });

    expect(survey).toBeDefined();
    expect(survey.userId).toBe(1044);
    expect(survey.usedCopilot).toBe(true);
    expect(survey.pctTimesaved).toBe(50);
    expect(survey.timeUsedFor).toBe('Releases');
  });

  it('should calculate timeSaved correctly', async () => {
    const survey = await Survey.create({
      daytime: new Date(),
      userId: 1044,
      usedCopilot: true,
      pctTimesaved: 50,
      timeUsedFor: 'Releases',
    });

    expect(survey.timeSaved).toBe('50% saved for Releases');
  });
});