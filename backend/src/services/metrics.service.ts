import { MetricDailyResponseType } from "../models/metrics.model.js";
import mongoose from "mongoose";

export interface MetricsQueryParams {
  type?: string,
  since?: string,
  until?: string,
  editor?: string,
  language?: string,
  model?: string,
  org?: string
};

class MetricsService {
  async getMetrics(params: MetricsQueryParams) {
    const { org, type, since, until, editor, language, model } = params;
    
    const dateFilter = {
      ...(since && { $gte: new Date(since) }),
      ...(until && { $lte: new Date(until) })
    };

    const query: any = {
      ...(org && { org }),
      ...(Object.keys(dateFilter).length && { date: dateFilter })
    };

    const types = type ? type.split(/[ ,]+/) : [];

    const metrics = await mongoose.model('Metrics').find(query).lean();

    if (editor || language || model) {
      metrics.forEach(metric => {
        if (metric.copilot_ide_code_completions) {
          metric.copilot_ide_code_completions.editors = metric.copilot_ide_code_completions.editors.filter((editorItem: any) => {
            if (editor && editorItem.name !== editor) return false;
            if (model) {
              editorItem.models = editorItem.models.filter((modelItem: any) => {
                if (modelItem.name !== model) return false;
                if (language) {
                  modelItem.languages = modelItem.languages.filter((languageItem: any) => languageItem.name === language);
                }
                return true;
              });
            }
            return true;
          });
        }
        if (metric.copilot_ide_chat) {
          metric.copilot_ide_chat.editors = metric.copilot_ide_chat.editors.filter((editorItem: any) => {
            if (editor && editorItem.name !== editor) return false;
            if (model) {
              editorItem.models = editorItem.models.filter((modelItem: any) => {
                if (modelItem.name !== model) return false;
                return true;
              });
            }
            return true;
          });
        }
        if (metric.copilot_dotcom_chat) {
          metric.copilot_dotcom_chat.models = metric.copilot_dotcom_chat.models.filter((modelItem: any) => {
            if (modelItem.name !== model) return false;
            return true;
          });
        }
        if (metric.copilot_dotcom_pull_requests) {
          metric.copilot_dotcom_pull_requests.repositories = metric.copilot_dotcom_pull_requests.repositories.filter((repositoryItem: any) => {
            if (model) {
              repositoryItem.models = repositoryItem.models.filter((modelItem: any) => {
                if (modelItem.name !== model) return false;
                return true;
              });
            }
            return true;
          });
        }
      });
    }

    return metrics;
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

    metrics.forEach((daily: any) => {
      if (daily.copilot_ide_code_completions) {
        periodMetrics.copilot_ide_code_completions.total_code_acceptances += daily.copilot_ide_code_completions.total_code_acceptances || 0;
        periodMetrics.copilot_ide_code_completions.total_code_suggestions += daily.copilot_ide_code_completions.total_code_suggestions || 0;
        periodMetrics.copilot_ide_code_completions.total_code_lines_accepted += daily.copilot_ide_code_completions.total_code_lines_accepted || 0;
        periodMetrics.copilot_ide_code_completions.total_code_lines_suggested += daily.copilot_ide_code_completions.total_code_lines_suggested || 0;
        daily.copilot_ide_code_completions.editors?.forEach((editor: any) => {
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
          editor.models?.forEach((model: any) => {
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
            model.languages?.forEach((language: any) => {
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
        daily.copilot_ide_chat.editors?.forEach((editor: any) => {
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
          editor.models?.forEach((model: any) => {
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
        daily.copilot_dotcom_chat.models?.forEach((model: any) => {
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
        daily.copilot_dotcom_pull_requests.repositories?.forEach((repository: any) => {
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
          repository.models?.forEach((model: any) => {
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

      await Metrics.findOneAndUpdate(
        { date: day.date, org, team },
        { ...day },
        { upsert: true }
      );
    }
  }

}

export default new MetricsService();