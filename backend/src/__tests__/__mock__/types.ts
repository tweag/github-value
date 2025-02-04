// src/types.ts
export type TrendType = 'grow' | 'stable' | 'fixed' | 'decline';

export interface MetricConfig {
  baseValue: number;
  range: {
    min: number;
    max: number;
  };
  trend: TrendType;
  growthRate?: number; // For 'grow' and 'decline' trends
  volatility?: number; // For 'stable' trend, controls random variation
}

export interface MetricsConfig {
  total_active_users: MetricConfig;
  total_engaged_users: MetricConfig;
  code_suggestions: MetricConfig;
  code_acceptances: MetricConfig;
  code_lines_suggested: MetricConfig;
  code_lines_accepted: MetricConfig;
  chats: MetricConfig;
  chat_insertions: MetricConfig;
  chat_copies: MetricConfig;
  pr_summaries: MetricConfig;
  total_code_reviews: MetricConfig;
  total_code_review_comments: MetricConfig;
}

export interface MockConfig {
  startDate: Date;
  endDate: Date;
  updateFrequency: 'daily' | 'weekly' | 'monthly';
  metrics: MetricsConfig;
  models: Array<{
    name: string;
    is_custom_model: boolean;
    custom_model_training_date: string | null;
  }>;
  languages: string[];
  editors: string[];
  repositories: string[];
}

export type UsagePattern = 'light' | 'heavy-but-siloed' | 'moderate' | 'heavy';

export interface SeatsMockConfig {
  startDate: Date;
  endDate: Date;
  usagePattern: UsagePattern;
  heavyUsers: string[];  // List of user logins who are heavy users
  specificUser: string; // Specific user to generate data for
  editors: string[];     // List of possible editors
}

export interface AssigneeActivity {
  login: string;
  lastActivityAt: Date;
}

export interface SurveyMockConfig {
  startDate: Date;
  endDate: Date;
  userIds: string[];
  orgs: string[];
  repos: string[];
  reasons: string[];
  timeUsedFors: string[];
}

