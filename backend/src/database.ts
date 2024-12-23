import { Options, Sequelize } from 'sequelize';
import mysql2 from 'mysql2/promise';
import updateDotenv from 'update-dotenv';
import logger from './services/logger.js';
import { TargetValues } from './models/target-values.model.js';
import { Settings } from './models/settings.model.js';
import { Usage } from './models/usage.model.js';
import { Seat } from './models/copilot.seats.model.js';
import { Team } from './models/teams.model.js';
import { MetricDaily } from './models/metrics.model.js';
import { Survey } from './models/survey.model.js';
import mongoose, { mongo, Schema } from 'mongoose';

// CACHE
// https://github.com/sequelize-transparent-cache/sequelize-transparent-cache?tab=readme-ov-file

class Database {
  mongoose: mongoose.Mongoose | null = null;
  options: Options = {
    dialect: 'mysql',
    logging: (sql) => logger.debug(sql),
    timezone: '+00:00', // Force UTC timezone
    dialectOptions: {
      timezone: '+00:00' // Force UTC for MySQL connection
    },
  }
  input: string | Options;

  constructor(input: string | Options) {
    this.input = input;
  }

  async connect(options?: Options) {
    this.input = options || this.input;
    if (typeof this.input !== 'string') {
      if (this.input.host) await updateDotenv({ MYSQL_HOST: this.input.host })
      if (this.input.port) await updateDotenv({ MYSQL_PORT: String(this.input.port) })
      if (this.input.username) await updateDotenv({ MYSQL_USER: this.input.username })
      if (this.input.password) await updateDotenv({ MYSQL_PASSWORD: this.input.password })
      if (this.input.database) await updateDotenv({ MYSQL_DATABASE: this.input.database })
    }
    logger.info('Connecting to the database', this.input);
    try {
      this.mongoose = await mongoose.connect('mongodb://root:octocat@localhost:27017/');
      logger.info('Database setup completed successfully');
    } catch (error) {
      logger.debug(error);
      if (error instanceof Error) {
        logger.error(error.message);
      }
      throw error;
    }
    mongoose.model('Settings', new mongoose.Schema({
      name: String,
      value: String
    }));
    mongoose.model('Usage', new mongoose.Schema({
      org: String,
      team: String,
      day: Date,
      total_suggestions_count: Number,
      total_acceptances_count: Number,
      total_lines_suggested: Number,
      total_lines_accepted: Number,
      total_active_users: Number,
      total_chat_acceptances: Number,
      total_chat_turns: Number,
      total_active_chat_users: Number,
      breakdown: [{
        language: String,
        editor: String,
        suggestions_count: Number,
        acceptances_count: Number,
        lines_suggested: Number,
        lines_accepted: Number,
        active_users: Number
      }]
    }));

    // Language Schema 📝
    const LanguageSchema = new mongoose.Schema({
      name: String,
      total_engaged_users: Number,
      total_code_acceptances: Number,
      total_code_suggestions: Number,
      total_code_lines_accepted: Number,
      total_code_lines_suggested: Number
    });

    // Model Schema 🤖
    const ModelSchema = new mongoose.Schema({
      name: String,
      is_custom_model: Boolean,
      total_engaged_users: Number,
      total_code_acceptances: Number,
      total_code_suggestions: Number,
      total_code_lines_accepted: Number,
      total_code_lines_suggested: Number,
      languages: [LanguageSchema],
      total_chats: Number,
      total_chat_copy_events: Number,
      total_chat_insertion_events: Number,
      total_pr_summaries_created: Number
    });

    // Editor Schema 🖥️
    const EditorSchema = new mongoose.Schema({
      name: String,
      total_engaged_users: Number,
      total_code_acceptances: Number,
      total_code_suggestions: Number,
      total_code_lines_accepted: Number,
      total_code_lines_suggested: Number,
      models: [ModelSchema],
      total_chats: Number,
      total_chat_copy_events: Number,
      total_chat_insertion_events: Number
    });

    // Repository Schema 📚
    const RepositorySchema = new mongoose.Schema({
      name: String,
      total_engaged_users: Number,
      total_pr_summaries_created: Number,
      models: [ModelSchema]
    });

    mongoose.model('Metrics', new mongoose.Schema({
      org: String,
      team: String,
      date: Date,
      total_active_users: Number,
      total_engaged_users: Number,

      copilot_ide_code_completions: {
        total_engaged_users: Number,
        total_code_acceptances: Number,
        total_code_suggestions: Number,
        total_code_lines_accepted: Number,
        total_code_lines_suggested: Number,
        editors: [EditorSchema]
      },
      copilot_ide_chat: {
        total_engaged_users: Number,
        total_chats: Number,
        total_chat_copy_events: Number,
        total_chat_insertion_events: Number,
        editors: [EditorSchema]
      },
      copilot_dotcom_chat: {
        total_engaged_users: Number,
        total_chats: Number,
        models: [ModelSchema]
      },
      copilot_dotcom_pull_requests: {
        total_engaged_users: Number,
        total_pr_summaries_created: Number,
        repositories: [RepositorySchema]
      }
    }));
    // Team Schema 🏢
    const teamSchema = new Schema({
      org: { type: String, required: true },
      team: String,
      githubId: { type: Number, required: true, unique: true }, // renamed from id
      node_id: String,
      name: String,
      slug: String,
      description: String,
      privacy: String,
      notification_setting: String,
      permission: String,
      url: String,
      html_url: String,
      members_url: String,
      repositories_url: String,
      parent: { type: Schema.Types.ObjectId, ref: 'Team' }
    }, {
      timestamps: true
    });

    // Member Schema 👥
    const memberSchema = new Schema({
      org: { type: String, required: true },
      login: { type: String, required: true },
      id: { type: Number, required: true, unique: true }, // renamed from id
      node_id: String,
      avatar_url: String,
      gravatar_id: String,
      url: String,
      html_url: String,
      followers_url: String,
      following_url: String,
      gists_url: String,
      starred_url: String,
      subscriptions_url: String,
      organizations_url: String,
      repos_url: String,
      events_url: String,
      received_events_url: String,
      type: String,
      site_admin: Boolean,
      name: String,
      email: String,
      starred_at: String,
      user_view_type: String,
      activity: [{ type: Schema.Types.ObjectId, ref: 'Seats' }]
    }, {
      timestamps: true
    });

    // TeamMember Association Schema 🤝
    const teamMemberSchema = new Schema({
      team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
      member: { type: Schema.Types.ObjectId, ref: 'Member', required: true }
    }, {
      timestamps: false
    });

    // Create indexes for faster queries 🔍
    teamMemberSchema.index({ team: 1, member: 1 }, { unique: true });

    // Create models 📦
    mongoose.model('Team', teamSchema);
    mongoose.model('Member', memberSchema);
    mongoose.model('TeamMember', teamMemberSchema);

    mongoose.model('Seats', new mongoose.Schema({
      org: String,
      team: String,
      assigning_team_id: Number,
      plan_type: String,
      last_activity_at: Date,
      last_activity_editor: String,
      queryAt: Date,
      assignee_id: Number,
      assignee: {
        type: Schema.Types.ObjectId,
        ref: 'Member'
      },
    }, {
      timestamps: true
    }));

    mongoose.model('Survey', new mongoose.Schema({
      org: String,
      team: String,
      user: String,
      used_copilot: Boolean,
      percent_time_saved: Number,
      reason: String,
      time_used_for: String,
      repo: String,
      pr_number: Number,
      kudos: Number,
      queryAt: Date
    }, {
      timestamps: true
    }));
  }

  async disconnect() {
    await this.mongoose?.disconnect();
  }

  initializeModels(sequelize: Sequelize) {
    Settings.initModel(sequelize);
    Team.initModel(sequelize);
    Seat.initModel(sequelize);
    Survey.initModel(sequelize);
    Usage.initModel(sequelize);
    MetricDaily.initModel(sequelize);
    TargetValues.initModel(sequelize);
  }

}

export default Database;
