import { Model, DataTypes, Sequelize, BaseError, InferAttributes, InferCreationAttributes } from 'sequelize';
import { CopilotMetrics } from './metrics.model.interfaces.js';
import logger from '../services/logger.js';

type MetricDailyType = {
  date: Date;
  total_active_users: number;
  total_engaged_users: number;
  copilot_ide_code_completions?: MetricIdeCompletionsType;
  copilot_dotcom_pull_requests?: MetricPrMetricsType;
  copilot_dotcom_chat?: MetricDotcomChatMetricsType;
  copilot_ide_chat?: MetricIdeChatMetricsType;
}

type MetricIdeCompletionsType = {
  id?: number;
  total_engaged_users: number;
  total_code_acceptances: number;
  total_code_suggestions: number;
  total_code_lines_accepted: number;
  total_code_lines_suggested: number;
  daily_metric_id: Date;
  editors?: MetricEditorType[];
}

type MetricEditorType = {
  id?: number;
  name: string;
  total_engaged_users: number;
  total_code_acceptances: number;
  total_code_suggestions: number;
  total_code_lines_accepted: number;
  total_code_lines_suggested: number;
  ide_completion_id: number;
  models?: MetricModelStatsType[];
}

type MetricModelStatsType = {
  id?: number;
  name: string;
  is_custom_model: boolean;
  total_engaged_users: number;
  total_code_acceptances: number;
  total_code_suggestions: number;
  total_code_lines_accepted: number;
  total_code_lines_suggested: number;
  editor_id: number;
  languages?: MetricLanguageStatsType[];
}

type MetricLanguageStatsType = {
  id?: number;
  name: string;
  total_engaged_users: number;
  total_code_acceptances: number;
  total_code_suggestions: number;
  total_code_lines_accepted: number;
  total_code_lines_suggested: number;
  model_stat_id: number;
}

type MetricPrRepositoryType = {
  id?: number;
  name: string;
  total_engaged_users: number;
  total_pr_summaries_created: number;
  pr_metrics_id: number;
  models?: MetricPrModelStatsType[];
}

type MetricPrModelStatsType = {
  id?: number;
  name: string;
  is_custom_model: boolean;
  total_engaged_users: number;
  total_pr_summaries_created: number;
  repository_id: number;
}

type MetricPrMetricsType = {
  id?: number;
  total_engaged_users: number;
  total_pr_summaries_created: number;
  daily_metric_id: Date;
  repositories?: MetricPrRepositoryType[];
}

type MetricDotcomChatMetricsType = {
  id?: number;
  total_engaged_users: number;
  total_chats: number;
  daily_metric_id: Date;
  models?: MetricDotcomChatModelStatsType[];
}

type MetricDotcomChatModelStatsType = {
  id?: number;
  name: string;
  is_custom_model: boolean;
  total_engaged_users: number;
  total_chats: number;
  chat_metrics_id: number;
}

type MetricIdeChatMetricsType = {
  id?: number;
  total_engaged_users: number;
  total_chats: number;
  total_chat_copy_events: number;
  total_chat_insertion_events: number;
  daily_metric_id: Date;
  editors?: MetricIdeChatEditorType[];
}

type MetricIdeChatEditorType = {
  id?: number;
  name: string;
  total_engaged_users: number;
  total_chats: number;
  total_chat_copy_events: number;
  total_chat_insertion_events: number;
  chat_metrics_id: number;
  models?: MetricIdeChatModelStatsType[];
}

type MetricIdeChatModelStatsType = {
  id?: number;
  name: string;
  is_custom_model: boolean;
  total_engaged_users: number;
  total_chats: number;
  total_chat_copy_events: number;
  total_chat_insertion_events: number;
  editor_id: number;
}

class MetricDaily extends Model<MetricDailyType> {
  declare date: Date;
  declare total_active_users: number;
  declare total_engaged_users: number;
  declare copilot_ide_code_completions: MetricIdeCompletionsType | null;
  declare copilot_dotcom_pull_requests: MetricPrMetricsType | null;
  declare copilot_dotcom_chat: MetricDotcomChatMetricsType | null;
  declare copilot_ide_chat: MetricIdeChatMetricsType | null;

