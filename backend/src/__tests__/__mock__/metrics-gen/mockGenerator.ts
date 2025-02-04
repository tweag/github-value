// mockGenerator.ts
import { addDays, addWeeks, addMonths } from 'date-fns';
import type { MockConfig, MetricConfig } from '../types.js';

export class MockMetricsGenerator {
  private config: MockConfig;
  private currentDate: Date;
  private lastValues: Map<string, number>;

  constructor(config: MockConfig) {
    if (!config) {
      throw new Error('Config object is required');
    }
    this.config = config;
    this.currentDate = new Date(config.startDate);
    this.lastValues = new Map();
  }

  private getNextValue(metric: MetricConfig, metricKey: string): number {
    const lastValue = this.lastValues.get(metricKey) ?? metric.baseValue;
    
    switch (metric.trend) {
      case 'fixed':
        return metric.baseValue;
      
      case 'grow': {
        const growth = metric.growthRate ?? 0.05; // 5% default growth
        const newValue = lastValue * (1 + growth);
        return Math.min(metric.range.max, Math.round(newValue));
      }
      
      case 'decline': {
        const decline = metric.growthRate ?? 0.05; // 5% default decline
        const newValue = lastValue * (1 - decline);
        return Math.max(metric.range.min, Math.round(newValue));
      }
      
      case 'stable': {
        const volatility = metric.volatility ?? 0.15; // 15% default volatility
        const variation = (Math.random() * 2 - 1) * volatility;
        const newValue = lastValue * (1 + variation);
        return Math.min(
          metric.range.max,
          Math.max(metric.range.min, Math.round(newValue))
        );
      }
      
      default:
        return lastValue;
    }
  }

  private generateMetricsForLanguage(modelName: string) {
    return {
      total_engaged_users: this.getNextValue(
        this.config.metrics.total_engaged_users,
        `${modelName}_engaged_users`
      ),
      total_code_suggestions: this.getNextValue(
        this.config.metrics.code_suggestions,
        `${modelName}_suggestions`
      ),
      total_code_acceptances: this.getNextValue(
        this.config.metrics.code_acceptances,
        `${modelName}_acceptances`
      ),
      total_code_lines_suggested: this.getNextValue(
        this.config.metrics.code_lines_suggested,
        `${modelName}_lines_suggested`
      ),
      total_code_lines_accepted: this.getNextValue(
        this.config.metrics.code_lines_accepted,
        `${modelName}_lines_accepted`
      ),
      total_code_reviews: this.getNextValue(
        this.config.metrics.total_code_reviews,
        `${modelName}_code_reviews`
      ),
      total_code_review_comments: this.getNextValue(
        this.config.metrics.total_code_review_comments,
        `${modelName}_code_review_comments`
      )
    };
  }

  private generateDailyMetrics(date: Date) {
    const metrics = {
      date: date.toISOString(),
      total_active_users: this.getNextValue(
        this.config.metrics.total_active_users,
        'total_active_users'
      ),
      total_engaged_users: this.getNextValue(
        this.config.metrics.total_engaged_users,
        'total_engaged_users'
      ),
      copilot_ide_code_completions: {
        total_engaged_users: this.getNextValue(
          this.config.metrics.total_engaged_users,
          'ide_completions_engaged_users'
        ),
        languages: this.config.languages.map(lang => ({
          name: lang,
          total_engaged_users: this.getNextValue(
            this.config.metrics.total_engaged_users,
            `${lang}_engaged_users`
          )
        })),
        editors: this.config.editors.map(editor => ({
          name: editor,
          total_engaged_users: this.getNextValue(
            this.config.metrics.total_engaged_users,
            `${editor}_engaged_users`
          ),
          models: this.config.models.map(model => ({
            ...model,
            total_engaged_users: this.getNextValue(
              this.config.metrics.total_engaged_users,
              `${editor}_${model.name}_engaged_users`
            ),
            languages: this.config.languages.map(lang => ({
              name: lang,
              ...this.generateMetricsForLanguage(`${editor}_${model.name}_${lang}`)
            }))
          }))
        }))
      },
      copilot_ide_chat: {
        total_engaged_users: this.getNextValue(
          this.config.metrics.total_engaged_users,
          'ide_chat_engaged_users'
        ),
        editors: this.config.editors.map(editor => ({
          name: editor,
          total_engaged_users: this.getNextValue(
            this.config.metrics.total_engaged_users,
            `${editor}_chat_engaged_users`
          ),
          models: this.config.models.map(model => ({
            ...model,
            total_engaged_users: this.getNextValue(
              this.config.metrics.total_engaged_users,
              `${editor}_${model.name}_chat_engaged_users`
            ),
            total_chats: this.getNextValue(
              this.config.metrics.chats,
              `${editor}_${model.name}_total_chats`
            ),
            total_chat_insertion_events: this.getNextValue(
              this.config.metrics.chat_insertions,
              `${editor}_${model.name}_chat_insertions`
            ),
            total_chat_copy_events: this.getNextValue(
              this.config.metrics.chat_copies,
              `${editor}_${model.name}_chat_copies`
            )
          }))
        }))
      },
      copilot_dotcom_chat: {
        total_engaged_users: this.getNextValue(
          this.config.metrics.total_engaged_users,
          'dotcom_chat_engaged_users'
        ),
        models: this.config.models.map(model => ({
          ...model,
          total_engaged_users: this.getNextValue(
            this.config.metrics.total_engaged_users,
            `dotcom_${model.name}_chat_engaged_users`
          ),
          total_chats: this.getNextValue(
            this.config.metrics.chats,
            `dotcom_${model.name}_total_chats`
          )
        }))
      },
      copilot_dotcom_pull_requests: {
        total_engaged_users: this.getNextValue(
          this.config.metrics.total_engaged_users,
          'pr_engaged_users'
        ),
        repositories: this.config.repositories.map(repo => ({
          name: repo,
          total_engaged_users: this.getNextValue(
            this.config.metrics.total_engaged_users,
            `${repo}_engaged_users`
          ),
          models: this.config.models.map(model => ({
            ...model,
            total_pr_summaries_created: this.getNextValue(
              this.config.metrics.pr_summaries,
              `${repo}_${model.name}_pr_summaries`
            ),
            total_engaged_users: this.getNextValue(
              this.config.metrics.total_engaged_users,
              `${repo}_${model.name}_engaged_users`
            )
          }))
        }))
      }
    };
    return metrics;
  }

  public generateMetrics(config: MockConfig) {
    this.config = config;
    const metricsArray = [];
    let currentDate = this.config.startDate;

    while (currentDate <= this.config.endDate) {
      metricsArray.push(this.generateDailyMetrics(currentDate));
     
      currentDate = addDays(currentDate, 1);
    }
    //fs.writeFileSync('mockMetrics.json', JSON.stringify(metricsArray, null, 2));
    return metricsArray;
  }
}
