// src/runMock.ts
import { SophisticatedMockGenerator } from './mockGenerator';
import type { MockConfig } from '../types.js';


const defaultConfig: MockConfig = {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  updateFrequency: 'daily',
  metrics: {
    total_active_users: {
      baseValue: 24,
      range: { min: 20, max: 28 },
      trend: 'grow',
      growthRate: 0.02
    },
    total_engaged_users: {
      baseValue: 20,
      range: { min: 17, max: 23 },
      trend: 'stable',
      volatility: 0.15
    },
    code_suggestions: {
      baseValue: 249,
      range: { min: 212, max: 286 },
      trend: 'grow',
      growthRate: 0.03
    },
    code_acceptances: {
      baseValue: 123,
      range: { min: 105, max: 141 },
      trend: 'stable'
    },
    code_lines_suggested: {
      baseValue: 225,
      range: { min: 191, max: 259 },
      trend: 'grow'
    },
    code_lines_accepted: {
      baseValue: 135,
      range: { min: 115, max: 155 },
      trend: 'stable'
    },
    chats: {
      baseValue: 45,
      range: { min: 38, max: 52 },
      trend: 'grow'
    },
    chat_insertions: {
      baseValue: 12,
      range: { min: 10, max: 14 },
      trend: 'stable'
    },
    chat_copies: {
      baseValue: 16,
      range: { min: 14, max: 18 },
      trend: 'stable'
    },
    pr_summaries: {
      baseValue: 6,
      range: { min: 5, max: 7 },
      trend: 'grow'
    },
    total_code_reviews: {
      baseValue: 10,
      range: { min: 8, max: 12 },
      trend: 'grow'
    },
    total_code_review_comments: {
      baseValue: 30,
      range: { min: 25, max: 35 },
      trend: 'stable',
      volatility: 0.1
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

// Generate a week of data
function generateWeekOfData() {
  const mockGenerator = new SophisticatedMockGenerator(defaultConfig);
  const weekData = [];
  
  for (let i = 0; i < 7; i++) {
    weekData.push(mockGenerator.generateMetrics());
  }
  
  return weekData;
}

// Generate a month of data
function generateMonthOfData(month?: number) {
  const mockGenerator = new SophisticatedMockGenerator(defaultConfig);
  const monthData = [];
  
  const daysInMonth = month ? new Date(defaultConfig.startDate.getFullYear(), month, 0).getDate() : 30;
  
  for (let i = 0; i < daysInMonth; i++) {
    monthData.push(mockGenerator.generateMetrics());
  }
  
  return monthData;
}

// If running directly with Node.js
if (require.main === module) {
  const monthData = generateMonthOfData();
  console.log(JSON.stringify(monthData, null, 2));
}

export { generateWeekOfData, generateMonthOfData, defaultConfig };