  static initModel(sequelize: Sequelize) {
    MetricDaily.init({
      date: {
        type: DataTypes.DATE,
        primaryKey: true,
      },
      total_active_users: DataTypes.INTEGER,
      total_engaged_users: DataTypes.INTEGER,
    }, {
      sequelize,
      timestamps: false
    });

    MetricIdeCompletions.initModel(sequelize);
    MetricEditor.initModel(sequelize);
    MetricModelStats.initModel(sequelize);
    MetricLanguageStats.initModel(sequelize);
    MetricPrRepository.initModel(sequelize);
    MetricPrModelStats.initModel(sequelize);
    MetricPrMetrics.initModel(sequelize);
    MetricDotcomChatMetrics.initModel(sequelize);
    MetricDotcomChatModelStats.initModel(sequelize);
    MetricIdeChatMetrics.initModel(sequelize);
    MetricIdeChatEditor.initModel(sequelize);
    MetricIdeChatModelStats.initModel(sequelize);

    MetricDaily.hasOne(MetricIdeCompletions, {
      as: 'copilot_ide_code_completions', foreignKey: 'daily_metric_id',
      sourceKey: 'date'
    });
    MetricDaily.hasOne(MetricPrMetrics, {
      as: 'copilot_dotcom_pull_requests',
      foreignKey: 'daily_metric_id'
    });
    MetricDaily.hasOne(MetricDotcomChatMetrics, {
      as: 'copilot_dotcom_chat',
      foreignKey: 'daily_metric_id'
    });
    MetricDaily.hasOne(MetricIdeChatMetrics, {
      as: 'copilot_ide_chat',
      foreignKey: 'daily_metric_id'
    });
    MetricIdeChatMetrics.belongsTo(MetricDaily, {
      foreignKey: 'daily_metric_id'
    });
    MetricIdeChatMetrics.hasMany(MetricIdeChatEditor, {
      as: 'editors',
      foreignKey: 'chat_metrics_id'
    });
    MetricIdeChatEditor.belongsTo(MetricIdeChatMetrics, {
      foreignKey: 'chat_metrics_id'
    });
    MetricIdeChatEditor.hasMany(MetricIdeChatModelStats, {
      as: 'models',
      foreignKey: 'editor_id'
    });
    MetricIdeChatModelStats.belongsTo(MetricIdeChatEditor, {
      foreignKey: 'editor_id'
    });
    
    MetricIdeCompletions.belongsTo(MetricDaily, {
      as: 'DailyMetric',
      foreignKey: 'daily_metric_id',
      targetKey: 'date'
    });
    MetricIdeCompletions.hasMany(MetricEditor, {
      as: 'editors', foreignKey: 'ide_completion_id'
    });
    MetricEditor.belongsTo(MetricIdeCompletions, {
      as: 'copilot_ide_code_completions',
      foreignKey: 'ide_completion_id'
    });
    MetricEditor.hasMany(MetricModelStats, {
      as: 'models', foreignKey: 'editor_id'
    });
    MetricModelStats.belongsTo(MetricEditor, {
      as: 'editor',
      foreignKey: 'editor_id'
    });
    MetricModelStats.hasMany(MetricLanguageStats, {
      as: 'languages',
      foreignKey: 'model_stat_id'
    });
    MetricLanguageStats.belongsTo(MetricModelStats, {
      as: 'model',
      foreignKey: 'model_stat_id'
    });
    
    MetricPrMetrics.belongsTo(MetricDaily, {
      foreignKey: 'daily_metric_id',
      targetKey: 'date'
    });
    MetricPrMetrics.hasMany(MetricPrRepository, {
      as: 'repositories',
      foreignKey: 'pr_metrics_id'
    });
    MetricPrRepository.belongsTo(MetricPrMetrics, {
      foreignKey: 'pr_metrics_id'
    });
    MetricPrRepository.hasMany(MetricPrModelStats, {
      as: 'models',
      foreignKey: 'repository_id'
    });
    MetricPrModelStats.belongsTo(MetricPrRepository, {
      foreignKey: 'repository_id'
    });
    
    MetricDotcomChatMetrics.belongsTo(MetricDaily, {
      foreignKey: 'daily_metric_id',
      targetKey: 'date'
    });
    MetricDotcomChatMetrics.hasMany(MetricDotcomChatModelStats, {
      as: 'models',
      foreignKey: 'chat_metrics_id'
    });
    MetricDotcomChatModelStats.belongsTo(MetricDotcomChatMetrics, {
      foreignKey: 'chat_metrics_id'
    });
  }
}

