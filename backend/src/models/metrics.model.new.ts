// models/daily-metric.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../database';
import { ChatModel, CopilotMetrics } from './metrics.model.new.interfaces';
import logger from '../services/logger';

// Main metric model 📈
export class DailyMetric extends Model {
  public date!: Date;
  public total_active_users!: number;
  public total_engaged_users!: number;
}

// IDE Completions model 🖥️
export class IdeCompletions extends Model {
  public id!: number;
  public total_engaged_users!: number;
  public total_code_acceptances!: number;
  public total_code_suggestions!: number;
  public total_code_lines_accepted!: number;
  public total_code_lines_suggested!: number;
  public daily_metric_id!: Date;
}
export class Editor extends Model {
  public id!: number;
  public name!: string;
  public total_engaged_users!: number;
  public total_code_acceptances!: number;
  public total_code_suggestions!: number;
  public total_code_lines_accepted!: number;
  public total_code_lines_suggested!: number;
  public ideCompletionId!: number;
}
export class ModelStats extends Model {
  public id!: number;
  public name!: string;
  public is_custom_model!: boolean;
  public total_engaged_users!: number;
  public total_code_acceptances!: number;
  public total_code_suggestions!: number;
  public total_code_lines_accepted!: number;
  public total_code_lines_suggested!: number;
  public editorId!: number;
}
export class LanguageStats extends Model {
  public id!: number;
  public name!: string;
  public total_engaged_users!: number;
  public total_code_acceptances!: number;
  public total_code_suggestions!: number;
  public total_code_lines_accepted!: number;
  public total_code_lines_suggested!: number;
  public modelStatId!: number;
}

// PR Repository Model 🏢
export class PrRepository extends Model {
  public id!: number;
  public name!: string;
  public total_engaged_users!: number;
  public total_pr_summaries_created!: number;
}
export class PrModelStats extends Model {
  public id!: number;
  public name!: string;
  public is_custom_model!: boolean;
  public total_engaged_users!: number;
  public total_pr_summaries_created!: number;
}
export class PrMetrics extends Model {
  public id!: number;
  public total_engaged_users!: number;
  public total_pr_summaries_created!: number;
}

// Chat Model 💬
export class DotcomChatMetrics extends Model {
  public id!: number;
  public total_engaged_users!: number;
  public total_chats!: number;
}
export class DotcomChatModelStats extends Model {
  public id!: number;
  public name!: string;
  public is_custom_model!: boolean;
  public total_engaged_users!: number;
  public total_chats!: number;
}
export class IdeChatMetrics extends Model {
  public id!: number;
  public total_engaged_users!: number;
  public total_chats!: number;
  public total_chat_copy_events!: number;
  public total_chat_insertion_events!: number;
}
export class IdeChatEditor extends Model {
  public id!: number;
  public name!: string;
  public total_engaged_users!: number;
  public total_chats!: number;
  public total_chat_copy_events!: number;
  public total_chat_insertion_events!: number;
}
export class IdeChatModelStats extends Model {
  public id!: number;
  public name!: string;
  public is_custom_model!: boolean;
  public total_engaged_users!: number;
  public total_chats!: number;
  public total_chat_copy_events!: number;
  public total_chat_insertion_events!: number;
}

// Initialize models
DailyMetric.init({
  date: {
    type: DataTypes.DATEONLY,
    primaryKey: true
  },
  total_active_users: DataTypes.INTEGER,
  total_engaged_users: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});

IdeChatMetrics.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  total_engaged_users: DataTypes.INTEGER,
  total_chats: DataTypes.INTEGER,
  total_chat_copy_events: DataTypes.INTEGER,
  total_chat_insertion_events: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});
IdeChatEditor.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  total_engaged_users: DataTypes.INTEGER,
  total_chats: DataTypes.INTEGER,
  total_chat_copy_events: DataTypes.INTEGER,
  total_chat_insertion_events: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});
IdeChatModelStats.init({
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
  total_chat_insertion_events: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});

