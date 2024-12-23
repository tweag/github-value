import { BaseError, Op } from "sequelize";
import logger from "./logger.js";
import { MetricDaily, MetricDailyResponseType, MetricDotcomChatMetrics, MetricDotcomChatModelStats, MetricEditor, MetricIdeChatEditor, MetricIdeChatMetrics, MetricIdeChatModelStats, MetricIdeCompletions, MetricLanguageStats, MetricModelStats, MetricPrMetrics, MetricPrModelStats, MetricPrRepository } from "../models/metrics.model.js";
import mongoose from "mongoose";

export interface MetricsQueryParams {
  type?: string,
  since?: string,
  until?: string,
  editor?: string,
  language?: string,
  model?: string
  org?: string
};

class MetricsService {
  async getMetrics(params: MetricsQueryParams) {
    const { org, type, since, until, editor, language, model } = params;
    // consider the fact that these are UTC dates...
    const dateFilter = {
      ...(since && { [Op.gte]: new Date(since as string) }),
      ...(until && { [Op.lte]: new Date(until as string) })
    };
    const where = {
      ...(org ? { org } : {}),
      ...Object.getOwnPropertySymbols(dateFilter).length ? { date: dateFilter } : {}
    }

    const Metrics = mongoose.model('Metrics');
    return await Metrics.find({
      ...org ? { org } : {},
    })

    const types = type ? (type as string).split(/[ ,]+/) : [];
    const findAlls = {} as {
      copilot_ide_code_completions: Promise<MetricDaily[]>,
      copilot_ide_chat: Promise<MetricDaily[]>,
      copilot_dotcom_chat: Promise<MetricDaily[]>,
      copilot_dotcom_pull_requests: Promise<MetricDaily[]>,
    }
    if (types.length === 0 || types.includes('copilot_ide_code_completions')) {
      findAlls.copilot_ide_code_completions = MetricDaily.findAll({
        where,
        include: {
          attributes: { exclude: ['id', 'daily_metric_id'] },
          model: MetricIdeCompletions,
          as: 'copilot_ide_code_completions',
          include: [{
            attributes: { exclude: ['id', 'ide_completion_id'] },
            model: MetricEditor,
            as: 'editors',
            where: editor ? { name: editor } : {},
            required: true,
            include: [{
              attributes: { exclude: ['id', 'editor_id'] },
              model: MetricModelStats,
              as: 'models',
              where: model ? { name: model } : {},
              required: true,
              include: [{
                attributes: { exclude: ['id', 'model_stat_id'] },
                model: MetricLanguageStats,
                as: 'languages',
                where: language ? { name: language } : {},
                required: true,
              }]
            }]
          }]
        }
      })
    }
    if (types.length === 0 || types.includes('copilot_ide_chat')) {
      findAlls.copilot_ide_chat =
        MetricDaily.findAll({
          where,
          include: {
            attributes: { exclude: ['id', 'daily_metric_id'] },
            model: MetricIdeChatMetrics,
            as: 'copilot_ide_chat',
            required: true,
            include: [{
              attributes: { exclude: ['id', 'chat_metrics_id'] },
              model: MetricIdeChatEditor,
              as: 'editors',
              where: editor ? { name: editor } : {},
              required: true,
              include: [{
                attributes: { exclude: ['id', 'editor_id'] },
                model: MetricIdeChatModelStats,
                as: 'models',
                where: model ? { name: model } : {},
                required: true,
              }]
            }]
          }
        })
    }
    if (types.length === 0 || types.includes('copilot_dotcom_chat')) {
      findAlls.copilot_dotcom_chat =
        MetricDaily.findAll({
          where,
          include: {
            attributes: { exclude: ['id', 'daily_metric_id'] },
            model: MetricDotcomChatMetrics,
            as: 'copilot_dotcom_chat',
            include: [{
              attributes: { exclude: ['id', 'chat_metrics_id'] },
              model: MetricDotcomChatModelStats,
              as: 'models',
              where: model ? { name: model } : {},
              required: false,
            }]
          }
        })
    }
    if (types.length === 0 || types.includes('copilot_dotcom_pull_requests')) {
      findAlls.copilot_dotcom_pull_requests =
        MetricDaily.findAll({
          where,
          include: {
            attributes: { exclude: ['id', 'daily_metric_id'] },
            model: MetricPrMetrics,
            as: 'copilot_dotcom_pull_requests',
            include: [{
              attributes: { exclude: ['id', 'pr_metrics_id'] },
              model: MetricPrRepository,
              as: 'repositories',
              include: [{
                attributes: { exclude: ['id', 'repository_id'] },
                model: MetricPrModelStats,
                as: 'models',
                where: model ? { name: model } : {},
                required: false,
              }]
            }]
          }
        })
    }

    const rsps = await Promise.all([
      findAlls.copilot_ide_code_completions,
      findAlls.copilot_ide_chat,
      findAlls.copilot_dotcom_chat,
      findAlls.copilot_dotcom_pull_requests
    ]);

    const result = rsps[0] as MetricDaily[]
    rsps[1].reduce((acc, val, i) => {
      if (val.copilot_ide_chat) acc[i].setDataValue('copilot_ide_chat', val.copilot_ide_chat);
      return acc;
    }, result);
    rsps[2].reduce((acc, val, i) => {
      if (val.copilot_dotcom_chat) acc[i].setDataValue('copilot_dotcom_chat', val.copilot_dotcom_chat);
      return acc;
    }, result);
    rsps[3].reduce((acc, val, i) => {
      if (val.copilot_dotcom_pull_requests) acc[i].setDataValue('copilot_dotcom_pull_requests', val.copilot_dotcom_pull_requests);
      return acc;
    }, result);

    return result;
  }