class MetricIdeCompletions extends Model<MetricIdeCompletionsType> {
  declare id?: number;
  declare total_engaged_users: number;
  declare total_code_acceptances: number;
  declare total_code_suggestions: number;
  declare total_code_lines_accepted: number;
  declare total_code_lines_suggested: number;
  declare daily_metric_id: Date;

  static initModel(sequelize: Sequelize) {
    MetricIdeCompletions.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      total_engaged_users: DataTypes.INTEGER,
      total_code_acceptances: DataTypes.INTEGER,
      total_code_suggestions: DataTypes.INTEGER,
      total_code_lines_accepted: DataTypes.INTEGER,
      total_code_lines_suggested: DataTypes.INTEGER,
      daily_metric_id: DataTypes.DATE
    }, {
      sequelize,
      timestamps: false
    });
  }
}

class MetricEditor extends Model<MetricEditorType> {
  declare id?: number;
  declare name: string;
  declare total_engaged_users: number;
  declare total_code_acceptances: number;
  declare total_code_suggestions: number;
  declare total_code_lines_accepted: number;
  declare total_code_lines_suggested: number;
  declare ide_completion_id: number;

  static initModel(sequelize: Sequelize) {
    MetricEditor.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      total_engaged_users: DataTypes.INTEGER,
      total_code_acceptances: DataTypes.INTEGER,
      total_code_suggestions: DataTypes.INTEGER,
      total_code_lines_accepted: DataTypes.INTEGER,
      total_code_lines_suggested: DataTypes.INTEGER,
      ide_completion_id: DataTypes.INTEGER
    }, {
      sequelize,
      timestamps: false
    });
  }
}

class MetricModelStats extends Model<MetricModelStatsType> {
  declare id: number;
  declare name: string;
  declare is_custom_model: boolean;
  declare total_engaged_users: number;
  declare total_code_acceptances: number;
  declare total_code_suggestions: number;
  declare total_code_lines_accepted: number;
  declare total_code_lines_suggested: number;
  declare editor_id: number;

  static initModel(sequelize: Sequelize) {
    MetricModelStats.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      is_custom_model: DataTypes.BOOLEAN,
      total_engaged_users: DataTypes.INTEGER,
      total_code_acceptances: DataTypes.INTEGER,
      total_code_suggestions: DataTypes.INTEGER,
      total_code_lines_accepted: DataTypes.INTEGER,
      total_code_lines_suggested: DataTypes.INTEGER,
      editor_id: DataTypes.INTEGER
    }, {
      sequelize,
      timestamps: false
    });
  }
}

class MetricLanguageStats extends Model<MetricLanguageStatsType> {
  declare id: number;
  declare name: string;
  declare total_engaged_users: number;
  declare total_code_acceptances: number;
  declare total_code_suggestions: number;
  declare total_code_lines_accepted: number;
  declare total_code_lines_suggested: number;
  declare model_stat_id: number;

  static initModel(sequelize: Sequelize) {
    MetricLanguageStats.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      total_engaged_users: DataTypes.INTEGER,
      total_code_acceptances: DataTypes.INTEGER,
      total_code_suggestions: DataTypes.INTEGER,
      total_code_lines_accepted: DataTypes.INTEGER,
      total_code_lines_suggested: DataTypes.INTEGER,
      model_stat_id: DataTypes.INTEGER
    }, {
      sequelize,
      timestamps: false
    });
  }
}

class MetricPrRepository extends Model<MetricPrRepositoryType> {
  declare id: number;
  declare name: string;
  declare total_engaged_users: number;
  declare total_pr_summaries_created: number;
  declare pr_metrics_id: number;

  static initModel(sequelize: Sequelize) {
    MetricPrRepository.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      total_engaged_users: DataTypes.INTEGER,
      total_pr_summaries_created: DataTypes.INTEGER,
      pr_metrics_id: DataTypes.INTEGER
    }, {
      sequelize,
      timestamps: false
    });
  }
}

class MetricPrModelStats extends Model<MetricPrModelStatsType> {
  declare id: number;
  declare name: string;
  declare is_custom_model: boolean;
  declare total_engaged_users: number;
  declare total_pr_summaries_created: number;
  declare repository_id: number;

  static initModel(sequelize: Sequelize) {
    MetricPrModelStats.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      is_custom_model: DataTypes.BOOLEAN,
      total_engaged_users: DataTypes.INTEGER,
      total_pr_summaries_created: DataTypes.INTEGER,
      repository_id: DataTypes.INTEGER
    }, {
      sequelize,
      timestamps: false
    });
  }
}