IdeCompletions.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  total_engaged_users: DataTypes.INTEGER,
  total_code_acceptances: DataTypes.INTEGER,
  total_code_suggestions: DataTypes.INTEGER,
  total_code_lines_accepted: DataTypes.INTEGER,
  total_code_lines_suggested: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});
Editor.init({
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
  total_code_lines_suggested: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});
ModelStats.init({
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
  total_code_lines_suggested: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});
LanguageStats.init({
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
  total_code_lines_suggested: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});

PrMetrics.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  total_engaged_users: DataTypes.INTEGER,
  total_pr_summaries_created: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});
PrRepository.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  total_engaged_users: DataTypes.INTEGER,
  total_pr_summaries_created: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});
PrModelStats.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  is_custom_model: DataTypes.BOOLEAN,
  total_engaged_users: DataTypes.INTEGER,
  total_pr_summaries_created: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});

DotcomChatMetrics.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  total_engaged_users: DataTypes.INTEGER,
  total_chats: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});
DotcomChatModelStats.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  is_custom_model: DataTypes.BOOLEAN,
  total_engaged_users: DataTypes.INTEGER,
  total_chats: DataTypes.INTEGER
}, {
  sequelize,
  timestamps: false
});

// Set up associations 🔗
DailyMetric.hasOne(IdeCompletions, {
  as: 'copilot_ide_code_completions',  // This matches your response structure
  foreignKey: 'daily_metric_id',
  sourceKey: 'date'
});
DailyMetric.hasOne(PrMetrics, {
  as: 'copilot_dotcom_pull_requests',
  foreignKey: 'daily_metric_id'
});
DailyMetric.hasOne(DotcomChatMetrics, {
  as: 'copilot_dotcom_chat',
  foreignKey: 'daily_metric_id'
});
DailyMetric.hasOne(IdeChatMetrics, {
  as: 'copilot_ide_chat',
  foreignKey: 'daily_metric_id'
});

IdeChatMetrics.belongsTo(DailyMetric, {
  foreignKey: 'daily_metric_id'
});
IdeChatMetrics.hasMany(IdeChatEditor, {
  as: 'editors',
  foreignKey: 'chat_metrics_id'
});
IdeChatEditor.belongsTo(IdeChatMetrics, {
  foreignKey: 'chat_metrics_id'
});
IdeChatEditor.hasMany(IdeChatModelStats, {
  as: 'models',
  foreignKey: 'editor_id'
});
IdeChatModelStats.belongsTo(IdeChatEditor, {
  foreignKey: 'editor_id'
});

IdeCompletions.belongsTo(DailyMetric, {
  as: 'DailyMetric',
  foreignKey: 'daily_metric_id',
  targetKey: 'date'
});
IdeCompletions.hasMany(Editor, {
  as: 'editors',  // Match the response structure
  foreignKey: 'ideCompletionId'
});
Editor.belongsTo(IdeCompletions, {
  as: 'copilot_ide_code_completions',
  foreignKey: 'ideCompletionId'
});
Editor.hasMany(ModelStats, {
  as: 'models',  // Match API response structure
  foreignKey: 'editorId'  // Use consistent casing
});
ModelStats.belongsTo(Editor, {
  as: 'editor',
  foreignKey: 'editorId'  // Match the foreign key name
});
ModelStats.hasMany(LanguageStats, {
  as: 'languages',
  foreignKey: 'modelStatId'
});
LanguageStats.belongsTo(ModelStats, {
  as: 'model',
  foreignKey: 'modelStatId'
});

PrMetrics.belongsTo(DailyMetric, {
  foreignKey: 'daily_metric_id',
  targetKey: 'date'
});
PrMetrics.hasMany(PrRepository, {
  as: 'repositories',
  foreignKey: 'pr_metrics_id'
});
PrRepository.belongsTo(PrMetrics, {
  foreignKey: 'pr_metrics_id'
});
PrRepository.hasMany(PrModelStats, {
  as: 'models',
  foreignKey: 'repository_id'
});
PrModelStats.belongsTo(PrRepository, {
  foreignKey: 'repository_id'
});

