// metricsServiceStandalone.ts  run via "npx tsx src/__tests__/services/metricsServiceStandalone.ts"
import { MockMetricsGenerator } from '../__mock__/metrics-gen/mockGenerator.js';
import type { MockConfig } from '../__mock__/types.js';
import { MetricDailyResponseType } from '../../models/metrics.model.js';
import metricsService from '../../services/metrics.service.js';
import Database from '../../database.js';
import 'dotenv/config';

const exampleConfig: MockConfig = {
  startDate: new Date('2024-06-24'),
  endDate: new Date('2024-06-24'),
  updateFrequency: 'daily',
  metrics: {
    total_active_users: {
      baseValue: 24,
      range: { min: 24, max: 24 },
      trend: 'fixed'
    },
    total_engaged_users: {
      baseValue: 20,
      range: { min: 20, max: 20 },
      trend: 'fixed'
    },
    code_suggestions: {
      baseValue: 249,
      range: { min: 249, max: 249 },
      trend: 'fixed'
    },
    code_acceptances: {
      baseValue: 123,
      range: { min: 123, max: 123 },
      trend: 'fixed'
    },
    code_lines_suggested: {
      baseValue: 225,
      range: { min: 225, max: 225 },
      trend: 'fixed'
    },
    code_lines_accepted: {
      baseValue: 135,
      range: { min: 135, max: 135 },
      trend: 'fixed'
    },
    chats: {
      baseValue: 45,
      range: { min: 45, max: 45 },
      trend: 'fixed'
    },
    chat_insertions: {
      baseValue: 12,
      range: { min: 12, max: 12 },
      trend: 'fixed'
    },
    chat_copies: {
      baseValue: 16,
      range: { min: 16, max: 16 },
      trend: 'fixed'
    },
    pr_summaries: {
      baseValue: 6,
      range: { min: 6, max: 6 },
      trend: 'fixed'
    },
    total_code_reviews: {
      baseValue: 10,
      range: { min: 10, max: 10 },
      trend: 'fixed'
    },
    total_code_review_comments: {
      baseValue: 30,
      range: { min: 30, max: 30 },
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

const org = "octodemo";

function generateExampleData() {
  const mockGenerator = new MockMetricsGenerator(exampleConfig);
  return mockGenerator.generateMetrics(exampleConfig); // pass config?
}

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
const database = new Database(process.env.MONGODB_URI);

async function runTest() {
  try {
    await database.connect();

    const exampleData: MetricDailyResponseType[] = [generateExampleData()]; // Wrap the generated data in an array
    await metricsService.insertMetrics("octodemo", exampleData, null);
    console.log(JSON.stringify(exampleData, null, 2));

    // Verify the insertion
    const insertedMetrics = await metricsService.getMetrics(org);

    // Assertions
    if (!insertedMetrics || insertedMetrics.length === 0) {
      throw new Error('No metrics were inserted.');
    }

    console.log('Inserted Metrics:', insertedMetrics);
    console.log('Test passed successfully.');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await database.disconnect();
  }
}

runTest();
