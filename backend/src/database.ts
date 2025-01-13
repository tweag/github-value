import updateDotenv from 'update-dotenv';
import logger from './services/logger.js';
import mongoose, { Schema } from 'mongoose';
import util from 'util';

class Database {
  mongoose: mongoose.Mongoose | null = null;
  mongodbUri: string;

  constructor(mongodbUri: string) {
    this.mongodbUri = mongodbUri;
  }

  async connect() {
    logger.info('Connecting to the database', this.mongodbUri);
    if (this.mongodbUri) await updateDotenv({ MONGODB_URI: this.mongodbUri });
    try {
      this.mongoose = await mongoose.connect(this.mongodbUri, {
        //useNewUrlParser: true,
        //useUnifiedTopology: true,
        socketTimeoutMS: 90000,      // Set the socket timeout (e.g., 60 seconds)
        connectTimeoutMS: 60000,    // Connection timeout (e.g., 30 seconds)
        serverSelectionTimeoutMS: 30000, // Server selection timeout
      });
    //  this.mongoose.set('debug', false);
      this.mongoose.set('toJSON', (collectionName, methodName, ...methodArgs) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msgMapper = (m: any) => {
          return util.inspect(m, false, 10, true)
            .replace(/\n/g, '').replace(/\s{2,}/g, ' ');
        };
        logger.debug(`\x1B[0;36mMongoose:\x1B[0m: ${collectionName}.${methodName}` + `(${methodArgs.map(msgMapper).join(', ')})`)
      });
      //logger.info('Database setup completed successfully');
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
      timestamps: true,
    });

    // TeamMember Association Schema 🤝
    const teamMemberSchema = new Schema({
      team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
      member: { type: Schema.Types.ObjectId, ref: 'Member', required: true }
    }, {
      timestamps: false
    });

    const counterSchema = new Schema({
      _id: { type: String, required: true }, // Ensure _id is of type String
      seq: { type: Number, default: 0 }
    });

    // Create indexes for faster queries 🔍
    teamMemberSchema.index({ team: 1, member: 1 }, { unique: true });

    // Create models 📦
    mongoose.model('Team', teamSchema);
    mongoose.model('Member', memberSchema);
    mongoose.model('TeamMember', teamMemberSchema);
    mongoose.model('Counter', counterSchema); // Ensure Counter model is registered here
   console.log('Created Counter model');
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
      id: Number,
      userId: String,
      org: String,
      repo: String,
      prNumber: String,
      usedCopilot: Boolean,
      percentTimeSaved: Number,
      reason: String,
      timeUsedFor: String
    }, {
      timestamps: true
    },
  ));
  }
  
  async disconnect() {
    await this.mongoose?.disconnect();
  }

}

export default Database;
