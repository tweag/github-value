// runSurveyGenerator.ts - a script to run the survey generator and output the generated data via "npx tsx src/__tests__/__mock__/survey-gen/runSurveyGenerator.ts"
import { MockSurveyGenerator } from './mockSurveyGenerator.js';
import { SurveyMockConfig } from '../types.js';
import surveyExample from './exampleSurvey.json' assert { type: 'json' };
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from '../../../database.js';
import 'dotenv/config';

// Convert the URL to a file path and get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mockConfig: SurveyMockConfig = {
  startDate: new Date('2024-12-30'),
  endDate: new Date('2024-12-31'),
  userIds: ['nathos', 'mattg57', '04Surf','azizshamim','beardofedu','austenstone','arfon', 'kyanny', 'amandahmt', 'jefeish', 'sdehm', 'dgreif', 'matthewisabel', '2percentsilk', 'mariorod','bekahwhittle','AdamTheCreator','bevns','mfilosa'],
  orgs: ['octodemo'],
  repos: ['github-value', 'github-value-chart'],
  reasons: ['Prefilled code blocks for me', 'Helped me generate test data', 'I was able to build a new feature without learning the framework'],
  timeUsedFors: ['Faster PRs', 'Faster Releases', 'Tech Debt, Reduce Defects and Vulns']
};

// Load template data from exampleSurvey.json
const templateData: any = surveyExample;

const runSurveys = async () => {
  console.log('Starting to generate surveys...');
  try {
    const generator = new MockSurveyGenerator(mockConfig, templateData);
    const surveys = await generator.generateSurveys();
    console.log('Successfully generated surveys:', surveys.surveys.length);
    return surveys;
  } catch (error) {
    console.error('Error generating surveys:', error);
    throw error; // Re-throw the error after logging it
  }
}

const runSurveysForDate = async (datetime: Date) => {
  mockConfig.startDate = datetime;
  mockConfig.endDate = datetime;
  //add other configuration as needed
  //console.log('Starting to generate surveys...');
  try {
    const generator = new MockSurveyGenerator(mockConfig, templateData);
    const surveys = await generator.generateSurveys();
    console.log('Successfully generated surveys:', surveys.surveys.length);
    return surveys;
  } catch (error) {
    console.error('Error generating surveys:', error);
    throw error; // Re-throw the error after logging it
  }
}

// let db: Database | null = null;
// try {
//   const mongoUri = process.env.MONGODB_URI;
//   if (!mongoUri) {
//     throw new Error('MONGODB_URI is not defined');
//   }
//   db = new Database(mongoUri);
//   await db.connect();
//   let surveys = await runSurveys();
//   console.log('surveys:', surveys);
  
// } catch (error) {
//   console.error('Error connecting to the database:', error);
// }

// Export function
export { runSurveys, runSurveysForDate };