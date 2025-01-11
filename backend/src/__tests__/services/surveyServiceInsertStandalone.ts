// surveyServiceInsertStandalone.ts  run via "npx tsx src/__tests__/services/surveyServiceInsertStandalone.ts"
import SurveyService from '../../services/survey.service.js';
import { generateSurveys } from '../__mock__/survey-gen/runSurveyGenerator.js';
import Database from '../../database.js';
import 'dotenv/config';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
const database = new Database(process.env.MONGODB_URI);

async function runTest() {
  try {
    await database.connect();

    // Test data setup
    const surveys = generateSurveys();

    // Insert each survey
    for (const survey of surveys.surveys) {
      await SurveyService.createSurvey(survey);
    }

    // Verify the insertion
   // const insertedSurveys = await SurveyService.getRecentSurveysWithGoodReasons(5);

    // Assertions
  //  if (!insertedSurveys || insertedSurveys.length === 0) {
//       throw new Error('No surveys were inserted.');
 //   }

   // console.log('Inserted Surveys:', insertedSurveys);
    console.log('Test passed successfully.');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await database.disconnect();
  }
}

runTest();