class MetricPrMetrics extends Model<MetricPrMetricsType> {
  declare id: number;
  declare total_engaged_users: number;
  declare total_pr_summaries_created: number;
  declare daily_metric_id: Date;

  static initModel(sequelize: Sequelize) {
    MetricPrMetrics.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      total_engaged_users: DataTypes.INTEGER,
      total_pr_summaries_created: DataTypes.INTEGER,
      daily_metric_id: DataTypes.DATE
    }, {
      sequelize,
      timestamps: false
    });
  }
}

class MetricDotcomChatMetrics extends Model<MetricDotcomChatMetricsType> {
  declare id: number;
  declare total_engaged_users: number;
  declare total_chats: number;
  declare daily_metric_id: Date;

  static initModel(sequelize: Sequelize) {
    MetricDotcomChatMetrics.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      total_engaged_users: DataTypes.INTEGER,
      total_chats: DataTypes.INTEGER,
      daily_metric_id: DataTypes.DATE
    }, {
      sequelize,
      timestamps: false
    });
  }
}

class MetricDotcomChatModelStats extends Model<MetricDotcomChatModelStatsType> {
  declare id: number;
  declare name: string;
  declare is_custom_model: boolean;
  declare total_engaged_users: number;
  declare total_chats: number;
  declare chat_metrics_id: number;

  static initModel(sequelize: Sequelize) {
    MetricDotcomChatModelStats.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      is_custom_model: DataTypes.BOOLEAN,
      total_engaged_users: DataTypes.INTEGER,
      total_chats: DataTypes.INTEGER,
      chat_metrics_id: DataTypes.INTEGER
    }, {
      sequelize,
      timestamps: false
    });
  }
}

class MetricIdeChatMetrics extends Model<MetricIdeChatMetricsType> {
  declare id?: number;
  declare total_engaged_users: number;
  declare total_chats: number;
  declare total_chat_copy_events: number;
  declare total_chat_insertion_events: number;
  declare daily_metric_id: Date;

  static initModel(sequelize: Sequelize) {
    MetricIdeChatMetrics.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      total_engaged_users: DataTypes.INTEGER,
      total_chats: DataTypes.INTEGER,
      total_chat_copy_events: DataTypes.INTEGER,
      total_chat_insertion_events: DataTypes.INTEGER,
      daily_metric_id: DataTypes.DATE
    }, {
      sequelize,
      timestamps: false
    });
  }
}

class MetricIdeChatEditor extends Model<MetricIdeChatEditorType> {
  declare id: number;
  declare name: string;
  declare total_engaged_users: number;
  declare total_chats: number;
  declare total_chat_copy_events: number;
  declare total_chat_insertion_events: number;
  declare chat_metrics_id: number;

  static initModel(sequelize: Sequelize) {
    MetricIdeChatEditor.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      total_engaged_users: DataTypes.INTEGER,
      total_chats: DataTypes.INTEGER,
      total_chat_copy_events: DataTypes.INTEGER,
      total_chat_insertion_events: DataTypes.INTEGER,
      chat_metrics_id: DataTypes.INTEGER
    }, {
      sequelize,
      timestamps: false
    });
  }
}

class MetricIdeChatModelStats extends Model<MetricIdeChatModelStatsType> {
  declare id?: number;
  declare name: string;
  declare is_custom_model: boolean;
  declare total_engaged_users: number;
  declare total_chats: number;
  declare total_chat_copy_events: number;
  declare total_chat_insertion_events: number;
  declare editor_id: number;

  static initModel(sequelize: Sequelize) {
    MetricIdeChatModelStats.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      is_custom_model: DataTypes.BOOLEAN,
      total_engaged_users: DataTypes.INTEGER,
      total_chats: DataTypes.INTEGER,
      total_chat_copy_events: DataTypes.INTEGER,
      total_chat_insertion_events: DataTypes.INTEGER,
      editor_id: DataTypes.INTEGER
    }, {
      sequelize,
      timestamps: false
    });
  }
}