  async getMetricsTotals(params: MetricsQueryParams) {
    const metrics = await this.getMetrics(params);

    // Initialize aggregated totals
    const periodMetrics = {
      since: metrics[0]?.date,
      until: metrics[metrics.length - 1]?.date,
      copilot_ide_code_completions: {
        total_code_acceptances: 0,
        total_code_suggestions: 0,
        total_code_lines_accepted: 0,
        total_code_lines_suggested: 0,
        editors: [] as {
          name: string,
          total_code_acceptances: number,
          total_code_suggestions: number,
          total_code_lines_accepted: number,
          total_code_lines_suggested: number,
          models: {
            name: string,
            total_code_acceptances: number,
            total_code_suggestions: number,
            total_code_lines_accepted: number,
            total_code_lines_suggested: number,
            languages: {
              name: string,
              total_code_acceptances: number,
              total_code_suggestions: number,
              total_code_lines_accepted: number,
              total_code_lines_suggested: number
            }[]
          }[]
        }[],
      },
      copilot_ide_chat: {
        total_chats: 0,
        total_chat_copy_events: 0,
        total_chat_insertion_events: 0,
        editors: [] as {
          name: string,
          total_chats: number,
          total_chat_copy_events: number,
          total_chat_insertion_events: number,
          models: {
            name: string,
            total_chats: number,
            total_chat_copy_events: number,
            total_chat_insertion_events: number
          }[]
        }[],
      },
      copilot_dotcom_chat: {
        total_chats: 0,
        models: [] as {
          name: string,
          total_chats: number
        }[],
      },
      copilot_dotcom_pull_requests: {
        total_pr_summaries_created: 0,
        repositories: [] as {
          name: string,
          total_pr_summaries_created: number,
          models: {
            name: string,
            total_pr_summaries_created: number
          }[]
        }[],
      }
    };

    metrics.forEach(daily => {
      if (daily.copilot_ide_code_completions) {
        periodMetrics.copilot_ide_code_completions.total_code_acceptances += daily.copilot_ide_code_completions.total_code_acceptances || 0;
        periodMetrics.copilot_ide_code_completions.total_code_suggestions += daily.copilot_ide_code_completions.total_code_suggestions || 0;
        periodMetrics.copilot_ide_code_completions.total_code_lines_accepted += daily.copilot_ide_code_completions.total_code_lines_accepted || 0;
        periodMetrics.copilot_ide_code_completions.total_code_lines_suggested += daily.copilot_ide_code_completions.total_code_lines_suggested || 0;
        daily.copilot_ide_code_completions.editors?.forEach(editor => {
          let editorTotals = periodMetrics.copilot_ide_code_completions.editors.find(e => e.name === editor.name);
          if (editorTotals) {
            editorTotals.total_code_acceptances += editor.total_code_acceptances || 0;
            editorTotals.total_code_suggestions += editor.total_code_suggestions || 0;
            editorTotals.total_code_lines_accepted += editor.total_code_lines_accepted || 0;
            editorTotals.total_code_lines_suggested += editor.total_code_lines_suggested || 0;
          } else {
            editorTotals = {
              name: editor.name,
              total_code_acceptances: editor.total_code_acceptances,
              total_code_suggestions: editor.total_code_suggestions,
              total_code_lines_accepted: editor.total_code_lines_accepted,
              total_code_lines_suggested: editor.total_code_lines_suggested,
              models: []
            }
            periodMetrics.copilot_ide_code_completions.editors.push(editorTotals);
          }
          editor.models?.forEach(model => {
            let editorModelTotals = editorTotals?.models.find(m => m.name === model.name);
            if (editorModelTotals) {
              editorModelTotals.total_code_acceptances += model.total_code_acceptances || 0;
              editorModelTotals.total_code_suggestions += model.total_code_suggestions || 0;
              editorModelTotals.total_code_lines_accepted += model.total_code_lines_accepted || 0;
              editorModelTotals.total_code_lines_suggested += model.total_code_lines_suggested || 0;
            } else {
              editorModelTotals = {
                name: model.name,
                total_code_acceptances: model.total_code_acceptances,
                total_code_suggestions: model.total_code_suggestions,
                total_code_lines_accepted: model.total_code_lines_accepted,
                total_code_lines_suggested: model.total_code_lines_suggested,
                languages: []
              }
              editorTotals?.models.push(editorModelTotals);
            }
            model.languages?.forEach(language => {
              let modelLanguageTotals = editorModelTotals?.languages.find(l => l.name === language.name);
              if (modelLanguageTotals) {
                modelLanguageTotals.total_code_acceptances += language.total_code_acceptances || 0;
                modelLanguageTotals.total_code_suggestions += language.total_code_suggestions || 0;
                modelLanguageTotals.total_code_lines_accepted += language.total_code_lines_accepted || 0;
                modelLanguageTotals.total_code_lines_suggested += language.total_code_lines_suggested || 0;
              } else {
                modelLanguageTotals = {
                  name: language.name,
                  total_code_acceptances: language.total_code_acceptances,
                  total_code_suggestions: language.total_code_suggestions,
                  total_code_lines_accepted: language.total_code_lines_accepted,
                  total_code_lines_suggested: language.total_code_lines_suggested
                }
                editorModelTotals?.languages.push(modelLanguageTotals);
              }
            });
          });
        });
      }

      if (daily.copilot_ide_chat) {
        periodMetrics.copilot_ide_chat.total_chats += daily.copilot_ide_chat.total_chats || 0;
        periodMetrics.copilot_ide_chat.total_chat_copy_events += daily.copilot_ide_chat.total_chat_copy_events || 0;
        periodMetrics.copilot_ide_chat.total_chat_insertion_events += daily.copilot_ide_chat.total_chat_insertion_events || 0;
        daily.copilot_ide_chat.editors?.forEach(editor => {
          let editorTotals = periodMetrics.copilot_ide_chat.editors.find(e => e.name === editor.name);
          if (editorTotals) {
            editorTotals.total_chats += editor.total_chats || 0;
            editorTotals.total_chat_copy_events += editor.total_chat_copy_events || 0;
            editorTotals.total_chat_insertion_events += editor.total_chat_insertion_events || 0;
          } else {
            editorTotals = {
              name: editor.name,
              total_chats: editor.total_chats,
              total_chat_copy_events: editor.total_chat_copy_events,
              total_chat_insertion_events: editor.total_chat_insertion_events,
              models: []
            }
            periodMetrics.copilot_ide_chat.editors.push(editorTotals);
          }
          editor.models?.forEach(model => {
            let editorModelTotals = editorTotals?.models.find(m => m.name === model.name);
            if (editorModelTotals) {
              editorModelTotals.total_chats += model.total_chats || 0;
              editorModelTotals.total_chat_copy_events += model.total_chat_copy_events || 0;
              editorModelTotals.total_chat_insertion_events += model.total_chat_insertion_events || 0;
            } else {
              editorModelTotals = {
                name: model.name,
                total_chats: model.total_chats,
                total_chat_copy_events: model.total_chat_copy_events,
                total_chat_insertion_events: model.total_chat_insertion_events
              }
              editorTotals?.models.push(editorModelTotals);
            }
          });
        });
      }

      if (daily.copilot_dotcom_chat) {
        periodMetrics.copilot_dotcom_chat.total_chats += daily.copilot_dotcom_chat.total_chats || 0;
        daily.copilot_dotcom_chat.models?.forEach(model => {
          let modelTotals = periodMetrics.copilot_dotcom_chat.models.find(m => m.name === model.name);
          if (modelTotals) {
            modelTotals.total_chats += model.total_chats || 0;
          } else {
            modelTotals = {
              name: model.name,
              total_chats: model.total_chats
            }
            periodMetrics.copilot_dotcom_chat.models.push(modelTotals);
          }
        });
      }

      if (daily.copilot_dotcom_pull_requests) {
        periodMetrics.copilot_dotcom_pull_requests.total_pr_summaries_created += daily.copilot_dotcom_pull_requests.total_pr_summaries_created || 0;
        daily.copilot_dotcom_pull_requests.repositories?.forEach(repository => {
          let repositoryTotals = periodMetrics.copilot_dotcom_pull_requests.repositories.find(r => r.name === repository.name);
          if (repositoryTotals) {
            repositoryTotals.total_pr_summaries_created += repository.total_pr_summaries_created || 0;
          } else {
            repositoryTotals = {
              name: repository.name,
              total_pr_summaries_created: repository.total_pr_summaries_created,
              models: []
            }
            periodMetrics.copilot_dotcom_pull_requests.repositories.push(repositoryTotals);
          }
          repository.models?.forEach(model => {
            const repositoryModelTotals = repositoryTotals?.models.find(m => m.name === model.name);
            if (repositoryModelTotals) {
              repositoryModelTotals.total_pr_summaries_created += model.total_pr_summaries_created || 0;
            } else {
              repositoryTotals?.models.push({
                name: model.name,
                total_pr_summaries_created: model.total_pr_summaries_created
              });
            }
          });
        });
      }
    });

    return periodMetrics;
  }

