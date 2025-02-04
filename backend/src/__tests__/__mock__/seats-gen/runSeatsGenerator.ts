
//runSeatsGenerator.ts - a script to run the seats generator and output the generated data via "npx tsx src/__tests__/__mock__/seats-gen/runSeatsGenerator.ts"
import { MockSeatsGenerator as MockSeatsGenerator } from './mockSeatsGenerator.js';
import { SeatsMockConfig } from '../types.js';
import seatsExample from './seats.json'; type: 'json';


const mockConfig: SeatsMockConfig = {
  startDate: new Date('2024-11-01'),
  endDate: new Date('2024-12-31'),
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

// Load template data from seatsExample.json
const templateData: any = seatsExample;

let staticTemplateData: any = null;

const generateStatelessMetrics = () => {
  console.log('Starting to generate stateless metrics...');
  try {
    const generator = new MockSeatsGenerator(mockConfig, templateData);
    const metrics = generator.generateMetrics();
    console.log('Successfully generated stateless metrics:', metrics.length);
    return metrics;
  } catch (error) {
    console.error('Error generating stateless metrics:', error);
    throw error; // Re-throw the error after logging it
  }
}

const generateStatefulMetrics = () => {
  console.log('Starting to generate statefull metrics...');
  try {
  if (!staticTemplateData) {
    staticTemplateData = templateData;
  }
  const generator = new MockSeatsGenerator(mockConfig, staticTemplateData);
  const generatedData = generator.generateMetrics();
  staticTemplateData = generatedData;
  console.log('Successfully generated stateful metrics:', generatedData.length);
  return generatedData;
} catch (error) {
  console.error('Error generating stateful metrics:', error);
  throw error; // Re-throw the error after logging it
}
}

// // Example usage
 //import templateData from '.seats-gen/seatsExample.json' assert { type: 'json' };
 //const statelessData = generateStatelessMetrics();
// console.log("Stateless Data:", JSON.stringify(statelessData, null, 2));

// const statefulData = generateStatefulMetrics();
// console.log("Stateful Data:", JSON.stringify(statefulData, null, 2));

// // To simulate repeated calls for stateful generation
// for (let i = 0; i < 5; i++) {
//   const repeatedStatefulData = generateStatefulMetrics();
//   console.log(`Stateful Data Iteration ${i + 1}:`, JSON.stringify(repeatedStatefulData, null, 2));
// }

// Export functions
export { generateStatelessMetrics, generateStatefulMetrics };

