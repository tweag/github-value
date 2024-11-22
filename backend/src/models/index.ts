import { Model, Sequelize } from 'sequelize';
import {
  MetricDaily,
  MetricEditor,
  MetricModelStats,
  MetricLanguageStats,
  MetricIdeChatMetrics,
  MetricIdeChatEditor,
  MetricIdeChatModelStats,
  MetricDotcomChatMetrics,
  MetricDotcomChatModelStats,
  MetricPrMetrics,
  MetricPrRepository,
  MetricPrModelStats,
  MetricIdeCompletions
} from './metrics.model';

// Initialize Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/austen');
