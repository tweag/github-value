// calendarClockServiceTests.ts run via "npx tsx src/__tests__/services/calendarClockServiceTests.ts"
import SurveyService from '../../services/survey.service.js';
import SeatService from '../../services/copilot.seats.service.js';
import metricsService from '../../services/metrics.service.js';
import TeamsService from '../../services/teams.service.js';
import { generateSurveysForDate } from '../__mock__/survey-gen/runSurveyGenerator.js';
import { MockSeatsGenerator } from '../__mock__/seats-gen/mockSeatsGenerator.js';
import { MockMetricsGenerator } from '../__mock__/metrics-gen/mockGenerator.js';
import type { MockConfig, SeatsMockConfig } from '../__mock__/types.js';
import { MetricDailyResponseType } from '../../models/metrics.model.js';
import Database from '../../database.js';
import 'dotenv/config';
import seatsExample from '../__mock__/seats-gen/seatsExampleTest.json'; type: 'json';


let members: any[] = [];
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
const database = new Database(process.env.MONGODB_URI);

const metricsMockConfig: MockConfig = {
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-11-02'),
      updateFrequency: 'daily',
      metrics: {
        total_active_users: {
          baseValue: 24,
          range: { min: 14, max: 240 },
          trend: 'fixed'
        },
        total_engaged_users: {
          baseValue: 20,
          range: { min: 10, max: 200 },
          trend: 'fixed'
        },
        code_suggestions: {
          baseValue: 49,
          range: { min: 49, max: 99 },
          trend: 'fixed'
        },
        code_acceptances: {
          baseValue: 30,
          range: { min: 23, max: 60 },
          trend: 'fixed'
        },
        code_lines_suggested: {
          baseValue: 225,
          range: { min: 225, max: 500 },
          trend: 'fixed'
        },
        code_lines_accepted: {
          baseValue: 90,
          range: { min: 50, max: 155 },
          trend: 'fixed'
        },
        chats: {
          baseValue: 45,
          range: { min: 35, max: 75 },
          trend: 'fixed'
        },
        chat_insertions: {
          baseValue: 12,
          range: { min: 12, max: 30 },
          trend: 'fixed'
        },
        chat_copies: {
          baseValue: 16,
          range: { min: 16, max: 46 },
          trend: 'fixed'
        },
        pr_summaries: {
          baseValue: 6,
          range: { min: 6, max: 16 },
          trend: 'fixed'
        },
        total_code_reviews: {
          baseValue: 10,
          range: { min: 5, max: 10 },
          trend: 'fixed'
        },
        total_code_review_comments: {
          baseValue: 3,
          range: { min: 3, max: 6 },
          trend: 'fixed'
        }
      },
      models: [
        { name: 'default', is_custom_model: false, custom_model_training_date: null },
        { name: 'a-custom-model', is_custom_model: true, custom_model_training_date: '2024-02-01' }
      ],
      languages: ['python', 'ruby', 'typescript', 'go'],
      editors: ['vscode', 'neovim'],
      repositories: ['demo/repo1', 'demo/repo2']
    };

    const seatsMockConfig: SeatsMockConfig = {
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-11-07'),
      usagePattern: 'heavy',
      heavyUsers: ['nathos', 'arfon', 'kyanny'],
      specificUser: 'nathos',
      editors: [
        'copilot-chat-platform',
        'vscode/1.96.2/copilot/1.254.0',
        'GitHubGhostPilot/1.0.0/unknown',
        'vscode/1.96.2/',
        'vscode/1.97.0-insider/copilot-chat/0.24.2024122001'
      ]
    };

function generateMetricsData(datetime: Date) {
      metricsMockConfig.startDate=datetime
      metricsMockConfig.endDate=datetime
      //add other configuration as needed

      console.log('Generating example metrics data...', metricsMockConfig.startDate, metricsMockConfig.endDate);
  const mockGenerator = new MockMetricsGenerator(metricsMockConfig);
  return mockGenerator.generateMetrics(metricsMockConfig);
}

function generateSeatsData(datetime: Date, member: any) {
      seatsMockConfig.startDate=datetime
      seatsMockConfig.endDate=datetime
      seatsMockConfig.heavyUsers = [member]
      //add other configuration as needed
  const mockGenerator = new MockSeatsGenerator(seatsMockConfig, { seats: [] });
  return mockGenerator.generateMetrics();
}

async function runSurveyGen(datetime: Date) {
  if (datetime.getDay() >= 1 && datetime.getDay() <= 5 && datetime.getHours() >= 6 && datetime.getHours() <= 23) {
    if (Math.random() < 0.2) {
      console.log('Running Survey Generation...', datetime);
      const surveys = await generateSurveysForDate(datetime);
      for (const survey of surveys.surveys) {
        await SurveyService.createSurvey(survey);
      }
    }
  }
}

async function runSeatsGen(datetime: Date) {
  console.log('Running Seats Generation...', datetime);
  const org = 'octodemo';
  //call generateSeatsData for each member of the team by looping through the members array
members.forEach(async (member) => {
  const seats = generateSeatsData(datetime, member);
  await SeatService.insertSeats(org, datetime, seatsExample.seats);
});
}

async function runMetricsGen(datetime: Date) {
  if (datetime.getHours() === 23) {
    console.log('Running Metrics Generation...', datetime);
    const exampleData: MetricDailyResponseType[] = generateMetricsData(datetime);
    for (const metric of exampleData) {
      await metricsService.insertMetrics("octodemo", [metric], null);
    }
  }
}

async function calendarClock() {
  let datetime = new Date('2024-11-07T00:00:00');
  const endDate = new Date('2025-01-16T00:00:00');
  members = await TeamsService.getAllMembers('octodemo');
  console.log('count All members:', members.length);

  while (datetime < endDate) {
    await runSurveyGen(datetime);
    await runSeatsGen(datetime);
    await runMetricsGen(datetime);

    datetime.setHours(datetime.getHours() + 1);
  }

  
}

async function runClock() {
  let retryCount = 0;
  const maxRetries = 5;
  let connected = false;

  while (retryCount < maxRetries) {
    try {
      if (!connected) {
        await database.connect();
        connected = true;
      }

      await calendarClock();
      console.log('All Clock-Triggered Generations worked successfully.');
      break;

    } catch (error) {
      retryCount++;
      console.error(`Attempt ${retryCount}/${maxRetries} failed:`, error.message);

      if (error.name === 'MongoServerSelectionError' || 
          error.name === 'MongoNetworkError' ||
          (error.code && error.code === 10107)) {  // Not Primary error code
        
        // Wait with exponential backoff before retrying
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000);
        console.log(`Primary failover detected. Waiting ${backoffTime/1000} seconds before retrying...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        
        // Force reconnection
        try {
          await database.disconnect();
          connected = false;
        } catch (disconnectError) {
          console.log('Disconnect error (can be ignored):', disconnectError.message);
        }
        
        continue;
      }

      throw error;
    }
  }

  if (retryCount === maxRetries) {
    console.error('Max retries reached. Giving up.');
  }

  if (connected) {
    try {
      await database.disconnect();
    } catch (disconnectError) {
      console.error('Error during final disconnect:', disconnectError.message);
    }
  }
}
runClock();