export async function insertMetrics(data: CopilotMetrics[]) {
  for (const day of data) {
    const parts = day.date.split('-').map(Number);
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1));
    let metric: MetricDaily;
    try {
      metric = await MetricDaily.create({
        date: date,
        total_active_users: day.total_active_users,
        total_engaged_users: day.total_engaged_users,
      });
      logger.info(`Metrics for ${day.date} inserted successfully! ✅`);
    } catch (error) {
      if (error instanceof BaseError && error.name === 'SequelizeUniqueConstraintError') {
        logger.info(`Metrics for ${day.date} already exist. Skipping... ⏭️`);
      } else {
        logger.error(error);
      }
      continue;
    }

    if (day.copilot_ide_chat) {
      const chatTotals = {
        chats: 0,
        copyEvents: 0,
        insertionEvents: 0
      };

      const chatMetrics = await MetricIdeChatMetrics.create({
        daily_metric_id: metric.date,
        total_engaged_users: day.copilot_ide_chat.total_engaged_users,
        total_chats: 0,
        total_chat_copy_events: 0,
        total_chat_insertion_events: 0
      });

      for (const editor of day.copilot_ide_chat.editors) {
        const chatTotalsEditor = { chats: 0, copyEvents: 0, insertionEvents: 0 };

        const editorRecord = await MetricIdeChatEditor.create({
          chat_metrics_id: (chatMetrics.id || -1),
          name: editor.name,
          total_engaged_users: editor.total_engaged_users,
          total_chats: 0,
          total_chat_copy_events: 0,
          total_chat_insertion_events: 0,
        });

        // Sum up totals for each model in this editor
        for (const model of editor.models) {
          chatTotalsEditor.chats += model.total_chats;
          chatTotalsEditor.copyEvents += model.total_chat_copy_events || 0;
          chatTotalsEditor.insertionEvents += model.total_chat_insertion_events || 0;

          // Add to overall totals
          chatTotals.chats += model.total_chats;
          chatTotals.copyEvents += model.total_chat_copy_events || 0;
          chatTotals.insertionEvents += model.total_chat_insertion_events || 0;

          await MetricIdeChatModelStats.create({
            editor_id: editorRecord.id,
            name: model.name,
            is_custom_model: model.is_custom_model,
            total_engaged_users: model.total_engaged_users,
            total_chats: model.total_chats,
            total_chat_copy_events: model.total_chat_copy_events || 0,
            total_chat_insertion_events: model.total_chat_insertion_events || 0
          });
        }

        await editorRecord.update({
          total_chats: chatTotalsEditor.chats,
          total_chat_copy_events: chatTotalsEditor.copyEvents,
          total_chat_insertion_events: chatTotalsEditor.insertionEvents
        });
      }

      await chatMetrics.update({
        total_chats: chatTotals.chats,
        total_chat_copy_events: chatTotals.copyEvents,
        total_chat_insertion_events: chatTotals.insertionEvents
      });
    }

    if (day.copilot_ide_code_completions) {
      const completions = await MetricIdeCompletions.create({
        total_engaged_users: day.copilot_ide_code_completions.total_engaged_users,
        daily_metric_id: metric.date,
        total_code_acceptances: 0,
        total_code_suggestions: 0,
        total_code_lines_accepted: 0,
        total_code_lines_suggested: 0
      });

      const dailyTotals = { acceptances: 0, suggestions: 0, linesAccepted: 0, linesSuggested: 0 };

      for (const editor of day.copilot_ide_code_completions.editors) {
        const editorRecord = await MetricEditor.create({
          name: editor.name,
          total_engaged_users: editor.total_engaged_users,
          ide_completion_id: completions.id || -1,
          total_code_acceptances: 0,
          total_code_suggestions: 0,
          total_code_lines_accepted: 0,
          total_code_lines_suggested: 0
        });

        const editorTotals = { acceptances: 0, suggestions: 0, linesAccepted: 0, linesSuggested: 0 };

        for (const model of editor.models) {
          const modelRecord = await MetricModelStats.create({
            name: model.name,
            is_custom_model: model.is_custom_model,
            total_engaged_users: model.total_engaged_users,
            editor_id: editorRecord.id || -1,
            total_code_acceptances: 0,
            total_code_suggestions: 0,
            total_code_lines_accepted: 0,
            total_code_lines_suggested: 0
          });

          const modelTotals = { acceptances: 0, suggestions: 0, linesAccepted: 0, linesSuggested: 0 };

          for (const lang of model.languages) {
            await MetricLanguageStats.create({
              name: lang.name,
              total_engaged_users: lang.total_engaged_users,
              total_code_acceptances: lang.total_code_acceptances || 0,
              total_code_suggestions: lang.total_code_suggestions || 0,
              total_code_lines_accepted: lang.total_code_lines_accepted || 0,
              total_code_lines_suggested: lang.total_code_lines_suggested || 0,
              model_stat_id: modelRecord.id
            });

            modelTotals.acceptances += lang.total_code_acceptances || 0;
            modelTotals.suggestions += lang.total_code_suggestions || 0;
            modelTotals.linesAccepted += lang.total_code_lines_accepted || 0;
            modelTotals.linesSuggested += lang.total_code_lines_suggested || 0;
          }

          await modelRecord.update({
            total_code_acceptances: modelTotals.acceptances,
            total_code_suggestions: modelTotals.suggestions,
            total_code_lines_accepted: modelTotals.linesAccepted,
            total_code_lines_suggested: modelTotals.linesSuggested
          });

          editorTotals.acceptances += modelTotals.acceptances;
          editorTotals.suggestions += modelTotals.suggestions;
          editorTotals.linesAccepted += modelTotals.linesAccepted;
          editorTotals.linesSuggested += modelTotals.linesSuggested;
        }

        await editorRecord.update({
          total_code_acceptances: editorTotals.acceptances,
          total_code_suggestions: editorTotals.suggestions,
          total_code_lines_accepted: editorTotals.linesAccepted,
          total_code_lines_suggested: editorTotals.linesSuggested
        });

        dailyTotals.acceptances += editorTotals.acceptances;
        dailyTotals.suggestions += editorTotals.suggestions;
        dailyTotals.linesAccepted += editorTotals.linesAccepted;
        dailyTotals.linesSuggested += editorTotals.linesSuggested;
      }

      await completions.update({
        total_code_acceptances: dailyTotals.acceptances,
        total_code_suggestions: dailyTotals.suggestions,
        total_code_lines_accepted: dailyTotals.linesAccepted,
        total_code_lines_suggested: dailyTotals.linesSuggested
      });
    }

    if (day.copilot_dotcom_pull_requests) {
      let totalPrSummaries = 0;
      const prMetrics = await MetricPrMetrics.create({
        daily_metric_id: metric.date,
        total_engaged_users: day.copilot_dotcom_pull_requests.total_engaged_users,
        total_pr_summaries_created: 0
      });

      if (day.copilot_dotcom_pull_requests.repositories) {
        for (const repo of day.copilot_dotcom_pull_requests.repositories) {
          let totalPrSummariesRepo = 0;
          const repository = await MetricPrRepository.create({
            pr_metrics_id: prMetrics.id,
            name: repo.name,
            total_engaged_users: repo.total_engaged_users,
            total_pr_summaries_created: 0
          });

          await Promise.all(repo.models.map(model => {
            totalPrSummaries += model.total_pr_summaries_created || 0; totalPrSummariesRepo += model.total_pr_summaries_created || 0;

            MetricPrModelStats.create({
              repository_id: repository.id,
              name: model.name,
              is_custom_model: model.is_custom_model,
              total_engaged_users: model.total_engaged_users,
              total_pr_summaries_created: model.total_pr_summaries_created
            })
          }));
          repository.update({
            total_pr_summaries_created: totalPrSummariesRepo
          });
        }
      }

      await prMetrics.update({
        total_pr_summaries_created: totalPrSummaries
      });
    }

    if (day.copilot_dotcom_chat) {
      let totalChats = 0;
      const chatMetrics = await MetricDotcomChatMetrics.create({
        daily_metric_id: metric.date,
        total_engaged_users: day.copilot_dotcom_chat.total_engaged_users,
        total_chats: 0
      });

      await Promise.all(day.copilot_dotcom_chat.models.map(model => {
        totalChats += model.total_chats || 0; MetricDotcomChatModelStats.create({
          chat_metrics_id: chatMetrics.id,
          name: model.name,
          is_custom_model: model.is_custom_model,
          total_engaged_users: model.total_engaged_users,
          total_chats: model.total_chats
        })
      }));

      await chatMetrics.update({
        total_chats: totalChats
      });
    }
  }
}

export {
  MetricDaily,
  MetricIdeCompletions,
  MetricEditor,
  MetricModelStats,
  MetricLanguageStats,
  MetricPrRepository,
  MetricPrModelStats,
  MetricPrMetrics,
  MetricDotcomChatMetrics,
  MetricDotcomChatModelStats,
  MetricIdeChatMetrics,
  MetricIdeChatEditor,
  MetricIdeChatModelStats
};