DotcomChatMetrics.belongsTo(DailyMetric, {
  foreignKey: 'daily_metric_id',
  targetKey: 'date'
});
DotcomChatMetrics.hasMany(DotcomChatModelStats, {
  as: 'models',
  foreignKey: 'chat_metrics_id'
});
DotcomChatModelStats.belongsTo(DotcomChatMetrics, {
  foreignKey: 'chat_metrics_id'
});

export async function insertDailyMetrics(data: CopilotMetrics[]) {
  for (const day of data) {
    const date = new Date(day.date);
    let metric: DailyMetric;
    try {
      metric = await DailyMetric.create({
        date: date,
        total_active_users: day.total_active_users,
        total_engaged_users: day.total_engaged_users,
      });
    } catch {
      logger.info(`Metrics for ${date.toLocaleDateString()} already exist. Skipping...`);
      continue;
    }

    if (day.copilot_ide_chat) {
      let chatTotals = {
        chats: 0,
        copyEvents: 0,
        insertionEvents: 0
      };

      const chatMetrics = await IdeChatMetrics.create({
        daily_metric_id: metric.date,
        total_engaged_users: day.copilot_ide_chat.total_engaged_users
      });

      for (const editor of day.copilot_ide_chat.editors) {
        let chatTotalsEditor = {
          chats: 0,
          copyEvents: 0,
          insertionEvents: 0
        };
        const editorRecord = await IdeChatEditor.create({
          chat_metrics_id: chatMetrics.id,
          name: editor.name,
          total_engaged_users: editor.total_engaged_users
        });

        await Promise.all(editor.models.map(model => {
          if ('total_chats' in model) {
            chatTotals.chats += model.total_chats || 0;
            chatTotals.copyEvents += model.total_chat_copy_events || 0;
            chatTotals.insertionEvents += model.total_chat_insertion_events || 0;

            return IdeChatModelStats.create({
              editor_id: editorRecord.id,
              name: model.name,
              is_custom_model: model.is_custom_model,
              total_engaged_users: model.total_engaged_users,
              total_chats: model.total_chats,
              total_chat_copy_events: model.total_chat_copy_events,
              total_chat_insertion_events: model.total_chat_insertion_events
            })
          }
        }));

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
      // Create IdeCompletions second 🖥️
      const completions = await IdeCompletions.create({
        total_engaged_users: day.copilot_ide_code_completions.total_engaged_users,
        daily_metric_id: metric.date,
        total_code_acceptances: 0,
        total_code_suggestions: 0,
        total_code_lines_accepted: 0,
        total_code_lines_suggested: 0
      });

      let dailyTotals = { acceptances: 0, suggestions: 0, linesAccepted: 0, linesSuggested: 0 };

      // Process editors third 👨‍💻
      for (const editor of day.copilot_ide_code_completions.editors) {
        const editorRecord = await Editor.create({
          name: editor.name,
          total_engaged_users: editor.total_engaged_users,
          ideCompletionId: completions.id,
          total_code_acceptances: 0,
          total_code_suggestions: 0,
          total_code_lines_accepted: 0,
          total_code_lines_suggested: 0
        });

        let editorTotals = { acceptances: 0, suggestions: 0, linesAccepted: 0, linesSuggested: 0 };

        // Process models fourth 🤖
        for (const model of editor.models) {
          const modelRecord = await ModelStats.create({
            name: model.name,
            is_custom_model: model.is_custom_model,
            total_engaged_users: model.total_engaged_users,
            editorId: editorRecord.id,
            total_code_acceptances: 0,
            total_code_suggestions: 0,
            total_code_lines_accepted: 0,
            total_code_lines_suggested: 0
          });

          let modelTotals = { acceptances: 0, suggestions: 0, linesAccepted: 0, linesSuggested: 0 };

          // Process languages last 🗣️
          if ('languages' in model) {
            for (const lang of model.languages) {
              await LanguageStats.create({
                name: lang.name,
                total_engaged_users: lang.total_engaged_users,
                total_code_acceptances: lang.total_code_acceptances,
                total_code_suggestions: lang.total_code_suggestions,
                total_code_lines_accepted: lang.total_code_lines_accepted,
                total_code_lines_suggested: lang.total_code_lines_suggested,
                modelStatId: modelRecord.id
              });

              // Roll up language totals to model 📈
              modelTotals.acceptances += lang.total_code_acceptances || 0;
              modelTotals.suggestions += lang.total_code_suggestions || 0;
              modelTotals.linesAccepted += lang.total_code_lines_accepted || 0;
              modelTotals.linesSuggested += lang.total_code_lines_suggested || 0;
            }
          }

          // Update model with totals ⬆️
          await modelRecord.update({
            total_code_acceptances: modelTotals.acceptances,
            total_code_suggestions: modelTotals.suggestions,
            total_code_lines_accepted: modelTotals.linesAccepted,
            total_code_lines_suggested: modelTotals.linesSuggested
          });

          // Roll up model totals to editor 📊
          editorTotals.acceptances += modelTotals.acceptances;
          editorTotals.suggestions += modelTotals.suggestions;
          editorTotals.linesAccepted += modelTotals.linesAccepted;
          editorTotals.linesSuggested += modelTotals.linesSuggested;
        }

        // Update editor with totals ⬆️
        await editorRecord.update({
          total_code_acceptances: editorTotals.acceptances,
          total_code_suggestions: editorTotals.suggestions,
          total_code_lines_accepted: editorTotals.linesAccepted,
          total_code_lines_suggested: editorTotals.linesSuggested
        });

        // Roll up editor totals to daily 📅
        dailyTotals.acceptances += editorTotals.acceptances;
        dailyTotals.suggestions += editorTotals.suggestions;
        dailyTotals.linesAccepted += editorTotals.linesAccepted;
        dailyTotals.linesSuggested += editorTotals.linesSuggested;
      }

      // Update final totals ⬆️
      await completions.update({
        total_code_acceptances: dailyTotals.acceptances,
        total_code_suggestions: dailyTotals.suggestions,
        total_code_lines_accepted: dailyTotals.linesAccepted,
        total_code_lines_suggested: dailyTotals.linesSuggested
      });
    }

    if (day.copilot_dotcom_pull_requests) {
      let totalPrSummaries = 0;  // Initialize counter 🔢

      const prMetrics = await PrMetrics.create({
        daily_metric_id: metric.date,
        total_engaged_users: day.copilot_dotcom_pull_requests.total_engaged_users
      });

      // Create repositories and their models
      for (const repo of day.copilot_dotcom_pull_requests.repositories) {
        let totalPrSummariesRepo = 0;
        const repository = await PrRepository.create({
          pr_metrics_id: prMetrics.id,
          name: repo.name,
          total_engaged_users: repo.total_engaged_users
        });

        // Create model stats for each repository
        await Promise.all(repo.models.map(model => {
          totalPrSummaries += model.total_pr_summaries_created || 0;  // Add to running total ➕
          totalPrSummariesRepo += model.total_pr_summaries_created || 0;

          PrModelStats.create({
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

      await prMetrics.update({
        total_pr_summaries_created: totalPrSummaries
      });
    }

    if (day.copilot_dotcom_chat) {
      let totalChats = 0;  // Initialize counter 🔢

      const chatMetrics = await DotcomChatMetrics.create({
        daily_metric_id: metric.date,
        total_engaged_users: day.copilot_dotcom_chat.total_engaged_users
      });

      // Create chat model stats
      await Promise.all(day.copilot_dotcom_chat.models.map(model => {
        totalChats += model.total_chats || 0;  // Add to running total ➕
        DotcomChatModelStats.create({
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