  async insertMetrics(org: string, data: MetricDailyResponseType[], team?: string) {
    const where = {
      org: org,
      ...team ? { team } : undefined,
    }
    const Metrics = mongoose.model('Metrics');
    for (const day of data) {
      // const parts = day.date.split('-').map(Number);
      // const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + 1));

      if (day.copilot_ide_code_completions) {
        day.copilot_ide_code_completions.total_code_acceptances = 0;
        day.copilot_ide_code_completions.total_code_suggestions = 0;
        day.copilot_ide_code_completions.total_code_lines_accepted = 0;
        day.copilot_ide_code_completions.total_code_lines_suggested = 0;
        day.copilot_ide_code_completions.editors?.forEach(editor => {
          editor.models?.forEach(model => {
            model.total_code_acceptances = 0;
            model.total_code_suggestions = 0;
            model.total_code_lines_accepted = 0;
            model.total_code_lines_suggested = 0;
            editor.total_code_acceptances = 0;
            editor.total_code_suggestions = 0;
            editor.total_code_lines_accepted = 0;
            editor.total_code_lines_suggested = 0;
            model.languages?.forEach(language => {
              model.total_code_acceptances += language.total_code_acceptances || 0;
              model.total_code_suggestions += language.total_code_suggestions || 0;
              model.total_code_lines_accepted += language.total_code_lines_accepted || 0;
              model.total_code_lines_suggested += language.total_code_lines_suggested || 0;
            });
            editor.total_code_acceptances += model.total_code_acceptances || 0;
            editor.total_code_suggestions += model.total_code_suggestions || 0;
            editor.total_code_lines_accepted += model.total_code_lines_accepted || 0;
            editor.total_code_lines_suggested += model.total_code_lines_suggested || 0;
          });
          if (day.copilot_ide_code_completions) {
            day.copilot_ide_code_completions.total_code_acceptances += editor.total_code_acceptances || 0;
            day.copilot_ide_code_completions.total_code_suggestions += editor.total_code_suggestions || 0;
            day.copilot_ide_code_completions.total_code_lines_accepted += editor.total_code_lines_accepted || 0;
            day.copilot_ide_code_completions.total_code_lines_suggested += editor.total_code_lines_suggested || 0;
          }
        });
      }
      if (day.copilot_ide_chat) {
        day.copilot_ide_chat.total_chats = 0;
        day.copilot_ide_chat.total_chat_copy_events = 0;
        day.copilot_ide_chat.total_chat_insertion_events = 0;
        day.copilot_ide_chat.editors?.forEach(editor => {
          editor.total_chats = 0;
          editor.total_chat_copy_events = 0;
          editor.total_chat_insertion_events = 0;
          editor.models?.forEach(model => {
            editor.total_chats += model.total_chats;
            editor.total_chat_copy_events += model.total_chat_copy_events || 0;
            editor.total_chat_insertion_events += model.total_chat_insertion_events || 0;
          });
          if (day.copilot_ide_chat) {
            day.copilot_ide_chat.total_chats += editor.total_chats;
            day.copilot_ide_chat.total_chat_copy_events += editor.total_chat_copy_events;
            day.copilot_ide_chat.total_chat_insertion_events += editor.total_chat_insertion_events;
          }
        });
      }
      if (day.copilot_dotcom_chat) {
        day.copilot_dotcom_chat.total_chats = 0;
        day.copilot_dotcom_chat.models?.forEach(model => {
          if (day.copilot_dotcom_chat) {
            day.copilot_dotcom_chat.total_chats += model.total_chats;
          }
        });
      }
      if (day.copilot_dotcom_pull_requests) {
        day.copilot_dotcom_pull_requests.total_pr_summaries_created = 0;
        day.copilot_dotcom_pull_requests.repositories?.forEach(repository => {
          repository.total_pr_summaries_created = 0;
          repository.models?.forEach(model => {
            repository.total_pr_summaries_created += model.total_pr_summaries_created;
          });
          if (day.copilot_dotcom_pull_requests) {
            day.copilot_dotcom_pull_requests.total_pr_summaries_created += repository.total_pr_summaries_created;
          }
        });
      }

      console.log('day', day.date)
      await Metrics.findOneAndUpdate(
        { date: day.date, org, team },
        { ...day },
        { upsert: true }
      );
    }
  }

}

export default new MetricsService();