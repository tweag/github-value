// models/daily-metric.ts
import { Model, DataTypes, Sequelize } from 'sequelize';
import { sequelize } from '../database';
import { CopilotMetrics } from './metrics.model.new.interfaces';

// Main metric model 📈
export class DailyMetric extends Model {
  public date!: Date;
  public total_active_users!: number;
  public total_engaged_users!: number;
  public total_code_acceptances!: number;
  public total_code_suggestions!: number;
  public total_code_lines_accepted!: number;
  public total_code_lines_suggested!: number;
}

// IDE Completions model 🖥️
export class IdeCompletions extends Model {
  public id!: number;
  public total_engaged_users!: number;
  public total_code_acceptances!: number;
  public total_code_suggestions!: number;
  public total_code_lines_accepted!: number;
  public total_code_lines_suggested!: number;
  public dailyMetricDate!: Date;
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


// Initialize models
DailyMetric.init({
  date: {
    type: DataTypes.DATEONLY,
    primaryKey: true
  },
  total_active_users: DataTypes.INTEGER,
  total_engaged_users: DataTypes.INTEGER,
  total_code_acceptances: DataTypes.INTEGER,
  total_code_suggestions: DataTypes.INTEGER,
  total_code_lines_accepted: DataTypes.INTEGER,
  total_code_lines_suggested: DataTypes.INTEGER
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

// Set up associations 🔗
DailyMetric.hasOne(IdeCompletions, {
  as: 'copilot_ide_code_completions',  // This matches your response structure
  foreignKey: 'dailyMetricDate',
  sourceKey: 'date'
});
IdeCompletions.belongsTo(DailyMetric, {
  as: 'DailyMetric',
  foreignKey: 'dailyMetricDate',
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

export async function insertDailyMetrics(data: CopilotMetrics[]) {
  for (const day of data) {
    const date = new Date(day.date);
    // Create DailyMetric first 📅
    const metric = await DailyMetric.create({
      date: date,
      total_active_users: day.total_active_users,
      total_engaged_users: day.total_engaged_users,
      total_code_acceptances: 0,
      total_code_suggestions: 0,
      total_code_lines_accepted: 0,
      total_code_lines_suggested: 0
    });

    if (day.copilot_ide_code_completions) {
      // Create IdeCompletions second 🖥️
      const completions = await IdeCompletions.create({
        total_engaged_users: day.copilot_ide_code_completions.total_engaged_users,
        dailyMetricDate: date,
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

      await metric.update({
        total_code_acceptances: dailyTotals.acceptances,
        total_code_suggestions: dailyTotals.suggestions,
        total_code_lines_accepted: dailyTotals.linesAccepted,
        total_code_lines_suggested: dailyTotals.linesSuggested
      });
    }
  }
}